import { Certificate, PublicCertificateView, ErrorCode } from '@skillforge/contract';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export class MockService {
  private mockCerts: Certificate[] = [
    {
      id: 'cert-001',
      userId: 'user-001',
      projectId: 'proj-001',
      certNumber: 'SF-2026-00042',
      recipientName: 'Arjun Rao',
      projectName: 'SkillForge Monorepo & AI Intelligence Suite',
      roles: ['Fullstack Lead', 'Core Contributor'],
      technologies: ['TypeScript', 'React', 'Node.js', 'Prisma', 'SQLite'],
      duration: '4 months',
      completedAt: '2026-11-20T12:00:00.000Z',
      issuerName: 'SkillForge Attestation Authority',
      url: '/verify/SF-2026-00042',
      pdfUrl: '/api/v1/certificates/cert-001/pdf',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://skillforge.dev/verify/SF-2026-00042',
      status: 'valid',
      version: 1,
      showTechnologies: true,
      showDuration: true,
      createdAt: '2026-11-20T12:00:00.000Z',
    },
    {
      id: 'cert-002',
      userId: 'user-002',
      projectId: 'proj-002',
      certNumber: 'SF-2026-00043',
      recipientName: 'Maya Chen',
      projectName: 'Winter Global AI & Agentic Sprint 2026',
      roles: ['Systems Architect'],
      technologies: ['Python', 'FastAPI', 'Redis', 'Docker'],
      duration: '6 weeks',
      completedAt: '2026-11-15T10:00:00.000Z',
      issuerName: 'SkillForge Attestation Authority',
      url: '/verify/SF-2026-00043',
      pdfUrl: '/api/v1/certificates/cert-002/pdf',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://skillforge.dev/verify/SF-2026-00043',
      status: 'valid',
      version: 1,
      showTechnologies: true,
      showDuration: true,
      createdAt: '2026-11-15T10:00:00.000Z',
    },
  ];

  async getCertificates(userId: string): Promise<Certificate[]> {
    return this.mockCerts.filter(c => c.userId === userId);
  }

  async verifyCertificate(certIdOrNumber: string): Promise<{ valid: boolean; status: string; certificate: PublicCertificateView | null }> {
    const cert = this.mockCerts.find(c => c.id === certIdOrNumber || c.certNumber === certIdOrNumber);
    if (!cert) {
      return { valid: false, status: 'not_found', certificate: null };
    }

    if (cert.status === 'revoked') {
      return {
        valid: false,
        status: 'revoked',
        certificate: {
          certNumber: cert.certNumber,
          status: 'revoked',
          recipientName: cert.recipientName,
          projectName: cert.projectName,
          roles: cert.roles,
          completedAt: cert.completedAt,
          issuerName: cert.issuerName,
          verifiedAt: cert.completedAt,
          verificationUrl: `/verify/${cert.certNumber}`,
          revokedReason: cert.revokedReason || 'Revoked by authority',
          revokedAt: cert.revokedAt || new Date().toISOString(),
        },
      };
    }

    return {
      valid: true,
      status: 'valid',
      certificate: {
        certNumber: cert.certNumber,
        status: 'valid',
        recipientName: cert.recipientName,
        projectName: cert.projectName,
        roles: cert.roles,
        technologies: cert.showTechnologies ? cert.technologies : undefined,
        duration: cert.showDuration ? cert.duration : undefined,
        completedAt: cert.completedAt,
        issuerName: cert.issuerName,
        verifiedAt: cert.completedAt,
        verificationUrl: `/verify/${cert.certNumber}`,
      },
    };
  }

  async revokeCertificate(id: string, reason: string, adminId: string): Promise<Certificate> {
    const cert = this.mockCerts.find(c => c.id === id || c.certNumber === id);
    if (!cert) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Certificate not found' };
    }
    cert.status = 'revoked';
    cert.revokedReason = reason;
    cert.revokedAt = new Date().toISOString();
    cert.revokedBy = adminId;
    return cert;
  }

  async updateShareSettings(id: string, settings: { showTechnologies?: boolean; showDuration?: boolean }, userId: string): Promise<Certificate> {
    const cert = this.mockCerts.find(c => (c.id === id || c.certNumber === id) && c.userId === userId);
    if (!cert) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Certificate not found' };
    }
    if (typeof settings.showTechnologies === 'boolean') cert.showTechnologies = settings.showTechnologies;
    if (typeof settings.showDuration === 'boolean') cert.showDuration = settings.showDuration;
    return cert;
  }

  async generatePdf(certIdOrNumber: string): Promise<Buffer> {
    const cert = this.mockCerts.find(c => c.id === certIdOrNumber || c.certNumber === certIdOrNumber) || this.mockCerts[0];
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([842, 595]); // A4 Landscape
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw simple frame
    page.drawRectangle({
      x: 30,
      y: 30,
      width: 782,
      height: 535,
      borderColor: rgb(0.04, 0.08, 0.5),
      borderWidth: 3,
    });

    page.drawText('SKILLFORGE ATTESTATION AUTHORITY', {
      x: 230,
      y: 490,
      size: 18,
      font,
      color: rgb(0.04, 0.08, 0.5),
    });

    page.drawText('CERTIFICATE OF PROJECT COMPLETION', {
      x: 200,
      y: 440,
      size: 22,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText('This verified credential certifies that', {
      x: 290,
      y: 390,
      size: 14,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(cert.recipientName, {
      x: 250,
      y: 340,
      size: 26,
      font,
      color: rgb(0.04, 0.08, 0.5),
    });

    page.drawText(`has successfully contributed to and completed the verified project:`, {
      x: 220,
      y: 295,
      size: 13,
      font: fontRegular,
      color: rgb(0.3, 0.3, 0.3),
    });

    page.drawText(cert.projectName, {
      x: 220,
      y: 260,
      size: 16,
      font,
      color: rgb(0.1, 0.1, 0.1),
    });

    page.drawText(`Roles: ${cert.roles.join(', ')}`, {
      x: 220,
      y: 220,
      size: 12,
      font: fontRegular,
      color: rgb(0.2, 0.2, 0.2),
    });

    page.drawText(`Credential ID: ${cert.certNumber}`, {
      x: 50,
      y: 60,
      size: 11,
      font: fontRegular,
      color: rgb(0.4, 0.4, 0.4),
    });

    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}
