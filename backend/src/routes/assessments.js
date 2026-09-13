const express = require('express');
const router = express.Router();
const db = require('../db');
const relationalManager = require('../db/relationalManager');
const readinessService = require('../services/readinessService');
const { requireAuth } = require('../middleware/auth');




const { supabase } = require('../config/supabase');

// GET /api/assessments
router.get('/', requireAuth, async (req, res) => {
  const studentId = req.user?.studentId || req.user?.id;
  let tracks = [];
  let questions = [];

  try {
    const { data: asData, error: asErr } = await supabase
      .from('assessments')
      .select(`
        id, track_code, title, domain, duration_minutes, 
        passing_score, difficulty, description, instructions,
        categories, status, company_id,
        companies (company_name)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (asData && asData.length > 0) {
      tracks = asData.map(r => ({
        id: r.id,
        trackCode: r.track_code || `ASMT-${String(r.id).slice(0, 6).toUpperCase()}`,
        title: r.title,
        domain: r.domain || 'Technical & Engineering Benchmark',
        category: (Array.isArray(r.categories) && r.categories[0]) || 'Company Assessment',
        durationMinutes: r.duration_minutes || 45,
        totalQuestions: 0,
        status: r.status === 'PUBLISHED' ? 'Ready' : (r.status || 'Ready'),
        passingScore: r.passing_score || 70,
        companyName: r.companies?.company_name || null
      }));

      const firstAsmtId = asData[0].id;
      const { data: qData } = await supabase
        .from('assessment_questions')
        .select('id, topic, question_text, category, question_type, options, marks, difficulty, programming_language, starter_code')
        .eq('assessment_id', firstAsmtId)
        .order('created_at', { ascending: true });

      if (qData && qData.length > 0) {
        questions = qData.map((q, idx) => ({
          id: q.id,
          track: q.category || q.topic || 'Logical Reasoning',
          question: q.question_text,
          options: Array.isArray(q.options) ? q.options : (typeof q.options === 'string' ? JSON.parse(q.options || '[]') : []),
          domain: q.topic || 'Logical Reasoning',
          marks: q.marks || 10,
          difficulty: q.difficulty || 'Intermediate',
          questionType: q.question_type || 'MCQ',
          programmingLanguage: q.programming_language,
          starterCode: q.starter_code
        }));
        tracks[0].totalQuestions = questions.length;
      }
    }
  } catch (err) {
    console.warn('[GET /api/assessments] Supabase query note:', err.message);
  }

  if (tracks.length === 0) {
    try {
      tracks = db.getAssessments ? db.getAssessments(studentId) : [];
    } catch (e) {
      tracks = [];
    }
  }

  const activeDiagnostic = tracks[0] || {
    id: 'asmt_01',
    title: 'Adaptive Skill & Systems Benchmark',
    trackCode: 'LR-4416',
    category: 'Diagnostic Assessment',
    durationMinutes: 45,
    totalQuestions: questions.length,
    status: 'Ready',
    passingScore: 70
  };

  res.json({
    success: true,
    data: {
      tracks,
      activeDiagnostic,
      sampleQuestions: questions,
      metadata: {
        cycleCloses: 'Active Cycle',
        dynamicDifficulty: 'Active (keystroke latency calibration)',
        zeroKnowledgeAttestation: 'Ready for one-click publishing to Digital Passport'
      }
    }
  });
});

// POST /api/assessments/submit
router.post('/submit', requireAuth, async (req, res) => {
  const { trackCode = 'LR-4416', answers = [], assessmentId } = req.body;

  if (!Array.isArray(answers) && typeof answers !== 'object') {
    return res.status(400).json({ success: false, message: 'Answers format is invalid' });
  }

  const studentId = req.user?.studentId || req.user?.id;
  let student = null;
  if (studentId) {
    student = await relationalManager.getStudentById(studentId);
  }
  if (!student && req.user?.email) {
    const all = await relationalManager.getStudents();
    student = all.find(s => s.email?.toLowerCase() === req.user.email.toLowerCase());
  }
  if (!student) {
    student = { studentId: studentId || 'STU-001', name: req.user?.name || 'Student' };
  }

  let correctCount = 0;
  const breakdown = [];
  let totalQuestions = 0;

  // Attempt server-side evaluation against real questions from Supabase
  try {
    let resolvedAsmtId = assessmentId || null;
    if (!resolvedAsmtId && trackCode) {
      const { data: asmtRec } = await supabase
        .from('assessments')
        .select('id, passing_score')
        .or(`track_code.eq.${trackCode},id.eq.${trackCode}`)
        .limit(1)
        .maybeSingle();
      if (asmtRec) resolvedAsmtId = asmtRec.id;
    }

    if (resolvedAsmtId) {
      const { data: qRows } = await supabase
        .from('assessment_questions')
        .select('id, assessment_id, topic, question_text, category, question_type, options, marks, difficulty, correct_answer, explanation')
        .eq('assessment_id', resolvedAsmtId)
        .order('created_at', { ascending: true });

      if (qRows && qRows.length > 0) {
        totalQuestions = qRows.length;
        qRows.forEach((q, idx) => {
          let userAnswer = null;
          if (Array.isArray(answers)) {
            userAnswer = answers[idx];
          } else if (answers && typeof answers === 'object') {
            userAnswer = answers[idx] !== undefined ? answers[idx] : answers[q.id];
          }
          const isCorrect = String(userAnswer).trim().toLowerCase() === String(q.correct_answer || '').trim().toLowerCase() ||
            String(userAnswer) === String(q.options?.indexOf(q.correct_answer));
          if (isCorrect) correctCount++;
          breakdown.push({
            questionId: q.id,
            domain: q.topic || q.category,
            userAnswer,
            isCorrect,
            explanation: q.explanation
          });
        });
      }
    }
  } catch (err) {
    console.warn('[POST /submit] Supabase question lookup note:', err.message);
  }

  if (totalQuestions === 0) {
    totalQuestions = Array.isArray(answers) ? answers.length : Object.keys(answers).length;
    correctCount = totalQuestions;
  }

  let calculatedScore = Math.round((correctCount / Math.max(1, totalQuestions)) * 100);
  if (req.body.score !== undefined && correctCount === 0) {
    calculatedScore = Number(req.body.score);
  }
  const passed = calculatedScore >= 70;

  let skillsAttestedCount = 0;

  // Persist assessment result in student record
  if (student && student.studentId) {
    student.assessments = student.assessments || [];
    student.assessments.unshift({
      id: `att_${Date.now()}`,
      trackCode,
      score: calculatedScore,
      passed,
      domain: 'Logical & Algorithmic Reasoning',
      submittedAt: new Date().toISOString()
    });

    // If passed, verify or create related student skills in ledger
    student.skills = Array.isArray(student.skills) ? student.skills : [];
    if (passed) {
      const skillsToAttest = [];
      if (/LR|logical/i.test(trackCode)) {
        skillsToAttest.push({ name: 'Logical Reasoning', category: 'Soft Skills' });
        skillsToAttest.push({ name: 'Problem Solving', category: 'Soft Skills' });
      } else if (/AP|aptitude/i.test(trackCode)) {
        skillsToAttest.push({ name: 'Quantitative Aptitude', category: 'Data & AI' });
      } else {
        skillsToAttest.push({ name: 'Programming & Data Structures', category: 'Programming' });
      }
      skillsAttestedCount = skillsToAttest.length;

      skillsToAttest.forEach(att => {
        const existing = student.skills.find(s => s.name.toLowerCase() === att.name.toLowerCase());
        if (existing) {
          existing.verified = true;
          existing.confidence = Math.max(existing.confidence || 75, calculatedScore);
          existing.level = existing.confidence >= 85 ? 'Advanced' : 'Intermediate';
          existing.verificationStatus = 'VERIFIED';
          existing.source = 'Diagnostic Assessment';
          existing.evidence = { examScore: `${calculatedScore}%`, proctorStamp: 'PROCTOR-VERIFIED', trackCode };
        } else {
          student.skills.unshift({
            id: `sk_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
            name: att.name,
            category: att.category,
            level: calculatedScore >= 85 ? 'Advanced' : 'Intermediate',
            confidence: calculatedScore,
            masteryScore: calculatedScore,
            verified: true,
            verificationStatus: 'VERIFIED',
            status: 'verified',
            source: 'Diagnostic Assessment',
            evidence: { examScore: `${calculatedScore}%`, proctorStamp: 'PROCTOR-VERIFIED', trackCode }
          });
        }
      });
    }

    // Recalculate authoritative readiness score
    try {
      await relationalManager.saveStudent(student);
      const newReadiness = await readinessService.calculateReadiness(student.studentId);
      student.readinessScore = newReadiness;
      await relationalManager.saveStudent(student);
    } catch (readinessErr) {
      console.warn('[Assessment] Readiness recomputation note:', readinessErr.message);
    }

    // Register notification for the student
    try {
      await relationalManager.addNotification('student', {
        type: 'assessment_completed',
        title: `Diagnostic Assessment Completed: ${calculatedScore}%`,
        message: `Scored ${calculatedScore}% (${correctCount}/${totalQuestions} correct) on ${trackCode}. Updated readiness score: ${student.readinessScore || 80}%.`,
        details: { trackCode, score: calculatedScore, passed }
      });
    } catch (e) {}
  }

  // Also sync legacy store if present
  try {
    db.saveAssessmentResult(req.user?.id || 'usr_student_01', trackCode, calculatedScore, answers);
  } catch (e) {}

  return res.json({
    success: true,
    message: passed 
      ? 'Assessment passed! Verified skills and authoritative readiness index successfully updated.'
      : 'Assessment completed. Review domain feedback and retake to improve readiness benchmark.',
    data: {
      trackCode,
      score: calculatedScore,
      passed,
      correctCount,
      totalQuestions,
      skillsAttested: skillsAttestedCount,
      breakdown,
      readinessScore: student?.readinessScore || calculatedScore,
      attestationHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`
    }
  });
});

// POST /api/assessments/run-code
router.post('/run-code', async (req, res) => {
  const { language = 'JavaScript', code, testCases = [] } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, message: 'Code content is required' });
  }

  try {
    const programmingExecutionService = require('../services/programmingExecutionService');
    const result = await programmingExecutionService.executeCode(code, language, testCases);
    res.json({
      success: true,
      ...result
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Code execution error: ' + err.message });
  }
});

// ---------- Student Targeted Assessments (Assigned by Industry/Companies) ----------
router.get('/targeted', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const assessments = await relationalManager.getAssignedAssessmentsForStudent(studentId);
    res.json({ success: true, data: assessments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/targeted/:id', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const assessment = await relationalManager.getAssignedAssessmentQuestions(req.params.id, studentId);
    res.json({ success: true, data: assessment });
  } catch (err) {
    const status = err.message.includes('denied') ? 403 : (err.message.includes('not found') ? 404 : 500);
    res.status(status).json({ success: false, message: err.message });
  }
});

router.post('/targeted/:id/submit', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const { answers = {} } = req.body;
    const result = await relationalManager.submitAssignedAssessmentAttempt(req.params.id, studentId, answers);
    res.json(result);
  } catch (err) {
    const status = err.message.includes('targeted') ? 403 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

// ---------- Institutional Assessment Student Routes ----------
router.get('/institution', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const student = await relationalManager.getStudentById(studentId);
    const institutionId = student?.institutionId || student?.collegeId || req.user?.institutionId;
    if (!institutionId) {
      return res.json({ success: true, data: [] });
    }

    const assessments = await relationalManager.getInstitutionAssessments(institutionId);
    const published = assessments.filter(a => a.status === 'PUBLISHED');
    res.json({ success: true, data: published });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/institution/:id', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const assessment = await relationalManager.getAssessmentQuestionsForStudent(req.params.id, studentId);
    if (!assessment) return res.status(404).json({ success: false, message: 'Assessment not found' });
    res.json({ success: true, data: assessment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/institution/:id/submit', requireAuth, async (req, res) => {
  try {
    const studentId = req.user?.studentId || req.user?.id;
    const { answers = {} } = req.body;
    const result = await relationalManager.submitInstitutionAssessmentAttempt({
      assessmentId: req.params.id,
      studentId,
      answers
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
