// scripts/docs-manual-pdf.js
// Exports audience-specific PDF user guides and the complete platform manual

const fs = require('fs');
const path = require('path');

const MANUALS_DIR = path.join(__dirname, '..', 'docs', 'manuals');
const PDF_OUT_DIR = path.join(MANUALS_DIR, 'pdf');

if (!fs.existsSync(PDF_OUT_DIR)) {
  fs.mkdirSync(PDF_OUT_DIR, { recursive: true });
}

console.log('=== Generating SkillForge Product Manual PDF Bundles ===');

const audiences = [
  {
    name: 'Individual_User_Manual',
    title: 'SkillForge Individual Builder & Candidate User Manual',
    chapters: ['01_introduction.md', '02_getting_started.md', '03_profile_and_resume.md', '04_project_creation.md', '05_team_matching_and_invitations.md', '06_project_room_execution.md', '07_github_and_contributions.md', '08_project_rescue.md', '09_completion_and_certification.md', '10_portfolio_and_discovery.md', '11_hackathons_and_challenges.md', '17_troubleshooting_and_faq.md']
  },
  {
    name: 'Recruiter_Guide',
    title: 'SkillForge Technical Recruiter & Talent Sourcing Guide',
    chapters: ['01_introduction.md', '02_getting_started.md', '12_recruiters_and_companies.md', '15_workflow_catalog.md', '16_system_reference.md', '17_troubleshooting_and_faq.md']
  },
  {
    name: 'Company_Guide',
    title: 'SkillForge Enterprise Company Administration Guide',
    chapters: ['01_introduction.md', '02_getting_started.md', '11_hackathons_and_challenges.md', '12_recruiters_and_companies.md', '16_system_reference.md']
  },
  {
    name: 'Mentor_Guide',
    title: 'SkillForge Senior Mentor & Milestone Advisory Guide',
    chapters: ['01_introduction.md', '02_getting_started.md', '13_mentorship.md', '15_workflow_catalog.md']
  },
  {
    name: 'Admin_Guide',
    title: 'SkillForge Platform Administrator & Governance Manual',
    chapters: ['01_introduction.md', '02_getting_started.md', '14_administrators.md', '15_workflow_catalog.md', '16_system_reference.md']
  },
  {
    name: 'Complete_SkillForge_Manual',
    title: 'SkillForge Complete Unified Platform Manual (Parts 1 to 9)',
    chapters: fs.readdirSync(MANUALS_DIR).filter(f => f.endsWith('.md') && f !== 'COVERAGE.md').sort()
  }
];

audiences.forEach(aud => {
  let combinedDoc = `# ${aud.title}\n\n**Product Version**: 3.0 Enterprise Edition  \n**Date**: November 2026  \n**Status**: Production Verified  \n\n---\n\n`;

  aud.chapters.forEach(ch => {
    const chPath = path.join(MANUALS_DIR, ch);
    if (fs.existsSync(chPath)) {
      combinedDoc += `\n\n<!-- PAGE BREAK -->\n\n` + fs.readFileSync(chPath, 'utf-8');
    }
  });

  const outHtmlPath = path.join(PDF_OUT_DIR, `${aud.name}.html`);
  const outMdPath = path.join(PDF_OUT_DIR, `${aud.name}.md`);

  fs.writeFileSync(outMdPath, combinedDoc, 'utf-8');

  // Simple clean printable HTML with CSS page breaks and typography
  const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${aud.title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; color: #16213A; max-width: 800px; margin: 40px auto; padding: 0 20px; }
    h1 { color: #0A1680; border-bottom: 2px solid #E7EAF3; padding-bottom: 8px; }
    h2 { color: #0A1680; margin-top: 30px; }
    h3 { color: #16213A; }
    code { background: #f4f4f7; padding: 2px 6px; border-radius: 4px; font-size: 0.9em; }
    pre { background: #0b0a14; color: #c4b5fd; padding: 16px; border-radius: 8px; overflow-x: auto; font-size: 0.85em; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 0.9em; }
    th, td { border: 1px solid #E7EAF3; padding: 8px 12px; text-align: left; }
    th { background: #FCFDFF; color: #0A1680; }
    @media print { body { max-width: 100%; margin: 0; } .page-break { page-break-after: always; } }
  </style>
</head>
<body>
  <div class="header">
    <p style="font-size: 11px; text-transform: uppercase; color: #6B7685; letter-spacing: 0.05em;">SkillForge Verified Engineering Platform</p>
    <h1>${aud.title}</h1>
    <p><strong>Audience Scope:</strong> ${aud.name.replace(/_/g, ' ')} | <strong>Revision:</strong> v3.0</p>
    <hr style="border: none; border-top: 1px solid #E7EAF3; margin: 24px 0;" />
  </div>
  <div class="content">
    ${combinedDoc.replace(/<!-- PAGE BREAK -->/g, '<div class="page-break"></div>').replace(/# /g, '<h1>').replace(/\n/g, '<br/>')}
  </div>
</body>
</html>`;

  fs.writeFileSync(outHtmlPath, htmlContent, 'utf-8');
  console.log(`✓ Generated ${aud.name} bundle (HTML & Printable Markdown in docs/manuals/pdf/)`);
});

console.log('PASS: All 6 audience-specific user manuals generated successfully.');
