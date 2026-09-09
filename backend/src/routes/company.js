const express = require('express');
const router = express.Router();
const relationalManager = require('../db/relationalManager');
const { requireAuth } = require('../middleware/auth');

// Middleware to enforce tenant (company) isolation
function verifyCompany(req, res, next) {
  const userRole = (req.user?.role || '').toLowerCase();
  if (!['company', 'admin'].includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Company role required' });
  }
  const companyId = req.user?.companyId;
  if (!companyId && userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Company context missing' });
  }
  req.companyId = companyId || req.query.companyId || 'COMP-001';
  next();
}

// ---------- Companies ----------
router.get('/', requireAuth, async (req, res) => {
  try {
    const companies = await relationalManager.getCompanies();
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Opportunities (Scoped to Company) ----------
router.get('/opportunities', requireAuth, verifyCompany, async (req, res) => {
  try {
    const opps = await relationalManager.getOpportunitiesByCompany(req.companyId);
    res.json({ success: true, data: opps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/opportunities', requireAuth, verifyCompany, async (req, res) => {
  try {
    if (!['admin', 'company'].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Insufficient privileges' });
    }
    const created = await relationalManager.createOpportunity({ ...req.body, companyId: req.companyId });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Candidates (Students) ----------
router.get('/candidates', requireAuth, verifyCompany, async (req, res) => {
  try {
    const candidates = await relationalManager.getStudentsByCompany(req.companyId);
    res.json({ success: true, data: candidates });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Dashboard ----------
router.get('/dashboard', requireAuth, verifyCompany, async (req, res) => {
  try {
    const dashboard = await relationalManager.getCompanyDashboard(req.companyId);
    res.json({ success: true, data: dashboard });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Profile Update ----------
router.put('/profile', requireAuth, verifyCompany, async (req, res) => {
  try {
    const updated = await relationalManager.updateCompany(req.companyId, req.body);
    if (!updated) return res.status(404).json({ success: false, message: 'Company not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Opportunity Detail ----------
router.get('/opportunities/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const opp = await relationalManager.getOpportunityById(req.params.id);
    if (!opp || opp.companyId !== req.companyId) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    res.json({ success: true, data: opp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/opportunities/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const updated = await relationalManager.updateOpportunity(req.params.id, req.body, req.companyId);
    if (!updated) return res.status(404).json({ success: false, message: 'Opportunity not found or unauthorized' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/opportunities/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const deleted = await relationalManager.deleteOpportunity(req.params.id, req.companyId);
    if (!deleted) return res.status(404).json({ success: false, message: 'Opportunity not found or unauthorized' });
    res.json({ success: true, message: 'Opportunity deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Talent Pools ----------
router.get('/talent-pools', requireAuth, verifyCompany, async (req, res) => {
  try {
    const pools = await relationalManager.getTalentPoolsByCompany(req.companyId);
    res.json({ success: true, data: pools });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/talent-pools', requireAuth, verifyCompany, async (req, res) => {
  try {
    const created = await relationalManager.createTalentPool({ ...req.body, companyId: req.companyId });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/talent-pools/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const pools = await relationalManager.getTalentPoolsByCompany(req.companyId);
    const pool = pools.find(p => p.poolId === req.params.id);
    if (!pool) return res.status(404).json({ success: false, message: 'Talent pool not found' });
    res.json({ success: true, data: pool });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/talent-pools/:id/candidates', requireAuth, verifyCompany, async (req, res) => {
  try {
    const updated = await relationalManager.addCandidateToTalentPool(req.params.id, req.body.studentId);
    if (!updated) return res.status(404).json({ success: false, message: 'Talent pool not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/talent-pools/:id/candidates/:studentId', requireAuth, verifyCompany, async (req, res) => {
  try {
    const success = await relationalManager.removeCandidateFromTalentPool(req.params.id, req.params.studentId);
    if (!success) return res.status(404).json({ success: false, message: 'Talent pool or candidate not found' });
    res.json({ success: true, message: 'Candidate removed' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Matches for Opportunity ----------
router.get('/opportunities/:id/matches', requireAuth, verifyCompany, async (req, res) => {
  try {
    const matchingService = require('../services/matchingService');
    const opp = await relationalManager.getOpportunityById(req.params.id);
    if (!opp || (opp.companyId && opp.companyId !== req.companyId && opp.company_id !== req.companyId)) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    const students = await relationalManager.getStudents(); // all students
    const matches = [];
    for (const student of students) {
      if (!student.studentId) continue;
      try {
        const result = await matchingService.matchStudentToOpportunity(student.studentId, opp.oppId || opp.opp_id);
        if (result) {
          matches.push({
            studentId: student.studentId,
            name: student.name,
            matchScore: result.matchScore,
            matchedSkills: result.matchedSkills,
            missingSkills: result.missingSkills,
            explanation: result.explanation
          });
        }
      } catch (e) { /* skip unmatched students */ }
    }
    matches.sort((a, b) => b.matchScore - a.matchScore);
    res.json({ success: true, data: matches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Applications ----------
router.get('/applications', requireAuth, verifyCompany, async (req, res) => {
  try {
    const apps = await relationalManager.getApplicationsByCompany(req.companyId);
    res.json({ success: true, data: apps });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/applications/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const app = await relationalManager.getApplicationById(req.params.id, req.companyId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: app });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.patch('/applications/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ success: false, message: 'Stage is required' });
    const app = await relationalManager.getApplicationById(req.params.id, req.companyId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });

    const updated = await relationalManager.updateApplicationStage(req.params.id, stage, req.user?.id);
    if (!updated) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/applications/:id/stage', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { stage } = req.body;
    if (!stage) return res.status(400).json({ success: false, message: 'Stage is required' });
    const app = await relationalManager.getApplicationById(req.params.id, req.companyId);
    if (!app) return res.status(404).json({ success: false, message: 'Application not found or unauthorized' });

    const updated = await relationalManager.updateApplicationStage(req.params.id, stage, req.user?.id);
    if (!updated) return res.status(404).json({ success: false, message: 'Application not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Interviews ----------
router.get('/interviews', requireAuth, verifyCompany, async (req, res) => {
  try {
    const ints = await relationalManager.getInterviewsByCompany(req.companyId);
    res.json({ success: true, data: ints });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/interviews', requireAuth, verifyCompany, async (req, res) => {
  try {
    const created = await relationalManager.createInterview({ ...req.body, companyId: req.companyId });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/interviews/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const updated = await relationalManager.updateInterview(req.params.id, req.body, req.companyId);
    if (!updated) return res.status(404).json({ success: false, message: 'Interview not found or unauthorized' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Partnerships ----------
router.get('/partnerships', requireAuth, verifyCompany, async (req, res) => {
  try {
    const parts = await relationalManager.getPartnershipsByCompany(req.companyId);
    const reqs = await relationalManager.getCompanyAccessRequests(req.companyId);
    const formattedReqs = (reqs || []).map(r => ({
      id: r.id,
      requestId: r.id,
      institutionId: r.institutionId,
      institutionName: r.institutionName,
      companyId: req.companyId,
      type: 'COLLABORATION_REQUEST',
      status: r.status,
      message: r.message,
      studentCount: r.studentCount,
      createdAt: r.requestedAt
    }));
    res.json({ success: true, data: [...parts, ...formattedReqs] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/partnerships/:id/accept', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.respondToStudentAccessRequest(req.params.id, req.companyId, 'ACCEPTED', req.user?.id);
    const data = relationalManager._read();
    const reqRecord = (data.accessRequests || []).find(r => r.id === req.params.id || r.requestId === req.params.id);
    const instId = reqRecord?.institutionId || 'INST-001';
    let part = (data.partnerships || []).find(p => p.id === req.params.id || (p.companyId === req.companyId && p.institutionId === instId));
    if (!part) {
      part = {
        id: req.params.id,
        institutionId: instId,
        companyId: req.companyId,
        status: 'ACCEPTED',
        createdAt: new Date().toISOString()
      };
      data.partnerships = data.partnerships || [];
      data.partnerships.unshift(part);
      relationalManager._write(data);
    } else {
      part.status = 'ACCEPTED';
      relationalManager._write(data);
    }
    res.json({ success: true, data: { ...result, status: 'ACCEPTED', partnership: part } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/partnerships', requireAuth, verifyCompany, async (req, res) => {
  try {
    const created = await relationalManager.createPartnership({ ...req.body, companyId: req.companyId });
    res.status(201).json({ success: true, data: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/institutions/:institutionId/students', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { institutionId } = req.params;
    const data = relationalManager._read();
    const isPartnered = (data.partnerships || []).some(p => 
      (p.companyId === req.companyId || p.company_id === req.companyId) &&
      (p.institutionId === institutionId || p.institution_id === institutionId) &&
      (p.status === 'ACCEPTED' || p.status === 'ACTIVE')
    ) || (data.accessRequests || []).some(r =>
      (r.companyId === req.companyId || r.company_id === req.companyId) &&
      (r.institutionId === institutionId || r.institution_id === institutionId) &&
      r.status === 'ACCEPTED'
    );

    if (!isPartnered) {
      return res.status(403).json({ success: false, message: 'Forbidden: No active partnership with this institution' });
    }

    const instStudents = await relationalManager.getStudents(institutionId);
    const sharedStudentIds = new Set(
      (data.sharedStudents || [])
        .filter(s => (s.companyId === req.companyId || s.company_id === req.companyId) && s.accessStatus === 'ACTIVE')
        .map(s => s.studentId || s.student_id)
    );
    const authorized = instStudents.filter(s => sharedStudentIds.has(s.studentId || s.id) || sharedStudentIds.size === 0);
    res.json({ success: true, data: authorized });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Student Access Requests ----------
router.get('/student-access-requests', requireAuth, verifyCompany, async (req, res) => {
  try {
    const requests = await relationalManager.getCompanyAccessRequests(req.companyId);
    res.json({ success: true, data: requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/student-access-requests/:id/respond', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { action, notes } = req.body;
    const normalizedAction = String(action || 'ACCEPTED').toUpperCase();
    const result = await relationalManager.respondToStudentAccessRequest(req.params.id, req.companyId, normalizedAction, req.user?.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/student-access-requests/:id/accept', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.respondToStudentAccessRequest(req.params.id, req.companyId, 'ACCEPTED', req.user?.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/student-access-requests/:id/reject', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.respondToStudentAccessRequest(req.params.id, req.companyId, 'REJECTED', req.user?.id);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/student-access-requests/:id/revoke', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.revokeCompanyAccess(req.params.id, { companyId: req.companyId });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Authorized Students Management ----------
router.get('/authorized-students', requireAuth, verifyCompany, async (req, res) => {
  try {
    const students = await relationalManager.getAuthorizedStudentsByCompany(req.companyId);
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get(['/students/:studentId', '/candidates/:studentId'], requireAuth, verifyCompany, async (req, res) => {
  try {
    const { studentId } = req.params;
    const isShared = await relationalManager.isStudentSharedWithCompany(studentId, req.companyId);
    if (!isShared) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have authorized access to this student profile'
      });
    }

    const student = await relationalManager.getStudentById(studentId);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

    const { password, passwordHash, token, google_id, ...safeStudent } = student;
    res.json({ success: true, data: safeStudent });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/students/:studentId/development', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { studentId } = req.params;
    const isShared = await relationalManager.isStudentSharedWithCompany(studentId, req.companyId);
    if (!isShared) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You do not have authorized access to this student timeline'
      });
    }

    const timeline = await relationalManager.getStudentDevelopmentTimeline(studentId);
    const events = Array.isArray(timeline) ? timeline : (timeline?.events || []);
    res.json({
      success: true,
      data: events
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Placement Offers ----------
router.post('/applications/:id/offer', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { studentId, opportunityId, offerDetails } = req.body;
    const result = await relationalManager.createOffer({
      companyId: req.companyId,
      applicationId: req.params.id,
      studentId,
      opportunityId,
      offerDetails
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Course Learner Profile (Scoped to Course & Company) ----------
router.get('/courses/:courseId/students/:studentId/profile', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { courseId, studentId } = req.params;
    const profile = await relationalManager.getCourseLearnerProfileForCompany(req.companyId, courseId, studentId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Learner profile or enrollment not found for this course' });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Course-Wise Skill Benchmark Talent Discovery ----------
router.post('/talent-discovery', requireAuth, verifyCompany, async (req, res) => {
  try {
    const searchParams = req.body || {};
    const result = await relationalManager.searchTalentEcosystem(req.companyId, searchParams);
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/skills-catalog', requireAuth, async (req, res) => {
  try {
    const catalog = await relationalManager.getSkillCatalog();
    res.json({ success: true, data: catalog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/courses-catalog', requireAuth, async (req, res) => {
  try {
    const catalog = await relationalManager.getCourseCatalog();
    res.json({ success: true, data: catalog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Company Details by ID (fallback for non-static routes) ----------
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const company = await relationalManager.getCompanyById(req.params.id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.json({ success: true, data: company });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
