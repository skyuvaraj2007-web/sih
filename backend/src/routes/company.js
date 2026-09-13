const express = require('express');
const router = express.Router();
const relationalManager = require('../db/relationalManager');
const { supabase } = require('../config/supabase');
const { requireAuth } = require('../middleware/auth');

// Middleware to enforce tenant (company) isolation
function verifyCompany(req, res, next) {
  const userRole = (req.user?.role || '').toLowerCase();
  if (!['company', 'industry', 'corporate', 'admin'].includes(userRole)) {
    return res.status(403).json({ success: false, message: 'Forbidden: Company role required' });
  }
  const companyId = req.user?.companyId || req.user?.id;
  if (!companyId && userRole !== 'admin') {
    return res.status(403).json({ success: false, message: 'Company context missing' });
  }
  req.companyId = companyId || req.query.companyId || null;
  next();
}

// ---------- Company Profile ----------
router.get('/profile', requireAuth, verifyCompany, async (req, res) => {
  try {
    const profile = await relationalManager.getCompanyProfile(req.companyId);
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Company profile not found' });
    }
    res.json({ success: true, data: profile });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/profile', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { companyName, industry, website, headquarters, state } = req.body;
    try {
      const updateData = { updated_at: new Date().toISOString() };
      if (companyName) updateData.company_name = companyName;
      if (industry) updateData.industry = industry;
      if (website) updateData.website_url = website;
      if (headquarters) updateData.headquarters = headquarters;
      if (state) updateData.state = state;
      await supabase.from('companies').update(updateData).eq('id', req.companyId);
    } catch (err) {
      console.warn('[company] Supabase profile update note:', err.message);
    }
    const updated = await relationalManager.getCompanyProfile(req.companyId);
    res.json({ success: true, message: 'Company profile updated successfully', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Companies ----------
router.get('/', requireAuth, async (req, res) => {
  try {
    const companies = await relationalManager.getCompanies();
    res.json({ success: true, data: companies });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Opportunities (Scoped to Company or Public) ----------
router.get('/opportunities', async (req, res) => {
  if (req.headers.authorization) {
    return requireAuth(req, res, () => {
      verifyCompany(req, res, async () => {
        try {
          const opps = await relationalManager.getOpportunitiesByCompany(req.companyId);
          res.json({ success: true, data: opps });
        } catch (err) {
          res.status(500).json({ success: false, message: err.message });
        }
      });
    });
  }
  try {
    const opps = await relationalManager.getOpportunities();
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
    res.json({ success: true, data: pools || [] });
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
    const oppCompanyId = opp ? (opp.companyId || opp.company_id) : null;
    if (!opp || !oppCompanyId || (String(oppCompanyId) !== String(req.companyId) && req.user?.role !== 'admin')) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }
    const students = await relationalManager.getStudents(); // all students
    const matches = [];
    for (const student of students) {
      if (!student.studentId && !student.id) continue;
      try {
        const result = matchingService.calculateMatch(student, opp);
        if (result) {
          matches.push({
            studentId: student.studentId || student.id,
            name: student.name || student.fullName,
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

router.post('/applications/:id/select', requireAuth, verifyCompany, async (req, res) => {
  try {
    const selected = await relationalManager.selectStudentForTesting(req.params.id, {
      userId: req.user?.id,
      role: 'company'
    });
    res.json({ success: true, message: 'Student selected for company testing.', data: selected });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ---------- Certificates ----------
router.get('/certificates', requireAuth, verifyCompany, async (req, res) => {
  try {
    const certs = await relationalManager.getCompanyCertificates(req.companyId);
    res.json({ success: true, data: certs });
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
    let part = null;
    try {
      const { data: pUp } = await supabase
        .from('company_institution_partnerships')
        .update({ status: 'ACCEPTED' })
        .eq('id', req.params.id)
        .select();
      if (pUp && pUp.length > 0) part = pUp[0];
    } catch (e) {}
    if (!part && !relationalManager.isPgRequired) {
      const data = relationalManager._read();
      const reqRecord = (data.accessRequests || []).find(r => r.id === req.params.id || r.requestId === req.params.id);
      const instId = reqRecord?.institutionId || 'INST-001';
      part = (data.partnerships || []).find(p => p.id === req.params.id || (p.companyId === req.companyId && p.institutionId === instId));
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
    }
    res.json({ success: true, data: { ...result, status: 'ACCEPTED', partnership: part || { id: req.params.id, status: 'ACCEPTED' } } });
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
    let isPartnered = false;
    try {
      const { data: pRes } = await supabase
        .from('company_institution_partnerships')
        .select('id')
        .or(`company_id.eq.${req.companyId}`)
        .in('status', ['ACTIVE', 'ACCEPTED'])
        .limit(1);
      isPartnered = Boolean(pRes && pRes.length > 0);
    } catch (e) {}

    if (!isPartnered && !relationalManager.isPgRequired) {
      const data = relationalManager._read();
      isPartnered = (data.partnerships || []).some(p =>
        (p.companyId === req.companyId || p.company_id === req.companyId) &&
        (p.institutionId === institutionId || p.institution_id === institutionId) &&
        (p.status === 'ACCEPTED' || p.status === 'ACTIVE')
      ) || (data.accessRequests || []).some(r =>
        (r.companyId === req.companyId || r.company_id === req.companyId) &&
        (r.institutionId === institutionId || r.institution_id === institutionId) &&
        r.status === 'ACCEPTED'
      );
    }

    if (!isPartnered) {
      return res.status(403).json({ success: false, message: 'Forbidden: No active partnership with this institution' });
    }

    const instStudents = await relationalManager.getStudents(institutionId);
    let sharedStudentIds = new Set();
    if (!relationalManager.isPgRequired) {
      const data = relationalManager._read();
      sharedStudentIds = new Set(
        (data.sharedStudents || [])
          .filter(s => (s.companyId === req.companyId || s.company_id === req.companyId) && s.accessStatus === 'ACTIVE')
          .map(s => s.studentId || s.student_id)
      );
    }
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

// ---------- Targeted Student Search with Benchmark & Verified Evidence ----------
router.post('/targeted-students', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.getTargetedStudents(req.companyId, req.body || {});
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/targeted-students', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.getTargetedStudents(req.companyId, req.query || {});
    res.json(result);
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

router.get('/courses', requireAuth, async (req, res) => {
  try {
    const catalog = await relationalManager.getCourseCatalog();
    res.json({ success: true, data: catalog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/courses', requireAuth, verifyCompany, async (req, res) => {
  try {
    const {
      title,
      code,
      courseCode,
      category,
      level,
      difficulty,
      durationWeeks,
      duration_weeks,
      duration,
      hours,
      instructor,
      institutionId,
      institution_id,
      skillsDeveloped,
      skillsTaught,
      skills,
      modules,
      description
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: 'Course title is required' });
    }

    const created = await relationalManager.createCourse({
      title: title.trim(),
      code: code || courseCode,
      category: category || 'Cloud Computing',
      level: level || difficulty || 'Intermediate',
      difficulty: level || difficulty || 'Intermediate',
      durationWeeks: durationWeeks || duration_weeks || 8,
      hours: hours || 24,
      instructor: instructor || 'Campus Faculty / Industry Lead',
      companyId: req.companyId,
      companyName: req.user?.companyName || req.user?.company || 'Enterprise Partner',
      institutionId: institutionId || institution_id || null,
      skillsTaught: skillsDeveloped || skillsTaught || skills || [],
      modules: modules || [],
      description: description || ''
    });

    res.status(201).json({
      success: true,
      data: created,
      message: 'Course published successfully! Collaboration institution and students have been notified.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ════════════════════════════════════════════════════════════════
// COMPANY TARGETED ASSESSMENTS & NEXUS AI QUESTION GENERATION
// ════════════════════════════════════════════════════════════════

router.get('/assessments', requireAuth, verifyCompany, async (req, res) => {
  try {
    const list = await relationalManager.getCompanyAssessments(req.companyId);
    res.json({ success: true, data: list });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments', requireAuth, verifyCompany, async (req, res) => {
  try {
    const assessment = await relationalManager.createCompanyAssessment(req.companyId, req.body);
    res.status(201).json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments/ai-drafts', requireAuth, verifyCompany, async (req, res) => {
  const { category = 'Logical Reasoning', topic = 'Algorithms', difficulty = 'Intermediate', count = 3, targetRole = 'Software Engineer' } = req.body;

  const AIProvider = require('../services/ai/aiProvider');
  const ai = new AIProvider();

  if (!ai.isAvailable()) {
    return res.status(503).json({
      success: false,
      code: 'AI_UNAVAILABLE',
      message: 'NEXUS AI service is currently unavailable or offline. Manual question creation is available.'
    });
  }

  try {
    const prompt = `Generate ${count} assessment questions for role "${targetRole}" in category "${category}" on topic "${topic}" at "${difficulty}" difficulty.
Respond ONLY with a valid JSON array of objects with the following format:
For MCQ (Logical Reasoning or Aptitude):
[
  {
    "category": "${category}",
    "questionType": "MCQ",
    "questionText": "Question description",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "Option A",
    "explanation": "Brief explanation",
    "marks": 2,
    "difficulty": "${difficulty}"
  }
]
For Programming:
[
  {
    "category": "Programming",
    "questionType": "CODE",
    "questionText": "Problem description",
    "programmingLanguage": "JavaScript",
    "starterCode": "function solution(input) {\\n  // Return answer\\n}",
    "inputDescription": "Input format",
    "outputDescription": "Return value",
    "constraints": "Constraints",
    "testCases": [
      { "input": "test1", "expectedOutput": "out1", "isHidden": false },
      { "input": "test2", "expectedOutput": "out2", "isHidden": true }
    ],
    "marks": 10,
    "difficulty": "${difficulty}"
  }
]`;

    const aiRes = await ai.generateCompletion({
      prompt,
      systemPrompt: 'You are NEXUS AI, an assessment creator for SkillNexus enterprise hiring. Output pure JSON without markdown.',
      temperature: 0.3
    });

    if (!aiRes.success || !aiRes.text) {
      return res.status(503).json({
        success: false,
        code: 'AI_UNAVAILABLE',
        message: aiRes.message || 'AI question generation failed.'
      });
    }

    let cleanJson = aiRes.text.trim();
    if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```json\s*/i, '').replace(/^```\s*/, '').replace(/```$/, '').trim();
    }

    let drafts = JSON.parse(cleanJson);
    if (!Array.isArray(drafts)) drafts = [drafts];

    const validatedDrafts = drafts.map((d, i) => ({
      id: `draft_${Date.now()}_${i}`,
      category: d.category || category,
      questionType: d.questionType || (category === 'Programming' ? 'CODE' : 'MCQ'),
      questionText: d.questionText || d.question || 'Technical Problem',
      options: Array.isArray(d.options) ? d.options : [],
      correctAnswer: d.correctAnswer !== undefined ? String(d.correctAnswer) : '',
      explanation: d.explanation || '',
      marks: Number(d.marks || (category === 'Programming' ? 10 : 2)),
      difficulty: d.difficulty || difficulty,
      programmingLanguage: d.programmingLanguage || 'JavaScript',
      starterCode: d.starterCode || '',
      inputDescription: d.inputDescription || '',
      outputDescription: d.outputDescription || '',
      constraints: d.constraints || '',
      testCases: Array.isArray(d.testCases) ? d.testCases : [],
      status: 'AI_DRAFT_REVIEW_REQUIRED'
    }));

    res.json({
      success: true,
      code: 'AI_DRAFTS_GENERATED',
      message: 'NEXUS AI drafted questions. Review and approve before publishing.',
      data: validatedDrafts
    });
  } catch (err) {
    console.error('[ai-drafts] Error:', err.message);
    res.status(500).json({ success: false, code: 'AI_PARSE_ERROR', message: 'Failed to parse AI questions. Try manual question creation.' });
  }
});

router.get('/assessments/:id', requireAuth, verifyCompany, async (req, res) => {
  try {
    const assessment = await relationalManager.getCompanyAssessmentById(req.params.id, req.companyId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found or unauthorized' });
    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments/:id/questions', requireAuth, verifyCompany, async (req, res) => {
  try {
    const question = await relationalManager.addAssessmentQuestion(req.params.id, req.companyId, req.body);
    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete('/assessments/:id/questions/:qId', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.deleteAssessmentQuestion(req.params.qId, req.params.id, req.companyId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments/:id/targets', requireAuth, verifyCompany, async (req, res) => {
  try {
    const { studentIds = [] } = req.body;
    const result = await relationalManager.assignAssessmentTargets(req.params.id, req.companyId, studentIds);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/assessments/:id/publish', requireAuth, verifyCompany, async (req, res) => {
  try {
    const result = await relationalManager.publishAssessment(req.params.id, req.companyId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/assessments/:id/results', requireAuth, verifyCompany, async (req, res) => {
  try {
    const results = await relationalManager.getCompanyAssessmentResults(req.params.id, req.companyId);
    res.json({ success: true, data: results });
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
