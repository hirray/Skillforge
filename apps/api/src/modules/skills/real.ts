import { PrismaClient } from '@prisma/client';
import { writeAudit } from '../../core/audit';

const prisma = new PrismaClient();

export class RealSkillsService {
  /**
   * GET /skills?q=&category=&limit=
   * Ranked search matching canonical skill names and aliases.
   */
  async searchSkills(params: { q?: string; category?: string; limit?: number }) {
    const q = (params.q || '').trim().toLowerCase();
    const limit = Math.min(params.limit || 50, 100);

    const skills = await prisma.skill.findMany({
      include: {
        aliases: true,
      },
      orderBy: { name: 'asc' },
    });

    if (!q) {
      const filtered = skills
        .filter((s) => !params.category || s.category.toLowerCase() === params.category.toLowerCase())
        .slice(0, limit);

      return {
        data: filtered.map((s) => ({
          id: s.id,
          name: s.name,
          category: s.category,
          status: s.status || 'active',
          description: s.description,
          aliases: s.aliases.map((a) => a.alias),
          mergedIntoId: s.mergedIntoId,
        })),
        total: filtered.length,
      };
    }

    const scored = skills
      .map((s) => {
        const sName = s.name.toLowerCase();
        let score = 0;

        if (sName === q) {
          score = 100;
        } else if (sName.startsWith(q)) {
          score = 80;
        } else if (s.aliases.some((a) => a.alias.toLowerCase() === q)) {
          score = 75;
        } else if (sName.includes(q)) {
          score = 60;
        } else if (s.aliases.some((a) => a.alias.toLowerCase().includes(q))) {
          score = 40;
        }

        if (params.category && s.category.toLowerCase() !== params.category.toLowerCase()) {
          score = 0;
        }

        return { skill: s, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score || a.skill.name.localeCompare(b.skill.name))
      .slice(0, limit);

    return {
      data: scored.map(({ skill }) => ({
        id: skill.id,
        name: skill.name,
        category: skill.category,
        status: skill.status || 'active',
        description: skill.description,
        aliases: skill.aliases.map((a) => a.alias),
        mergedIntoId: skill.mergedIntoId,
      })),
      total: scored.length,
    };
  }

  /**
   * GET /skills/:id
   */
  async getSkillById(id: string) {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        aliases: true,
      },
    });

    if (!skill) {
      throw { status: 404, message: 'Skill not found in taxonomy.' };
    }

    let mergedTarget = null;
    if (skill.mergedIntoId) {
      mergedTarget = await prisma.skill.findUnique({
        where: { id: skill.mergedIntoId },
      });
    }

