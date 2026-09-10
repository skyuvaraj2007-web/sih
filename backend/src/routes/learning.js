// backend/src/routes/learning.js
/**
 * Learning routes.
 *
 * RULE: Clicking "Continue" (GET /resume) MUST NOT mutate any data.
 *       Only POST /:enrollmentId/modules/:moduleId/complete may increment progress.
 *       That endpoint is IDEMPOTENT — completing the same module twice keeps progress unchanged.
 */
const express = require('express');
const router = express.Router();
const relationalManager = require('../db/relationalManager');
const { requireAuth } = require('../middleware/auth');

async function getEffectiveStudentId(req) {
  if (req.user?.studentId) return req.user.studentId;
  const directId = req.user?.id;
  if (directId) {
    const s = await relationalManager.getStudentById(directId);
    if (s && s.studentId) return s.studentId;
  }
  if (req.user?.email) {
    const all = await relationalManager.getStudents();
    const s = all.find(st => st.email?.toLowerCase() === req.user.email.toLowerCase());
    if (s && s.studentId) return s.studentId;
  }
  return req.user?.studentId || req.user?.id;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning — list courses / enrollments for the authenticated student
// ─────────────────────────────────────────────────────────────────────────────
router.get('/', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const institutionId = req.user?.institutionId || req.user?.collegeId;

    const courses = await relationalManager.getCourses(institutionId || null);
    const enrollments = await relationalManager.getEnrollments(studentId);

    res.json({ success: true, data: { courses, enrollments } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning/skills — list skills published by student's institution with eligibility
// ─────────────────────────────────────────────────────────────────────────────
router.get('/skills', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const student = await relationalManager.getStudentById(studentId);

    const instId = student?.institutionId || student?.institution_id || student?.collegeId || req.user?.institutionId || req.user?.collegeId || 'TN010';
    const result = await relationalManager.getInstitutionSkills(instId, 'PUBLISHED');

    // Enrich each skill with the student's eligibility status
    const enriched = await Promise.all((result.skills || []).map(async (skill) => {
      const eligibility = student ? await relationalManager.checkStudentSkillEligibility(student, skill) : { isEligible: true, status: 'ELIGIBLE' };
      return {
        ...skill,
        eligibilityStatus: eligibility.status,
        isEligible: eligibility.isEligible,
        existingEnrollment: eligibility.existingEnrollment
      };
    }));

    res.json({ success: true, data: enriched, totalCount: enriched.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning/skills/:id — full skill details + detailed real-time eligibility breakdown
// ─────────────────────────────────────────────────────────────────────────────
router.get('/skills/:id', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const student = await relationalManager.getStudentById(studentId);
    const skill = await relationalManager.getSkillById(req.params.id);

    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const eligibility = student
      ? await relationalManager.checkStudentSkillEligibility(student, skill)
      : { isEligible: true, status: 'ELIGIBLE', breakdown: [], reasons: [] };

    res.json({
      success: true,
      data: {
        ...skill,
        eligibility
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/skills/:id/enroll — enroll student in skill (Open/Approval/Waitlist)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/skills/:id/enroll', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const student = await relationalManager.getStudentById(studentId);
    const skill = await relationalManager.getSkillById(req.params.id);

    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });
    if (!skill) return res.status(404).json({ success: false, message: 'Skill not found' });

    const result = await relationalManager.enrollStudentInSkill(student, skill, req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/skills/:id/assess — submit skill assessment & compute benchmark/certificate
// ─────────────────────────────────────────────────────────────────────────────
router.post('/skills/:id/assess', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const student = await relationalManager.getStudentById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

    const result = await relationalManager.submitSkillAssessment(studentId, req.params.id, req.body);
    res.json({
      success: true,
      message: result.isCertified
        ? `Congratulations! You earned ${result.benchmark} certification with score ${result.score}%.`
        : `Assessment completed with score ${result.score}%. Benchmark: ${result.benchmark}.`,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/skills/:id/lessons/complete — complete a module lesson
// ─────────────────────────────────────────────────────────────────────────────
router.post('/skills/:id/lessons/complete', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const result = await relationalManager.completeSkillLesson(studentId, req.params.id, req.body);
    res.json({
      success: true,
      message: 'Lesson completed successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/skills/:id/practice — record practice attempt telemetry
// ─────────────────────────────────────────────────────────────────────────────
router.post('/skills/:id/practice', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const result = await relationalManager.recordSkillPractice(studentId, req.params.id, req.body);
    res.json({
      success: true,
      message: 'Practice activity recorded successfully',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/skills/:id/project — submit practical capstone project
// ─────────────────────────────────────────────────────────────────────────────
router.post('/skills/:id/project', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const result = await relationalManager.submitSkillProject(studentId, req.params.id, req.body);
    res.json({
      success: true,
      message: 'Project submitted successfully and evidence recorded',
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning/skills/:id/progress — get student progress & evidence
// ─────────────────────────────────────────────────────────────────────────────
router.get('/skills/:id/progress', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const result = await relationalManager.getStudentSkillIntelligence(studentId, req.params.id);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning/my-skill-intelligence — get all enrolled skills intelligence
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-skill-intelligence', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const result = await relationalManager.getAllStudentSkillIntelligence(studentId);
    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning/my-skills — student enrolled / in-progress / completed / certified skills
// ─────────────────────────────────────────────────────────────────────────────
router.get('/my-skills', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const enrollments = await relationalManager.getEnrollments(studentId);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/enroll — enroll student in a course (starts at 0% progress)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/enroll', requireAuth, async (req, res) => {
  try {
    const { courseId, totalModules, courseTitle } = req.body;
    if (!courseId) return res.status(400).json({ success: false, message: 'courseId is required' });

    const studentId = await getEffectiveStudentId(req);
    const student = await relationalManager.getStudentById(studentId);
    let course = relationalManager.getCourseById
      ? await relationalManager.getCourseById(courseId)
      : null;

    if (!course) {
      course = { courseId, title: courseTitle, totalModules: totalModules ? parseInt(totalModules, 10) : undefined };
    } else if (totalModules) {
      course = { ...course, totalModules: parseInt(totalModules, 10) };
    }

    const existing = await relationalManager.getEnrollments(studentId);
    const alreadyEnrolled = (existing || []).some(e => e.courseId === courseId || e.course_id === courseId);
    if (alreadyEnrolled) {
      return res.status(409).json({ success: false, message: 'Already enrolled in this course' });
    }

    const enrollment = await relationalManager.enrollCourse(student || { studentId }, course || { courseId });

    res.status(201).json({
      success: true,
      message: 'Course enrollment successful',
      data: enrollment
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/learning/:enrollmentId/resume — Return current module context ONLY.
//   NO DATA MUTATION. Clicking "Continue" calls this. Progress does NOT change.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/:id/resume', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const enrollments = await relationalManager.getEnrollments(studentId);
    const enrollment = (enrollments || []).find(e =>
      e.id === req.params.id ||
      e.enrollmentId === req.params.id ||
      e.enrollment_id === req.params.id ||
      e.courseId === req.params.id ||
      e.course_id === req.params.id ||
      e.courseCode === req.params.id ||
      e.course_code === req.params.id
    );

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    res.json({
      success: true,
      message: 'Resume context retrieved. No progress changed.',
      data: {
        enrollmentId: enrollment.id || enrollment.enrollmentId || enrollment.enrollment_id,
        courseId: enrollment.courseId || enrollment.course_id,
        courseTitle: enrollment.courseTitle || enrollment.course_title,
        currentModule: enrollment.currentModule || 'Module 1',
        completedModules: enrollment.completedModules || 0,
        totalModules: enrollment.totalModules || 1,
        completedModuleIds: Array.isArray(enrollment.completedModuleIds) ? enrollment.completedModuleIds : [],
        progress: enrollment.progress || 0,
        status: enrollment.status || 'active'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/learning/:enrollmentId/modules/:moduleId/complete
//   IDEMPOTENT: completing the same moduleId twice keeps progress unchanged.
//   Validates: enrollment exists & belongs to authenticated student.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/:id/modules/:moduleId/complete', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const { id: enrollmentId, moduleId } = req.params;

    if (!moduleId) {
      return res.status(400).json({ success: false, message: 'moduleId is required' });
    }

    // Verify ownership
    const enrollments = await relationalManager.getEnrollments(studentId);
    const ownEnrollment = (enrollments || []).find(e =>
      e.id === enrollmentId ||
      e.enrollmentId === enrollmentId ||
      e.enrollment_id === enrollmentId ||
      e.courseId === enrollmentId ||
      e.course_id === enrollmentId ||
      e.courseCode === enrollmentId ||
      e.course_code === enrollmentId
    );
    if (!ownEnrollment) {
      return res.status(403).json({ success: false, message: 'Enrollment not found or does not belong to this student' });
    }

    // Idempotent advance — relationalManager checks completedModuleIds
    const effectiveEnrollmentId = ownEnrollment.id || ownEnrollment.enrollmentId || ownEnrollment.enrollment_id || enrollmentId;
    const updated = await relationalManager.advanceModule(effectiveEnrollmentId, moduleId);
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Enrollment not found in database' });
    }

    res.json({
      success: true,
      message: updated.alreadyCompleted
        ? 'Module already completed — progress unchanged (idempotent).'
        : `Module "${moduleId}" marked complete.`,
      data: {
        enrollmentId,
        moduleId,
        alreadyCompleted: Boolean(updated.alreadyCompleted),
        completedModules: updated.completedModules,
        totalModules: updated.totalModules,
        progress: updated.progress,
        progressPercentage: updated.progress,
        completionPercentage: updated.progress,
        status: updated.status,
        completedModuleIds: updated.completedModuleIds || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// DEPRECATED: PUT/POST /:id/progress — kept for backwards compat, now requires
// a moduleId in the request body and is fully idempotent.
// Clients should migrate to POST /:id/modules/:moduleId/complete.
// ─────────────────────────────────────────────────────────────────────────────
const handleProgressUpdate = async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const enrollmentId = req.params.id;
    const moduleId = req.body?.moduleId || null;

    if (!moduleId) {
      return res.status(400).json({
        success: false,
        message: 'moduleId is required. Use POST /:enrollmentId/modules/:moduleId/complete to mark a specific module complete.'
      });
    }

    // Verify ownership
    const enrollments = await relationalManager.getEnrollments(studentId);
    const ownEnrollment = (enrollments || []).find(e =>
      e.id === enrollmentId ||
      e.enrollmentId === enrollmentId ||
      e.enrollment_id === enrollmentId
    );
    if (!ownEnrollment) {
      return res.status(403).json({ success: false, message: 'Enrollment not found or does not belong to this student' });
    }

    const updated = await relationalManager.advanceModule(enrollmentId, moduleId);
    if (!updated) return res.status(404).json({ success: false, message: 'Enrollment not found' });

    res.json({
      success: true,
      message: updated.alreadyCompleted
        ? 'Module already completed — progress unchanged (idempotent).'
        : `Module "${moduleId}" marked complete.`,
      data: {
        enrollmentId,
        moduleId,
        alreadyCompleted: Boolean(updated.alreadyCompleted),
        completedCount: updated.completedModules,
        completedModules: updated.completedModules,
        totalModules: updated.totalModules,
        completionPercentage: updated.progress,
        progress: updated.progress,
        status: updated.status,
        completedModuleIds: updated.completedModuleIds || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

router.put('/:id/progress', requireAuth, handleProgressUpdate);
router.post('/:id/progress', requireAuth, handleProgressUpdate);

// ─────────────────────────────────────────────────────────────────────────────
// SELF-ASSESSED SKILLS API
// ─────────────────────────────────────────────────────────────────────────────
router.get('/self-assessments', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const list = await relationalManager.getStudentSelfAssessments(studentId);
    res.json({ success: true, data: list, count: list.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/self-assessments', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const saved = await relationalManager.saveStudentSelfAssessment(studentId, req.body);
    res.status(201).json({ success: true, message: 'Self-assessment recorded successfully.', data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.put('/self-assessments/:id', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const saved = await relationalManager.saveStudentSelfAssessment(studentId, { ...req.body, id: req.params.id });
    res.json({ success: true, message: 'Self-assessment updated successfully.', data: saved });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.delete('/self-assessments/:id', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const result = await relationalManager.deleteStudentSelfAssessment(studentId, req.params.id);
    res.json({ success: true, message: 'Self-assessment deleted successfully.', data: result });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// LEARNING OVERVIEW, QUIZZES, PROJECTS, CERTIFICATIONS, ACTIVITY & INTELLIGENCE
// ─────────────────────────────────────────────────────────────────────────────
router.get('/overview', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentLearningOverview(studentId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/quizzes', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentQuizzes(studentId);
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/quizzes/submit', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.submitStudentQuiz(studentId, req.body);
    res.status(201).json({ success: true, message: 'Quiz submitted successfully.', data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

router.get('/projects', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentProjects(studentId);
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/certifications', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentCertifications(studentId);
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/activity', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentLearningActivities(studentId);
    res.json({ success: true, data, count: data.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/intelligence', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentLearningIntelligence(studentId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/skill-gap', requireAuth, async (req, res) => {
  try {
    const studentId = await getEffectiveStudentId(req);
    const data = await relationalManager.getStudentSkillGapIntelligence(studentId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
