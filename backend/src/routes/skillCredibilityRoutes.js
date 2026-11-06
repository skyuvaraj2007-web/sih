/**
 * Skill Credibility Routes — Phase 2
 * 
 * Endpoints for retrieving evidence-based Skill Credibility scores,
 * multi-source breakdown, recency, consistency, and transparent factors.
 */
const express = require('express');
const router = express.Router();
const skillCredibilityService = require('../services/skillCredibilityService');
const { requireAuth } = require('../middleware/auth');
const skillGraphService = require('../services/skillGraphService');
const relationalManager = require('../db/relationalManager');

/**
 * Resolve student entity securely from JWT
 */
async function resolveAuthStudent(req) {
  const studentIdentifier = req.user?.studentId || req.user?.id || req.user?.userId;
  let stu = await skillGraphService.resolveStudent(studentIdentifier);
  if (!stu && req.user?.email) {
    stu = await skillGraphService.resolveStudent(req.user.email);
  }
  if (!stu) {
    try {
      const rawStu = await relationalManager.getStudentById(studentIdentifier || req.user?.email);
      if (rawStu) {
        stu = {
          id: rawStu.id || rawStu.studentId,
          user_id: rawStu.userId || rawStu.user_id || rawStu.id,
          institution_id: rawStu.institutionId || rawStu.institution_id || rawStu.collegeId,
          full_name: rawStu.name || rawStu.fullName || rawStu.full_name,
          roll_number: rawStu.rollNumber || rawStu.roll_number,
          user_email: rawStu.email || rawStu.user_email || req.user?.email,
          readiness_score: rawStu.readinessScore || 75
        };
      }
    } catch (e) {
      console.warn('[resolveAuthStudent] relationalManager student resolution notice:', e.message);
    }
  }
  return stu;
}

/**
 * GET /api/skill-credibility/me
 * Authenticated student's skill credibility scores
 */
router.get('/me', requireAuth, async (req, res) => {
  try {
    const student = await resolveAuthStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const scores = await skillCredibilityService.getStudentCredibilityScores(student.id);
    return res.json({
      success: true,
      data: scores
    });
  } catch (err) {
    console.error('Error in GET /api/skill-credibility/me:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve skill credibility scores' });
  }
});

/**
 * GET /api/skill-credibility/:skillId
 * Detailed credibility breakdown & factor explanation for single skill
 */
router.get('/:skillId', requireAuth, async (req, res) => {
  try {
    const student = await resolveAuthStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const explanation = await skillCredibilityService.explainSkillCredibility(student.id, req.params.skillId);
    if (!explanation) {
      return res.status(404).json({ success: false, message: 'Skill or credibility record not found' });
    }

    return res.json({
      success: true,
      data: explanation
    });
  } catch (err) {
    console.error('Error in GET /api/skill-credibility/:skillId:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve skill credibility explanation' });
  }
});

/**
 * POST /api/skill-credibility/recalculate
 * Explicit recalculation of all skill credibility scores
 */
router.post('/recalculate', requireAuth, async (req, res) => {
  try {
    const student = await resolveAuthStudent(req);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    const scores = await skillCredibilityService.calculateAllSkillCredibility(student.id);
    return res.json({
      success: true,
      message: 'Skill credibility recalculated successfully',
      data: scores
    });
  } catch (err) {
    console.error('Error in POST /api/skill-credibility/recalculate:', err);
    return res.status(500).json({ success: false, message: 'Failed to recalculate skill credibility' });
  }
});

/**
 * GET /api/skill-credibility/student/:id
 * Authorized institution / academician access
 */
router.get('/student/:id', requireAuth, async (req, res) => {
  try {
    const targetStudentId = req.params.id;
    const callerRole = req.user?.role;

    // Student can only access their own record
    if (callerRole === 'student') {
      const myStudent = await resolveAuthStudent(req);
      if (!myStudent || myStudent.id !== targetStudentId) {
        return res.status(403).json({ success: false, message: 'Forbidden: Cannot access another student\'s credibility scores' });
      }
    } else if (callerRole === 'institution' || callerRole === 'academician' || callerRole === 'faculty') {
      const targetStudent = await skillGraphService.resolveStudent(targetStudentId);
      if (!targetStudent) {
        return res.status(404).json({ success: false, message: 'Student not found' });
      }
      const callerInstId = req.user?.institutionId || req.user?.institution_id;
      if (callerInstId && targetStudent.institution_id !== callerInstId) {
        return res.status(403).json({ success: false, message: 'Forbidden: Student belongs to another institution' });
      }
    } else if (callerRole === 'industry') {
      return res.status(403).json({ success: false, message: 'Forbidden: Industry cannot access unauthorized candidate information' });
    } else if (callerRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Insufficient privileges' });
    }

    const scores = await skillCredibilityService.getStudentCredibilityScores(targetStudentId);
    return res.json({
      success: true,
      data: scores
    });
  } catch (err) {
    console.error('Error in GET /api/skill-credibility/student/:id:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve student skill credibility' });
  }
});

module.exports = router;