    return {
      id: skill.id,
      name: skill.name,
      category: skill.category,
      status: skill.status || 'active',
      description: skill.description,
      aliases: skill.aliases.map((a) => a.alias),
      mergedIntoId: skill.mergedIntoId,
      canonicalSkill: mergedTarget ? { id: mergedTarget.id, name: mergedTarget.name } : null,
    };
  }

  /**
   * POST /skills/proposals
   */
  async proposeSkill(userId: string, data: { name: string; category: string; reason?: string }) {
    const normalizedName = data.name.trim();

    // Check if canonical already exists
    const existing = await prisma.skill.findFirst({
      where: {
        name: { equals: normalizedName },
      },
    });
    if (existing) {
      return {
        status: 'already_exists',
        message: 'This skill already exists in the canonical taxonomy.',
        skill: existing,
      };
    }

    // Check if alias matches existing skill
    const existingAlias = await prisma.skillAlias.findFirst({
      where: {
        alias: { equals: normalizedName },
      },
      include: { skill: true },
    });
    if (existingAlias) {
      return {
        status: 'alias_exists',
        message: `This skill name is already mapped to canonical skill "${existingAlias.skill.name}".`,
        skill: existingAlias.skill,
      };
    }

    // Check existing pending proposal
    const existingProposal = await prisma.skillProposal.findFirst({
      where: {
        canonicalName: { equals: normalizedName },
        status: 'pending',
      },
    });

    if (existingProposal) {
      const updated = await prisma.skillProposal.update({
        where: { id: existingProposal.id },
        data: {
          requestCount: { increment: 1 },
        },
      });
      return {
        status: 'proposal_updated',
        message: 'A proposal for this skill already exists. Your vote has been recorded.',
        proposal: {
          ...updated,
          name: updated.canonicalName,
          proposalCount: updated.requestCount,
        },
      };
    }

    const proposal = await prisma.skillProposal.create({
      data: {
        canonicalName: normalizedName,
        category: data.category,
        proposedBy: userId,
        status: 'pending',
        requestCount: 1,
      },
    });

    return {
      status: 'submitted',
      message: 'Skill proposed successfully for taxonomy review.',
      proposal: {
        ...proposal,
        name: proposal.canonicalName,
        proposalCount: proposal.requestCount,
      },
    };
  }

  /**
   * Admin: GET /skills/admin/proposals
   */
  async listProposals(status?: string) {
    const where: any = {};
    if (status) where.status = status;
    const proposals = await prisma.skillProposal.findMany({
      where,
      orderBy: [{ requestCount: 'desc' }, { createdAt: 'desc' }],
    });
    return {
      data: proposals.map((p) => ({
        ...p,
        name: p.canonicalName,
        proposalCount: p.requestCount,
      })),
    };
  }

  /**
   * Admin: POST /skills/admin/proposals/:id/approve
   */
  async approveProposal(proposalId: string, adminId: string) {
    const proposal = await prisma.skillProposal.findUnique({ where: { id: proposalId } });
    if (!proposal) throw { status: 404, message: 'Proposal not found' };

    const newSkillId = `skill-${proposal.canonicalName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

    // Create canonical skill
    const created = await prisma.skill.create({
      data: {
        id: newSkillId,
        name: proposal.canonicalName,
        category: proposal.category,
        status: 'active',
      },
    });

    await prisma.skillProposal.update({
      where: { id: proposalId },
      data: { status: 'approved' },
    });

    await writeAudit(adminId, 'APPROVE_SKILL_PROPOSAL', 'Skill', created.id);

    return { success: true, skill: created };
  }

  /**
   * Admin: POST /skills/admin/proposals/:id/reject
   */
  async rejectProposal(proposalId: string, adminId: string, reason?: string) {
    const proposal = await prisma.skillProposal.update({
      where: { id: proposalId },
      data: {
        status: 'rejected',
      },
    });

    await writeAudit(adminId, 'REJECT_SKILL_PROPOSAL', 'SkillProposal', proposalId, reason);

    return {
      success: true,
      proposal: {
        ...proposal,
        name: proposal.canonicalName,
        proposalCount: proposal.requestCount,
      },
    };
  }

  /**
   * Admin: POST /skills/admin/merge
   */
  async mergeSkills(fromSkillId: string, toSkillId: string, adminId: string, reason?: string) {
    if (fromSkillId === toSkillId) {
      throw { status: 400, message: 'Source and target skills must be distinct.' };
    }

    const [fromSkill, toSkill] = await Promise.all([
      prisma.skill.findUnique({ where: { id: fromSkillId } }),
      prisma.skill.findUnique({ where: { id: toSkillId } }),
    ]);

    if (!fromSkill || !toSkill) {
      throw { status: 404, message: 'One or both skills not found.' };
    }

    const affectedUserSkills = await prisma.userSkill.count({
      where: { skillId: fromSkillId },
    });

    await prisma.$transaction(async (tx) => {
      // 1. Mark fromSkill as merged
      await tx.skill.update({
        where: { id: fromSkillId },
        data: {
          status: 'merged',
          mergedIntoId: toSkillId,
        },
      });

      // 2. Add fromSkill name as alias to toSkill
      await tx.skillAlias.upsert({
        where: { id: `alias-${fromSkill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}` },
        create: {
          id: `alias-${fromSkill.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
          skillId: toSkillId,
          alias: fromSkill.name,
        },
        update: {
          skillId: toSkillId,
        },
      });

      // 3. Move UserSkills where user doesn't already have toSkill
      const existingUserSkills = await tx.userSkill.findMany({
        where: { skillId: fromSkillId },
      });

      for (const us of existingUserSkills) {
        const hasTarget = await tx.userSkill.findFirst({
          where: {
            userId: us.userId,
            skillId: toSkillId,
          },
        });

        if (!hasTarget) {
          await tx.userSkill.update({
            where: { id: us.id },
            data: { skillId: toSkillId },
          });
        } else {
          await tx.userSkill.delete({ where: { id: us.id } });
        }
      }

      // 4. Log SkillMergeRecord
      await tx.skillMergeRecord.create({
        data: {
          sourceSkillId: fromSkillId,
          targetSkillId: toSkillId,
          mergedBy: adminId,
          reason: reason || 'Taxonomy duplicate consolidation',
          movedRowIdsJson: JSON.stringify(existingUserSkills.map((u) => u.id)),
        },
      });
    });

    await writeAudit(adminId, 'MERGE_SKILLS', 'Skill', toSkillId, reason, { fromSkillId, toSkillId, affectedUserSkills });

    return {
      success: true,
      message: `Successfully merged "${fromSkill.name}" into "${toSkill.name}".`,
      affectedUserSkills,
    };
  }

  /**
   * Admin: POST /skills/admin/deprecate
   */
  async deprecateSkill(skillId: string, adminId: string, reason?: string) {
    const skill = await prisma.skill.update({
      where: { id: skillId },
      data: { status: 'deprecated' },
    });

    await writeAudit(adminId, 'DEPRECATE_SKILL', 'Skill', skillId, reason);

    return { success: true, skill };
  }

  /**
   * POST /skills/:id/evidence
   */
  async addEvidence(skillId: string, userId: string, data: { url: string; title?: string; type: string }) {
    const userSkill = await prisma.userSkill.findFirst({
      where: {
        userId,
        skillId,
      },
    });

    if (!userSkill) {
      throw { status: 404, message: 'You do not have this skill associated with your profile.' };
    }

    let existingLinks: any[] = [];
    if (userSkill.sourceId && userSkill.sourceId.startsWith('[')) {
      try {
        existingLinks = JSON.parse(userSkill.sourceId);
      } catch {}
    }

    const newEvidence = {
      id: `ev-${Date.now()}`,
      url: data.url,
      title: data.title || data.url,
      type: data.type,
      addedAt: new Date().toISOString(),
    };

    existingLinks.push(newEvidence);

    await prisma.userSkill.update({
      where: { id: userSkill.id },
      data: {
        sourceId: JSON.stringify(existingLinks),
      },
    });

    return { success: true, evidence: newEvidence, totalEvidence: existingLinks.length };
  }

  /**
   * GET /skills/:id/evidence
   */
  async listEvidence(skillId: string, userId: string) {
    const userSkill = await prisma.userSkill.findFirst({
      where: {
        userId,
        skillId,
      },
    });

    if (!userSkill || !userSkill.sourceId || !userSkill.sourceId.startsWith('[')) {
      return { data: [] };
    }

    try {
      return { data: JSON.parse(userSkill.sourceId) };
    } catch {
      return { data: [] };
    }
  }
}
