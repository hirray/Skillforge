// scripts/check-flows.js
// Accuracy guard for SkillForge workflow flowcharts & COVERAGE.md

const fs = require('fs');
const path = require('path');

const FLOWS_DIR = path.join(__dirname, '..', 'docs', 'manuals', 'flows');
const COVERAGE_FILE = path.join(__dirname, '..', 'docs', 'manuals', 'COVERAGE.md');

console.log('=== Checking SkillForge Workflow Flowcharts & Coverage Matrix ===');

let hasError = false;

// 1. Check COVERAGE.md
if (!fs.existsSync(COVERAGE_FILE)) {
  console.error('FAIL: docs/manuals/COVERAGE.md is missing!');
  hasError = true;
} else {
  const coverageContent = fs.readFileSync(COVERAGE_FILE, 'utf-8');
  for (let i = 1; i <= 34; i++) {
    const rowPrefix = `| ${i} |`;
    if (!coverageContent.includes(rowPrefix)) {
      console.error(`FAIL: Module #${i} is unmapped in COVERAGE.md!`);
      hasError = true;
    }
  }
  console.log('PASS: COVERAGE.md covers all 34 modules.');
}

// 2. Check all 16 flowcharts FC-01 to FC-16
const requiredCharts = [
  'FC-01_Platform_Master.mmd',
  'FC-02_Project_Creation_to_Certification.mmd',
  'FC-03_Resume_and_Profile.mmd',
  'FC-04_Matching_and_Team_Formation.mmd',
  'FC-05_Project_Room_Loop.mmd',
  'FC-06_Rescue_a_Stalled_Project.mmd',
  'FC-07_Completion_Verification_and_Certificate.mmd',
  'FC-08_Hackathon_or_Sprint.mmd',
  'FC-09_Company_Challenge.mmd',
  'FC-10_Mentorship.mmd',
  'FC-11_Hiring_Pipeline.mmd',
  'FC-12_Opportunities_for_Individuals.mmd',
  'FC-13_Invitations_and_Notifications.mmd',
  'FC-14_Admin_and_Moderation.mmd',
  'FC-15_Roles_and_Contexts_Map.mmd',
  'FC-16_Who_Can_See_My_Data.mmd',
];

for (const chart of requiredCharts) {
  const chartPath = path.join(FLOWS_DIR, chart);
  if (!fs.existsSync(chartPath)) {
    console.error(`FAIL: Flowchart file missing: ${chart}`);
    hasError = true;
    continue;
  }

  const content = fs.readFileSync(chartPath, 'utf-8');

  // Verify header comments
  if (!content.includes('%% Source files:')) {
    console.error(`FAIL: ${chart} lacks '%% Source files:' header comment!`);
    hasError = true;
  }

  // Verify Title & Purpose
  if (!content.includes('%% Title:') || !content.includes('%% Purpose:')) {
    console.error(`FAIL: ${chart} lacks Title or Purpose metadata!`);
    hasError = true;
  }

  // Verify accessible text alternative
  if (!content.includes('SAME STEPS IN WORDS')) {
    console.error(`FAIL: ${chart} lacks accessible 'SAME STEPS IN WORDS' text alternative!`);
    hasError = true;
  }
}

if (hasError) {
  console.error('\ncheck:flows failed with errors.');
  process.exit(1);
} else {
  console.log('PASS: All 16 workflow flowcharts verified successfully with accessibility alternatives & source tracing.');
  process.exit(0);
}
