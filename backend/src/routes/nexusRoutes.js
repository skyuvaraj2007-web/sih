/**
 * SKILLNEXUS AI — Relational REST API Routes
 * Single Source of Truth linking Students ↔ Institutions ↔ Companies
 */

const express = require('express');
const router = express.Router();
const relationalManager = require('../db/relationalManager');

// ══════════════════════════════════════════════════════════════════════════
// 0. GLOBAL REAL-TIME SEARCH (PostgreSQL Authoritative)
// ══════════════════════════════════════════════════════════════════════════
router.get('/search', async (req, res) => {
  try {
    const q = req.query.q || req.query.query || '';
    const page = req.query.page || 1;
    const limit = req.query.limit || 10;
    const searchData = await relationalManager.searchEntities(q, { page, limit });
    res.json({ success: true, ...searchData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 1. INSTITUTIONS
// ══════════════════════════════════════════════════════════════════════════
router.get('/institutions', async (req, res) => {
  try {
    const list = await relationalManager.getInstitutions();
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/institutions/:id', async (req, res) => {
  try {
    const inst = await relationalManager.getInstitutionById(req.params.id);
    if (!inst) return res.status(404).json({ success: false, message: 'Institution not found' });
    res.json({ success: true, data: inst });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 2. STUDENTS
// ══════════════════════════════════════════════════════════════════════════
router.get('/students', async (req, res) => {
  try {
    const { collegeId } = req.query;
    const students = await relationalManager.getStudents(collegeId);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/students/:id', async (req, res) => {
  try {
    const student = await relationalManager.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/students', async (req, res) => {
  try {
    const saved = await relationalManager.saveStudent(req.body);
    res.json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 3. COURSES & ENROLLMENTS
// ══════════════════════════════════════════════════════════════════════════
router.get('/courses', async (req, res) => {
  try {
    const { institutionId } = req.query;
    const courses = await relationalManager.getCourses(institutionId);
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/courses', async (req, res) => {
  try {
    const created = await relationalManager.createCourse(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/enrollments', async (req, res) => {
  try {
    const { studentId } = req.query;
    const enrollments = await relationalManager.getEnrollments(studentId);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/enrollments', async (req, res) => {
  try {
    const { student, course } = req.body;
    if (!student || !course) return res.status(400).json({ success: false, message: 'Student and course required' });
    const enr = await relationalManager.enrollCourse(student, course);
    res.status(201).json({ success: true, data: enr });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/enrollments/advance/:id', async (req, res) => {
  try {
    const updated = await relationalManager.advanceModule(req.params.id, req.body?.moduleId);
    if (!updated) return res.status(404).json({ success: false, message: 'Enrollment not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 4. PROJECTS & PROOFS (Sovereign Ledger)
// ══════════════════════════════════════════════════════════════════════════
router.get('/projects', async (req, res) => {
  try {
    const { studentId } = req.query;
    const projects = await relationalManager.getProjects(studentId);
    res.json({ success: true, data: projects });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/projects/submit', async (req, res) => {
  try {
    const project = await relationalManager.submitProject(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/projects/validate/:id', async (req, res) => {
  try {
    const { isApproved = true, facultyName = 'Prof. K. Ramanathan' } = req.body;
    const validated = await relationalManager.validateProject(req.params.id, isApproved, facultyName);
    if (!validated) return res.status(404).json({ success: false, message: 'Project not found' });
    res.json({ success: true, data: validated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/companies', async (req, res) => {
  try {
    const companies = await relationalManager.getCompanies();
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 5. OPPORTUNITIES & APPLICATIONS
// ══════════════════════════════════════════════════════════════════════════
router.get('/opportunities', async (req, res) => {
  try {
    const opps = await relationalManager.getOpportunities();
    res.json({ success: true, data: opps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/opportunities', async (req, res) => {
  try {
    const created = await relationalManager.createOpportunity(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/applications', async (req, res) => {
  try {
    const { studentId, companyId, opportunityId } = req.query;
    const apps = await relationalManager.getApplications({ studentId, companyId, opportunityId });
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/applications/apply', async (req, res) => {
  try {
    const { student, opportunity } = req.body;
    if (!student || !opportunity) return res.status(400).json({ success: false, message: 'Student and opportunity required' });
    const app = await relationalManager.submitApplication(student, opportunity);
    res.status(201).json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/applications/:id/stage', async (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ success: false, message: 'New stage required' });
    const updated = await relationalManager.updateApplicationStage(req.params.id, stage);
    if (!updated) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 6. NOTIFICATIONS & TRASH BIN
// ══════════════════════════════════════════════════════════════════════════
router.get('/notifications', async (req, res) => {
  try {
    const role = req.query.role || 'student';
    const isTrash = req.query.trash === 'true';
    const list = await relationalManager.getNotifications(role, isTrash);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/notifications/:role', async (req, res) => {
  try {
    const isTrash = req.query.trash === 'true';
    const list = await relationalManager.getNotifications(req.params.role, isTrash);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/notifications/:role', async (req, res) => {
  try {
    const created = await relationalManager.addNotification(req.params.role, req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/notifications/:id/read', async (req, res) => {
  try {
    const updated = await relationalManager.markNotificationRead(req.params.id);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/notifications/read-all/:role', async (req, res) => {
  try {
    await relationalManager.markAllNotificationsRead(req.params.role);
    res.json({ success: true, message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/notifications/:id', async (req, res) => {
  try {
    const deleted = await relationalManager.softDeleteNotification(req.params.id);
    res.json({ success: true, data: deleted });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/notifications/:id/restore', async (req, res) => {
  try {
    const restored = await relationalManager.restoreNotification(req.params.id);
    res.json({ success: true, data: restored });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/notifications/trash/:role', async (req, res) => {
  try {
    await relationalManager.emptyTrash(req.params.role);
    res.json({ success: true, message: 'Trash emptied' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 7. CAMPUS ↔ INDUSTRY SKILL GAP INTELLIGENCE & TELEMETRY (Phase 4C & 4E)
// ══════════════════════════════════════════════════════════════════════════
router.get('/analytics/skill-gap/:collegeId', async (req, res) => {
  try {
    const analytics = await relationalManager.getCampusSkillGapAnalytics(req.params.collegeId);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/institutions/:id/telemetry', async (req, res) => {
  try {
    const telemetry = await relationalManager.getInstitutionTelemetry(req.params.id);
    res.json({ success: true, data: telemetry });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// 8. CROSS-PORTAL CAREER INTELLIGENCE (Readiness & Matching)
// ══════════════════════════════════════════════════════════════════════════
router.get('/readiness/:studentId', async (req, res) => {
  try {
    const readinessService = require('../services/readinessService');
    const score = await readinessService.calculateReadiness(req.params.studentId);
    res.json({ success: true, data: { studentId: req.params.studentId, readinessScore: score } });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, message: err.message });
  }
});

router.get('/match/:studentId/:opportunityId', async (req, res) => {
  try {
    const matchingService = require('../services/matchingService');
    const result = await matchingService.matchStudentToOpportunity(req.params.studentId, req.params.opportunityId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, message: err.message });
  }
});

router.get('/match-company/:companyId/:studentId', async (req, res) => {
  try {
    const matchingService = require('../services/matchingService');
    const result = await matchingService.matchCompanyToCandidate(req.params.companyId, req.params.studentId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(err.message.includes('not found') ? 404 : 500).json({ success: false, message: err.message });
  }
});

module.exports = router;
