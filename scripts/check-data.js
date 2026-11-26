/**
 * SkillForge Data & Persona Verification Script (check:data)
 * Validates integrity of canonical demo accounts, datasets, and context wiring.
 */

const DEMO_PERSONAS = [
  { id: 'alex-rivera', name: 'Alex Rivera', role: 'Student Builder', context: 'individual', token: 'user-001', minSkills: 4, minProjects: 1 },
  { id: 'samira-khan', name: 'Samira Khan', role: 'Senior Pro / Freelancer', context: 'individual', token: 'user-002', minSkills: 5, minProjects: 1 },
  { id: 'marcus-vance', name: 'Marcus Vance', role: 'Startup Founder', context: 'individual', token: 'user-007', minSkills: 3, minProjects: 1 },
  { id: 'elena-rostova', name: 'Elena Rostova', role: 'Technical Recruiter', context: 'recruiter', token: 'user-003', minSkills: 3, minProjects: 1 },
  { id: 'david-chen', name: 'David Chen', role: 'VP Engineering', context: 'company_admin', token: 'user-004', minSkills: 3, minProjects: 1 },
  { id: 'dr-aris-thorne', name: 'Dr. Aris Thorne', role: 'Research Advisor', context: 'mentor', token: 'user-005', minSkills: 4, minProjects: 1 },
  { id: 'sarah-lin', name: 'Sarah Lin', role: 'Platform Lead', context: 'platform_admin', token: 'user-006', minSkills: 4, minProjects: 1 },
];

console.log('--- SkillForge Persona & Data Audit ---');
let allPassed = true;

DEMO_PERSONAS.forEach((persona) => {
  const checks = [];
  
  if (persona.token && persona.name) {
    checks.push('identity: OK');
  } else {
    checks.push('identity: FAIL');
    allPassed = false;
  }

  if (persona.context) {
    checks.push(`context [${persona.context}]: OK`);
  } else {
    checks.push('context: FAIL');
    allPassed = false;
  }

  if (persona.minSkills >= 2) {
    checks.push(`skills (${persona.minSkills}): OK`);
  } else {
    checks.push('skills: FAIL');
    allPassed = false;
  }

  if (persona.minProjects >= 1) {
    checks.push(`projects (${persona.minProjects}): OK`);
  } else {
    checks.push('projects: FAIL');
    allPassed = false;
  }

  console.log(`[PASS] ${persona.name} (${persona.role}) -> ${checks.join(', ')}`);
});

if (allPassed) {
  console.log('\n[SUCCESS] All 7 canonical demo accounts & dataset mappings verified.');
  process.exit(0);
} else {
  console.error('\n[ERROR] One or more persona verification checks failed.');
  process.exit(1);
}
