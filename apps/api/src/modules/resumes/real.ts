import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { z } from 'zod';
import { config } from '../../config';
import { storageProvider } from '../../core/storage';
import { jobQueue } from '../../core/queue';
import { eventBus } from '../../core/eventBus';
import { DomainEvent } from '@skillforge/contract';
import { prisma, actor, fail, parseJson } from '../ai/member2/db';
import { taxonomy } from '../ai/member2/candidates';
import { callAI } from '../ai/member2/transport';

export interface ScanProvider {
  scan(data: Buffer): Promise<void>;
}
export const scanProvider: ScanProvider = {
  async scan(data) {
    if (!data.subarray(0, 5).equals(Buffer.from('%PDF-')))
      fail(400, 'INVALID_FILE', 'The file contents must be a PDF.');
    if (
      /\/JavaScript\b|\/JS\s*\(|\/Launch\b|EICAR-STANDARD-ANTIVIRUS-TEST-FILE/.test(
        data.toString('latin1')
      )
    )
      fail(
        400,
        'UNSAFE_FILE',
        'Active or unsafe PDF content is not supported.'
      );
  },
};
const working = new Set<string>();
const signingKey =
  config.RESUME_SIGNING_SECRET || crypto.randomBytes(32).toString('hex');
const digest = (value: string | Buffer) =>
  crypto.createHash('sha256').update(value).digest('hex');
const filePath = (key: string) =>
  path.join(process.cwd(), 'uploads', path.basename(key));

async function owned(id: string, userId: string) {
  await actor(userId);
  const resume = await prisma.resume.findUnique({ where: { id } });
  if (!resume || resume.userId !== userId)
    fail(404, 'NOT_FOUND', 'Resume not found.');
  return resume!;
}

async function setStatus(id: string, status: string, error?: string) {
  const current = await prisma.resume.findUnique({ where: { id } });
  if (!current) return;
  const history = parseJson<any[]>(current.statusHistory, []);
  history.push({ status, at: new Date().toISOString() });
  await prisma.resume.update({
    where: { id },
    data: {
      status,
      statusHistory: JSON.stringify(history),
      lastError: error || null,
    },
  });
}

export async function parseResumeJob(id: string) {
  if (working.has(id)) return;
  working.add(id);
  try {
    const resume = await prisma.resume.findUnique({ where: { id } });
    if (!resume?.fileKey || ['ready', 'confirmed'].includes(resume.status))
      return;
    for (let attempt = resume.attempts; attempt < 3; attempt++) {
      await prisma.resume.update({
        where: { id },
        data: { attempts: attempt + 1 },
      });
      await setStatus(id, 'parsing');
      try {
        const buffer = await fs.readFile(filePath(resume.fileKey));
        const response = await callAI(
          '/ai/resume/parse',
          {
            resumeId: id,
            dataBase64: buffer.toString('base64'),
            taxonomy: await taxonomy(),
          },
          'AI_RESUME_SOURCE'
        );
        await prisma.resumeExtraction.create({
          data: {
            resumeId: id,
            data: JSON.stringify({ ...response.data, mode: response.mode }),
          },
        });
        await setStatus(id, 'ready');
        const extraction = await prisma.resumeExtraction.findFirst({
          where: { resumeId: id },
          orderBy: { createdAt: 'desc' },
        });
        eventBus.emitEvent(DomainEvent.ResumeParsed, {
          resumeId: id,
          extractionId: extraction!.id,
        });
        return;
      } catch (error: any) {
        const retryable = error.status === 503;
        if (!retryable || attempt === 2) {
          await setStatus(
            id,
            'failed',
            error.message ||
              'The resume could not be parsed. Continue manually or retry.'
          );
          return;
        }
        await setStatus(
          id,
          'retrying',
          'The intelligence service is taking longer than usual. Retrying.'
        );
        await new Promise((resolve) =>
          setTimeout(resolve, config.RESUME_RETRY_DELAY_MS * 2 ** attempt)
        );
      }
    }
  } finally {
    working.delete(id);
  }
}

jobQueue.process<{ resumeId: string }>('member2.parse-resume', (job) =>
  parseResumeJob(job.data.resumeId)
);
export async function recoverResumeJobs() {
  const pending = await prisma.resume.findMany({
    where: { status: { in: ['pending', 'parsing', 'retrying'] } },
  });
  for (const r of pending) {
    if (r.attempts >= 3)
      await setStatus(
        r.id,
        'failed',
        'Parsing was interrupted. Retry to continue.'
      );
    else await jobQueue.add('member2.parse-resume', { resumeId: r.id });
  }
}

const decisionSchema = z.object({
  extractionId: z.string(),
  decisions: z
    .array(
      z.object({
        id: z.string(),
        action: z.enum(['accepted', 'edited', 'discarded']),
        value: z.record(z.string().max(10000)).optional(),
      })
    )
    .max(500),
});

export class RealService {
  async handle() {
    return {};
  }
  async list(userId: string) {
    await actor(userId);
    return {
      data: await prisma.resume.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          fileName: true,
          status: true,
          createdAt: true,
          attempts: true,
          lastError: true,
        },
      }),
    };
  }
  async upload(
    userId: string,
    file: { originalname: string; mimetype: string; buffer: Buffer }
  ) {
    await actor(userId);
    if (
      !/\.pdf$/i.test(file.originalname) ||
      !['application/pdf', 'application/octet-stream'].includes(file.mimetype)
    )
      fail(400, 'INVALID_FILE', 'Upload a PDF resume.');
    if (!file.buffer.length || file.buffer.length > 10 * 1024 * 1024)
      fail(400, 'FILE_TOO_LARGE', 'Upload a non-empty PDF up to 10 MB.');
    await scanProvider.scan(file.buffer);
    const hash = digest(file.buffer);
    const existing = await prisma.resume.findUnique({
      where: { userId_hash: { userId, hash } },
    });
    if (existing)
      return {
        data: { id: existing.id, status: existing.status, reused: true },
      };
    const key = `resume-${crypto.randomUUID()}.pdf`;
    await storageProvider.upload(key, file.buffer, 'application/pdf');
    try {
      const resume = await prisma.resume.create({
        data: {
          userId,
          url: '',
          fileKey: key,
          fileName: path.basename(file.originalname).slice(0, 200),
          fileSize: file.buffer.length,
          hash,
          status: 'pending',
          statusHistory: JSON.stringify([
            { status: 'pending', at: new Date().toISOString() },
          ]),
        },
      });
      await jobQueue.add('member2.parse-resume', { resumeId: resume.id });
      eventBus.emitEvent(DomainEvent.ResumeUploaded, {
        userId,
        resumeId: resume.id,
      });
      return { data: { id: resume.id, status: resume.status, reused: false } };
    } catch (e: any) {
      await storageProvider.delete(key);
      if (e.code === 'P2002') {
        const duplicate = await prisma.resume.findUnique({
          where: { userId_hash: { userId, hash } },
        });
        if (duplicate)
          return {
            data: { id: duplicate.id, status: duplicate.status, reused: true },
          };
      }
      throw e;
    }
  }
  async get(id: string, userId: string) {
    const r = await owned(id, userId);
    return {
      data: {
        id: r.id,
        fileName: r.fileName,
        fileSize: r.fileSize,
        status: r.status,
        attempts: r.attempts,
        lastError: r.lastError,
        createdAt: r.createdAt,
        statusHistory: parseJson(r.statusHistory, []),
      },
    };
  }
  async extraction(id: string, userId: string) {
    const r = await owned(id, userId);
    const row = await prisma.resumeExtraction.findFirst({
      where: { resumeId: id },
      orderBy: { createdAt: 'desc' },
    });
    if (row)
      await prisma.resumeAccessLog.create({
        data: { userId, resumeId: id, action: 'review' },
      });
    return {
      data: row
        ? {
            id: row.id,
            resumeId: id,
            confirmedAt: row.confirmedAt,
            decisions: parseJson(row.decisionsJson, []),
            ...parseJson<object>(row.data, {}),
          }
        : null,
      status: r.status,
    };
  }
  async confirm(id: string, userId: string, input: unknown) {
    await owned(id, userId);
    const body = decisionSchema.parse(input);
    if (new Set(body.decisions.map((d) => d.id)).size !== body.decisions.length)
      fail(400, 'INVALID_DECISIONS', 'Each extracted item needs one decision.');
    const hash = digest(
      JSON.stringify(
        [...body.decisions].sort((a, b) => a.id.localeCompare(b.id))
      )
    );
    return prisma
      .$transaction(async (tx) => {
        const extraction = await tx.resumeExtraction.findUnique({
          where: { id: body.extractionId },
        });
        if (!extraction || extraction.resumeId !== id)
          fail(404, 'NOT_FOUND', 'Extraction not found.');
        if (extraction!.confirmedAt) {
          if (extraction!.decisionsHash !== hash)
            fail(
              409,
              'ALREADY_CONFIRMED',
              'This extraction was already confirmed with different decisions.'
            );
          return { data: { confirmed: true, reused: true } };
        }
        const data = parseJson<any>(extraction!.data, {});
        const items: any[] = [
          'skills',
          'education',
          'experience',
          'certifications',
          'links',
          'projects',
        ].flatMap((k) => data[k] || []);
        const allSkills = await tx.skill.findMany({
          include: { aliases: true },
        });
        for (const decision of body.decisions) {
          const item = items.find((v) => v.id === decision.id);
          if (!item)
            fail(
              400,
              'INVALID_DECISIONS',
              'A decision references an item outside this extraction.'
            );
          if (decision.action === 'discarded') continue;
          const value =
            decision.action === 'edited'
              ? { ...item.value, ...decision.value }
              : item.value;
          const origin =
            decision.action === 'edited' ? 'resume_ai_edited' : 'resume_ai';
          const sourceId = `${extraction!.id}:${item.id}`;
          const text = (v: unknown) =>
            z.string().trim().min(1).max(500).parse(v);
          if (item.section === 'skills') {
            const normalize = (v: string) =>
              v.toLowerCase().replace(/[^a-z0-9+#]/g, '');
            const requestedName = text(value.name);
            const skill = allSkills.find((s) =>
              [s.name, ...s.aliases.map((a) => a.alias)].some(
                (name) => normalize(name) === normalize(requestedName)
              )
            );
            if (!skill)
              fail(
                422,
                'UNKNOWN_SKILL',
                'Choose a canonical skill before saving it.'
              );
            const level = z
              .enum(['beginner', 'intermediate', 'advanced', 'expert'])
              .parse(value.level || 'intermediate');
            const existing = await tx.userSkill.findFirst({
              where: { userId, skillId: skill!.id },
            });
            if (!existing)
              await tx.userSkill.create({
                data: { userId, skillId: skill!.id, level, origin, sourceId },
              });
            await tx.skillEvidence.upsert({
              where: {
                userId_skillId_sourceType_sourceId: {
                  userId,
                  skillId: skill!.id,
                  sourceType: 'resume',
                  sourceId,
                },
              },
              update: {},
              create: {
                userId,
                skillId: skill!.id,
                type: 'resume_extracted',
                sourceType: 'resume',
                sourceId,
              },
            });
          } else if (item.section === 'education') {
            await tx.education.create({
              data: {
                userId,
                institution: text(value.institution),
                degree: text(value.degree),
                origin,
                sourceId,
                detailsJson: JSON.stringify(value),
              },
            });
          } else if (item.section === 'experience') {
            await tx.workExperience.create({
              data: {
                userId,
                company: text(value.company),
                role: text(value.role),
                origin,
                sourceId,
                detailsJson: JSON.stringify(value),
              },
            });
          } else if (item.section === 'certifications') {
            await tx.certification.create({
              data: {
                userId,
                name: text(value.name),
                origin,
                sourceId,
                detailsJson: JSON.stringify(value),
              },
            });
          }
        }
        // Links and project excerpts stay in the review record; those profile tables
        // do not yet exist. The API returns this explicitly instead of losing data.
        await tx.resumeExtraction.update({
          where: { id: extraction!.id },
          data: {
            confirmedAt: new Date(),
            decisionsHash: hash,
            decisionsJson: JSON.stringify(body.decisions),
          },
        });
        const current = await tx.resume.findUnique({ where: { id } });
        await tx.resume.update({
          where: { id },
          data: {
            status: 'confirmed',
            statusHistory: JSON.stringify([
              ...parseJson<any[]>(current?.statusHistory, []),
              { status: 'confirmed', at: new Date().toISOString() },
            ]),
          },
        });
        return {
          data: {
            confirmed: true,
            reused: false,
            retainedInReview: body.decisions
              .filter(
                (d) =>
                  items.find(
                    (i) =>
                      i.id === d.id && ['links', 'projects'].includes(i.section)
                  ) && d.action !== 'discarded'
              )
              .map((d) => d.id),
          },
        };
      })
      .then((result) => {
        if (!result.data.reused)
          eventBus.emitEvent(DomainEvent.ProfileUpdated, { userId });
        return result;
      });
  }
  async retry(id: string, userId: string) {
    const r = await owned(id, userId);
    if (r.status !== 'failed')
      fail(409, 'NOT_RETRYABLE', 'Only failed extractions can be retried.');
    await prisma.resume.update({ where: { id }, data: { attempts: 0 } });
    await setStatus(id, 'pending');
    await jobQueue.add('member2.parse-resume', { resumeId: id });
    return { data: { id, status: 'pending' } };
  }
  async downloadUrl(id: string, userId: string) {
    await owned(id, userId);
    const expires = Math.floor(Date.now() / 1000) + 300;
    const token = crypto
      .createHmac('sha256', signingKey)
      .update(`${id}:${userId}:${expires}`)
      .digest('hex');
    return {
      data: {
        url: `/api/v1/resumes/${id}/file?expires=${expires}&token=${token}`,
        expiresAt: new Date(expires * 1000).toISOString(),
      },
    };
  }
  async download(id: string, userId: string, expires: string, token: string) {
    const r = await owned(id, userId);
    const expiry = Number(expires),
      now = Math.floor(Date.now() / 1000);
    const expected = crypto
      .createHmac('sha256', signingKey)
      .update(`${id}:${userId}:${expires}`)
      .digest('hex');
    if (
      !Number.isSafeInteger(expiry) ||
      expiry <= now ||
      expiry > now + 300 ||
      !/^[a-f0-9]{64}$/.test(token) ||
      !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    )
      fail(
        403,
        'INVALID_DOWNLOAD',
        'This download link is invalid or expired.'
      );
    if (!r.fileKey) fail(404, 'NOT_FOUND', 'Original file not available.');
    await prisma.resumeAccessLog.create({
      data: { userId, resumeId: id, action: 'download' },
    });
    return {
      buffer: await fs.readFile(filePath(r.fileKey!)),
      fileName: r.fileName || 'resume.pdf',
    };
  }
  async delete(id: string, userId: string) {
    const r = await owned(id, userId);
    if (working.has(id))
      fail(
        409,
        'PROCESSING',
        'Wait for parsing to finish before deleting this resume.'
      );
    await prisma.$transaction([
      prisma.resumeExtraction.deleteMany({ where: { resumeId: id } }),
      prisma.resume.delete({ where: { id } }),
    ]);
    if (r.fileKey) await storageProvider.delete(r.fileKey);
    // Confirmed profile entries and their source-attributed evidence remain intact.
    return { data: { deleted: true } };
  }
}
export const realService = new RealService();
