// scripts/check-manuals.js
// Quality and template audit for SkillForge user manual chapters

const fs = require('fs');
const path = require('path');

const MANUALS_DIR = path.join(__dirname, '..', 'docs', 'manuals');

console.log('=== Checking SkillForge User Manual Chapters ===');

const requiredChapters = [
  '01_introduction.md',
  '02_getting_started.md',
  '03_profile_and_resume.md',
  '04_project_creation.md',
  '05_team_matching_and_invitations.md',
  '06_project_room_execution.md',
  '07_github_and_contributions.md',
  '08_project_rescue.md',
  '09_completion_and_certification.md',
  '10_portfolio_and_discovery.md',
  '11_hackathons_and_challenges.md',
  '12_recruiters_and_companies.md',
  '13_mentorship.md',
  '14_administrators.md',
  '15_workflow_catalog.md',
  '16_system_reference.md',
  '17_troubleshooting_and_faq.md',
];

const requiredSections = [
  '## Who it is for',
  '## Time to complete',
  '## What you will achieve',
  '## Before you start',
  '## Step by Step',
  '## Field Reference',
  '## Common Problems',
  '## Related Chapters',
];

let hasError = false;

for (const ch of requiredChapters) {
  const filePath = path.join(MANUALS_DIR, ch);
  if (!fs.existsSync(filePath)) {
    console.error(`FAIL: Missing manual chapter: ${ch}`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf-8');

  // Verify feature chapters follow standard template (excluding reference/catalog)
  if (!['01_introduction.md', '15_workflow_catalog.md', '16_system_reference.md', '17_troubleshooting_and_faq.md'].includes(ch)) {
    for (const sec of requiredSections) {
      if (!content.includes(sec)) {
        console.error(`FAIL: ${ch} is missing template section '${sec}'`);
        hasError = true;
      }
    }
  }
}

if (hasError) {
  console.error('\ncheck:manuals failed with errors.');
  process.exit(1);
} else {
  console.log(`PASS: All ${requiredChapters.length} manual chapters verified against standard product template.`);
  process.exit(0);
}
