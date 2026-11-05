/**
 * SKILL NEXUS AI — FACULTY / ACADEMIA SIDEBAR NAVIGATION TEST SUITE
 * Tests all 20 faculty routes, bidirectional path resolution, active highlighting,
 * browser refresh simulation, and role isolation.
 */
import { pageToPath, resolvePath, normalizeRole } from '../src/App.jsx';

const facultyUser = {
  id: '32def8f0-3172-4fb7-a8ca-8e9f23cdd2f8',
  email: 'yuva@vcet.com',
  name: 'BANNARI',
  role: 'academician',
  facultyId: 'vcet001',
  department: 'Computer Science and Engineering'
};

const studentUser = {
  id: '022b9309-6b3e-4fba-a413-1f370d5b6581',
  email: 'student@abc.edu',
  name: 'Deepika',
  role: 'student'
};

const results = {
  passed: 0,
  failed: 0,
  failures: []
};

function assert(condition, testName, detail = '') {
  if (condition) {
    results.passed++;
    console.log(`  ✅ ${testName}`);
  } else {
    results.failed++;
    results.failures.push({ testName, detail });
    console.log(`  ❌ ${testName} — Detail: ${detail}`);
  }
}

console.log('══════════════════════════════════════════════════════════════════════════════');
console.log('  TESTING FACULTY / ACADEMIA SIDEBAR NAVIGATION & ROUTE HARMONIZATION');
console.log('══════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. BIDIRECTIONAL ROUTE VERIFICATION (Sidebar Click -> URL -> Refresh)
// ─────────────────────────────────────────────────────────────────────────────
console.log('--- SECTION 1: Bidirectional Route & Refresh Invariants ---');

const testMatrix = [
  { page: 'academician-dashboard', expectedPath: '/academician/dashboard', label: 'Dashboard' },
  { page: 'academician-students', expectedPath: '/academician/students', label: 'My Students' },
  { page: 'academician-student-performance', expectedPath: '/academician/student-performance', label: 'Student Performance' },
  { page: 'academician-courses', expectedPath: '/academician/courses', label: 'My Courses' },
  { page: 'academician-assigned-courses', expectedPath: '/academician/assigned-courses', label: 'Assigned Courses' },
  { page: 'academician-overall-progress', expectedPath: '/academician/course-progress', label: 'Course Progress' },
  { page: 'academician-skill-assessments', expectedPath: '/academician/skill-assessments', label: 'Skill Assessments' },
  { page: 'academician-monitoring', expectedPath: '/academician/monitoring', label: 'Integrity Alerts' },
  { page: 'academician-achievements', expectedPath: '/academician/achievements', label: 'Verify Achievements' },
  { page: 'academician-skill-analytics', expectedPath: '/academician/skill-analytics', label: 'Skill Analytics' },
  { page: 'academician-skill-gaps', expectedPath: '/academician/skill-gaps', label: 'Skill Gaps' },
  { page: 'academician-mentorship', expectedPath: '/academician/mentorship', label: 'Mentorship' },
  { page: 'academician-industry-requirements', expectedPath: '/academician/industry-requirements', label: 'Industry Demands' },
  { page: 'academician-opportunities', expectedPath: '/academician/opportunities', label: 'Opportunities' },
  { page: 'academician-notifications', expectedPath: '/academician/notifications', label: 'Notifications (Nav Item)' },
  { page: 'notifications', expectedPath: '/academician/notifications', label: 'Notifications (Bottom Link)' },
  { page: 'academician-trash', expectedPath: '/academician/trash', label: 'Trash' },
  { page: 'profile', expectedPath: '/academician/profile', label: 'My Profile (Bottom Link)' },
  { page: 'settings', expectedPath: '/academician/settings', label: 'Settings (Bottom Link)' },
  { page: 'help', expectedPath: '/academician/help', label: 'Help Center (Bottom Link)' },
];

for (const item of testMatrix) {
  // Test 1: pageToPath
  const path = pageToPath(item.page, facultyUser.role);
  assert(path === item.expectedPath, `[pageToPath] ${item.label} -> ${item.expectedPath}`, `Got ${path}`);

  // Test 2: resolvePath (Simulating Browser Refresh / Direct URL Entry)
  const resolved = resolvePath(path, facultyUser);
  const resolvedPage = resolved.page;
  // Note: 'notifications' maps to 'academician-notifications' for faculty
  const expectedResolved = item.page === 'notifications' ? 'academician-notifications' : item.page;
  assert(
    resolvedPage === expectedResolved,
    `[resolvePath on Refresh] ${path} -> ${expectedResolved}`,
    `Got ${resolvedPage}`
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. ACTIVE HIGHLIGHTING VERIFICATION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- SECTION 2: Active Menu Item Highlighting ---');

// Mock Sidebar's isActive function
function isSidebarItemActive(itemId, currentActivePage) {
  const currentRole = 'academician';
  if (currentRole === 'academician') {
    if (itemId === 'academician-dashboard') return currentActivePage === 'academician-dashboard' || currentActivePage === 'home' || currentActivePage === 'dashboard';
    if (itemId === 'academician-students') return currentActivePage === 'academician-students';
    if (itemId === 'academician-student-performance') return currentActivePage === 'academician-student-performance' || currentActivePage === 'academician-student-performance-detail' || currentActivePage === 'academician-student-detail';
    if (itemId === 'academician-skill-assessments') return ['academician-skill-assessments', 'academician-assessments', 'academician-create-assessment', 'academician-assessment-results', 'academician-assessment-detail'].includes(currentActivePage);
    if (itemId === 'academician-monitoring') return currentActivePage === 'academician-monitoring' || currentActivePage === 'academician-integrity-alerts';
    if (itemId === 'academician-skill-analytics') return ['academician-skill-analytics', 'academician-analytics'].includes(currentActivePage);
    if (itemId === 'academician-skill-gaps') return currentActivePage === 'academician-skill-gaps';
    if (itemId === 'academician-courses') return currentActivePage === 'academician-courses' || currentActivePage === 'academician-create-course';
    if (itemId === 'academician-assigned-courses') return currentActivePage === 'academician-assigned-courses';
    if (itemId === 'academician-overall-progress') return currentActivePage === 'academician-overall-progress' || currentActivePage === 'academician-course-progress';
    if (itemId === 'academician-achievements') return currentActivePage === 'academician-achievements';
    if (itemId === 'academician-trash') return currentActivePage === 'academician-trash';
    if (itemId === 'academician-recommendations') return currentActivePage === 'academician-recommendations';
    if (itemId === 'academician-mentorship') return currentActivePage === 'academician-mentorship';
    if (itemId === 'academician-industry-requirements') return currentActivePage === 'academician-industry-requirements';
    if (itemId === 'academician-opportunities') return currentActivePage === 'academician-opportunities';
    if (itemId === 'academician-notifications' || itemId === 'notifications') return currentActivePage === 'academician-notifications' || currentActivePage === 'notifications';
    if (itemId === 'profile') return currentActivePage === 'profile';
    if (itemId === 'settings') return currentActivePage === 'settings';
    if (itemId === 'help') return currentActivePage === 'help';
  }
  return currentActivePage === itemId;
}

const activeChecks = [
  { itemId: 'academician-dashboard', activePage: 'academician-dashboard' },
  { itemId: 'academician-students', activePage: 'academician-students' },
  { itemId: 'academician-student-performance', activePage: 'academician-student-performance' },
  { itemId: 'academician-courses', activePage: 'academician-courses' },
  { itemId: 'academician-assigned-courses', activePage: 'academician-assigned-courses' },
  { itemId: 'academician-overall-progress', activePage: 'academician-overall-progress' },
  { itemId: 'academician-skill-assessments', activePage: 'academician-skill-assessments' },
  { itemId: 'academician-monitoring', activePage: 'academician-monitoring' },
  { itemId: 'academician-achievements', activePage: 'academician-achievements' },
  { itemId: 'academician-skill-analytics', activePage: 'academician-skill-analytics' },
  { itemId: 'academician-skill-gaps', activePage: 'academician-skill-gaps' },
  { itemId: 'academician-notifications', activePage: 'academician-notifications' },
  { itemId: 'notifications', activePage: 'academician-notifications' },
  { itemId: 'profile', activePage: 'profile' },
  { itemId: 'settings', activePage: 'settings' },
  { itemId: 'help', activePage: 'help' }
];

for (const check of activeChecks) {
  const isActive = isSidebarItemActive(check.itemId, check.activePage);
  assert(isActive, `[Active State] Item ${check.itemId} correctly active on page ${check.activePage}`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. ROLE ISOLATION & ACCESS CONTROL
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n--- SECTION 3: Role-Based Access Isolation ---');

// Student trying to access faculty route
const studentToFaculty = resolvePath('/academician/dashboard', studentUser);
assert(
  studentToFaculty.redirectReason === 'cross-role',
  'Student blocked from accessing /academician/dashboard',
  JSON.stringify(studentToFaculty)
);

// Faculty trying to access student route
const facultyToStudent = resolvePath('/student/home', facultyUser);
assert(
  facultyToStudent.redirectReason === 'cross-role',
  'Faculty redirected when attempting to access /student/home',
  JSON.stringify(facultyToStudent)
);

// Direct top-level shared routes
assert(resolvePath('/profile', facultyUser).page === 'profile', 'Faculty direct /profile loads Profile');
assert(resolvePath('/settings', facultyUser).page === 'settings', 'Faculty direct /settings loads Settings');
assert(resolvePath('/help', facultyUser).page === 'help', 'Faculty direct /help loads Help Center');
assert(resolvePath('/notifications', facultyUser).page === 'academician-notifications', 'Faculty direct /notifications loads Faculty Notifications');

// ─────────────────────────────────────────────────────────────────────────────
// SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n══════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${results.passed} Passed, ${results.failed} Failed`);
console.log('══════════════════════════════════════════════════════════════════════════════\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

