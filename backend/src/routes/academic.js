const express = require('express');
const router = express.Router();
const relationalManager = require('../db/relationalManager');
const rosterService = require('../services/rosterService');
const { requireAuth } = require('../middleware/auth');

// Middleware to enforce tenant (institution) isolation
function verifyInstitution(req, res, next) {
  const userRole = (req.user?.role || '').toLowerCase();
  if (!['institution', 'admin'].includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Institution role required' });
  }
  const institutionId = req.user?.institutionId || req.user?.collegeId || (userRole === 'admin' ? (req.query.institutionId || 'TN010') : null);
  if (!institutionId) {
    return res.status(403).json({ success: false, message: 'Institution context missing' });
  }
  req.institutionId = institutionId;
  next();
}

// ---------- Students ----------
router.get('/students', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const students = await relationalManager.getStudents(req.institutionId);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/students/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const student = await relationalManager.getStudentById(req.params.id);
    const targetInst = String(req.institutionId || '').toUpperCase().trim();
    const sInstId = String(student?.institutionId || student?.institution_id || student?.collegeId || '').toUpperCase().trim();
    const isSameInst = sInstId === targetInst || (targetInst === 'TN010' && sInstId === 'SRM001') || (targetInst === 'SRM001' && sInstId === 'TN010');
    const belongsToInst = student && (isSameInst || req.user?.role === 'admin');
    if (!student || !belongsToInst) {
      return res.status(404).json({ success: false, message: 'Student not found in your institution' });
    }
    res.json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Courses & Skills ----------
router.get('/courses', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const courses = await relationalManager.getCourses(req.institutionId);
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/courses', requireAuth, verifyInstitution, async (req, res) => {
  try {
    if (!['admin', 'institution'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient privileges' });
    }
    const created = await relationalManager.createCourse({ ...req.body, institutionId: req.institutionId });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Master Skill Endpoints (10-Step Wizard) ----------
router.get('/skills', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { status } = req.query;
    const result = await relationalManager.getInstitutionSkills(req.institutionId, status || null);
    res.json({ success: true, data: result.skills, metrics: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/skills/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const skill = await relationalManager.getSkillById(req.params.id);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    if (String(skill.institutionId).toUpperCase() !== String(req.institutionId).toUpperCase()) {
      return res.status(403).json({ success: false, message: 'Access denied to this skill' });
    }
    res.json({ success: true, data: skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/skills', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const isPublish = req.body.isPublish === true || req.body.status === 'PUBLISHED';
    const saved = await relationalManager.saveSkill(req.institutionId, req.body, isPublish);
    res.status(201).json({
      success: true,
      message: isPublish ? 'Skill published successfully and eligible students notified.' : 'Skill draft saved successfully.',
      data: saved
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/skills/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const isPublish = req.body.isPublish === true || req.body.status === 'PUBLISHED';
    const saved = await relationalManager.saveSkill(req.institutionId, { ...req.body, id: req.params.id }, isPublish);
    res.json({
      success: true,
      message: isPublish ? 'Skill published successfully.' : 'Skill draft updated successfully.',
      data: saved
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/skills/:id/archive', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const archived = await relationalManager.archiveSkill(req.params.id, req.institutionId);
    res.json({ success: true, message: 'Skill archived successfully.', data: archived });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ---------- Enrollments & Requests Management ----------
router.get('/enrollment-requests', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const requests = await relationalManager.getPendingEnrollmentRequests(req.institutionId);
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/enrollments/:id/approve', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const updated = await relationalManager.updateEnrollmentStatus(req.params.id, req.institutionId, 'APPROVED');
    res.json({ success: true, message: 'Enrollment request approved. Student has been notified.', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.post('/enrollments/:id/reject', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { reason } = req.body;
    const updated = await relationalManager.updateEnrollmentStatus(req.params.id, req.institutionId, 'REJECTED', reason);
    res.json({ success: true, message: 'Enrollment request rejected. Student has been notified.', data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/enrollments', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { studentId } = req.query;
    const enrollments = await relationalManager.getEnrollments(studentId);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/enrollments', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { student, course } = req.body;
    const courseObj = await relationalManager.getCourseById(course);
    if (!courseObj || courseObj.institutionId !== req.institutionId) {
      return res.status(400).json({ success: false, message: 'Course does not belong to your institution' });
    }
    const enrollment = await relationalManager.enrollCourse(student, course);
    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Dashboard ----------
router.get('/dashboard', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const dashboard = await relationalManager.getInstitutionDashboard(req.institutionId);
    res.json({ success: true, data: dashboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Skill Analytics ----------
router.get('/skill-analytics', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const analytics = await relationalManager.getSkillAnalytics(req.institutionId);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/skill-analytics/:skillId', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const skill = await relationalManager.getSkillAnalyticsById(req.params.skillId, req.institutionId);
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });
    res.json({ success: true, data: skill });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Readiness ----------
router.get('/readiness', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const students = await relationalManager.getStudents(req.institutionId);
    const readinessList = await Promise.all(students.map(s => relationalManager.getReadiness(s.studentId)));
    const result = students.map((s, i) => ({ studentId: s.studentId, readinessScore: readinessList[i] }));
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/readiness/:studentId', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const student = await relationalManager.getStudentByIdWithOwnership(req.params.studentId, req.institutionId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found in your institution' });
    const readinessScore = await relationalManager.getReadiness(student.studentId);
    res.json({ success: true, data: { studentId: student.studentId, readinessScore } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Analytics ----------
router.get('/analytics', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const analytics = await relationalManager.getInstitutionAnalytics(req.institutionId);
    res.json({ success: true, data: analytics });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Placement Drives ----------
router.get('/placement-drives', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const drives = await relationalManager.getPlacementDrives(req.institutionId);
    res.json({ success: true, data: drives });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.post('/placement-drives', requireAuth, verifyInstitution, async (req, res) => {
  try {
    if (!['admin', 'institution'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Insufficient privileges' });
    const created = await relationalManager.createPlacementDrive({ ...req.body, institutionId: req.institutionId });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.put('/placement-drives/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    if (!['admin', 'institution'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Insufficient privileges' });
    const updated = await relationalManager.updatePlacementDrive(req.params.id, { ...req.body, institutionId: req.institutionId });
    if (!updated) return res.status(404).json({ success: false, message: 'Placement drive not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/placement-drives/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const drive = await relationalManager.getPlacementDriveById(req.params.id, req.institutionId);
    if (!drive) return res.status(404).json({ success: false, message: 'Placement drive not found' });
    res.json({ success: true, data: drive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Applications ----------
router.get('/applications', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const apps = await relationalManager.getApplicationsByInstitution(req.institutionId);
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});
router.get('/applications/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const app = await relationalManager.getApplicationById(req.params.id, req.institutionId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Partnerships ----------
router.put('/partnerships/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    if (!['admin', 'institution'].includes(req.user.role)) return res.status(403).json({ success: false, message: 'Insufficient privileges' });
    const updated = await relationalManager.updatePartnership(req.params.id, { ...req.body, institutionId: req.institutionId });
    if (!updated) return res.status(404).json({ success: false, message: 'Partnership not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Industry Student Access Requests ----------
router.get('/industry-requests', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const requests = await relationalManager.getInstitutionAccessRequests(req.institutionId);
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post(['/industry-requests', '/companies/request-access'], requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { companyId, studentIds, message } = req.body;
    if (!companyId) return res.status(400).json({ success: false, message: 'companyId is required' });

    let finalStudentIds = Array.isArray(studentIds) && studentIds.length > 0 ? studentIds : [];
    if (finalStudentIds.length === 0) {
      const instStudents = await relationalManager.getStudents(req.institutionId);
      finalStudentIds = instStudents.map(s => s.id || s.studentId);
    }

    const request = await relationalManager.createStudentAccessRequest({
      institutionId: req.institutionId,
      companyId,
      studentIds: finalStudentIds,
      message,
      requestedByUserId: req.user?.id
    });
    res.status(201).json({ success: true, data: request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/industry-requests/:id/revoke', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const result = await relationalManager.revokeCompanyAccess(req.params.id, { institutionId: req.institutionId });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Institution Assessment Tests ----------
router.get('/assessments', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const assessments = await relationalManager.getInstitutionAssessments(req.institutionId);
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { title, assessmentType, durationMinutes, totalMarks, difficulty } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Assessment title is required' });

    const assessment = await relationalManager.createInstitutionAssessment({
      institutionId: req.institutionId,
      title,
      assessmentType: assessmentType || 'LOGICAL',
      durationMinutes,
      totalMarks,
      difficulty
    });
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/assessments/:id', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const assessment = await relationalManager.getAssessmentQuestionsForStudent(req.params.id, null);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/assessments/:id/results', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const results = await relationalManager.getInstitutionAssessmentResults(req.params.id, req.institutionId);
    res.json({ success: true, data: results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments/:id/questions', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const question = await relationalManager.addAssessmentQuestion(req.params.id, req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments/:id/publish', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const result = await relationalManager.publishInstitutionAssessment(req.params.id, req.institutionId);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Programming Languages & Course Mapping ----------
router.get('/programming-languages', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const langs = await relationalManager.getProgrammingLanguages();
    res.json({ success: true, data: langs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/courses/:courseId/languages', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const langs = await relationalManager.getCourseProgrammingLanguages(req.params.courseId);
    res.json({ success: true, data: langs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ══════════════════════════════════════════════════════════════════════════
// ONBOARDING SETUP & ROSTER IMPORT ROUTES
// ══════════════════════════════════════════════════════════════════════════

// GET /api/academic/setup/status
router.get('/setup/status', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const status = await relationalManager.getInstitutionSetupStatus(req.institutionId);
    res.json({ success: true, data: status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/academic/setup/institution
router.post('/setup/institution', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const updated = await relationalManager.updateInstitutionSetup(req.institutionId, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/academic/departments
router.get('/departments', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const depts = await relationalManager.getInstitutionDepartments(req.institutionId);
    res.json({ success: true, data: depts });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/academic/departments
router.post('/departments', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { code, name } = req.body;
    if (!code || !name) {
      return res.status(400).json({ success: false, message: 'Department code and name are required' });
    }
    const result = await relationalManager.createDepartment(req.institutionId, { code, name });
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/academic/template/download
router.get('/template/download', requireAuth, verifyInstitution, (req, res) => {
  const csvContent = rosterService.generateTemplateCSV();
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="SkillNexus_Student_Roster_Template.csv"');
  res.send(csvContent);
});

// POST /api/academic/roster/preview
router.post('/roster/preview', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { csvContent, fileName } = req.body;
    if (!csvContent) {
      return res.status(400).json({ success: false, message: 'CSV content is required for preview' });
    }

    const institutionDepartments = await relationalManager.getInstitutionDepartments(req.institutionId);
    const existingStudents = await relationalManager.getStudents(req.institutionId);

    const preview = rosterService.validateAndPreviewRoster({
      rawContent: csvContent,
      institutionDepartments,
      existingStudents
    });

    res.json(preview);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/academic/roster/confirm
router.post('/roster/confirm', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { validRows, fileName } = req.body;
    if (!Array.isArray(validRows) || validRows.length === 0) {
      return res.status(400).json({ success: false, message: 'No valid rows to commit' });
    }

    const adminUserId = req.user?.id || req.user?.userId;
    const result = await relationalManager.upsertStudentRoster(req.institutionId, validRows, adminUserId, fileName);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/academic/students/manual
router.post('/students/manual', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const adminUserId = req.user?.id || req.user?.userId;
    const result = await relationalManager.createManualStudent(req.institutionId, req.body, adminUserId);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// POST /api/academic/students/:id/resend-invite
router.post('/students/:id/resend-invite', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const result = await relationalManager.resendStudentInvitation(req.institutionId, req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// PATCH /api/academic/students/:id/status
router.patch('/students/:id/status', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }
    const result = await relationalManager.updateStudentAccountStatus(req.institutionId, req.params.id, status);
    res.json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/academic/roster/imports
router.get('/roster/imports', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const history = await relationalManager.getRosterImports(req.institutionId);
    res.json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Course Certificates Verification ----------
router.get('/course-certificates', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const certificates = await relationalManager.getCourseCertificatesForInstitution(req.institutionId);
    res.json({ success: true, data: certificates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/course-certificates/:id/verify', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { notes } = req.body || {};
    const result = await relationalManager.verifyCourseCertificate(req.params.id, req.institutionId, 'VERIFIED', notes, req.user?.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/course-certificates/:id/reject', requireAuth, verifyInstitution, async (req, res) => {
  try {
    const { notes, reason } = req.body || {};
    const result = await relationalManager.verifyCourseCertificate(req.params.id, req.institutionId, 'REJECTED', reason || notes, req.user?.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

