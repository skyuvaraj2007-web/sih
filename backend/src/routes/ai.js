const express = require('express');
const router = express.Router();
const relationalManager = require('../db/relationalManager');
const { requireAuth } = require('../middleware/auth');

// POST /api/ai/chat
router.post('/chat', requireAuth, async (req, res) => {
  try {
    const { message } = req.body;
    const studentId = req.user?.studentId || req.user?.id;
    let student = await relationalManager.getStudentById(studentId);
    if (!student && req.user?.email) {
      const all = await relationalManager.getStudents();
      student = all.find(s => s.email?.toLowerCase() === req.user.email.toLowerCase());
    }

    const query = (message || '').toLowerCase();
    const studentName = student?.name || req.user?.name || 'Scholar';
    const skills = Array.isArray(student?.skills) ? student.skills : [];
    const enrollments = student ? await relationalManager.getEnrollments(student.studentId || student.id) : [];
    const assessments = Array.isArray(student?.assessments) ? student.assessments : [];
    const commActs = Array.isArray(student?.communication?.activities) ? student.communication.activities : [];
    const readiness = Number(student?.readinessScore || student?.careerReadinessScore || 0);

    let reply = '';
    let suggestions = [];

    const isCommQuery = query.includes('communication') || query.includes('speak') || query.includes('interview') || query.includes('english') || query.includes('soft skill') || query.includes('presentation') || query.includes('dialogue');
    const hasNoActivity = skills.length === 0 && enrollments.length === 0 && assessments.length === 0 && commActs.length === 0;

    if (isCommQuery) {
      const comm = student?.communication || {};
      const cats = comm.categories || {};
      const overall = Number(comm.overallScore) || 0;

      if (commActs.length === 0) {
        reply = `You currently have **0% recorded Communication capability**. Daily communication practice, workplace dialogues, and speaking exercises will directly elevate your interview readiness and corporate collaboration scores.`;
        suggestions = ['Start Daily Communication Drill', 'Practice Interview Speaking', 'Workplace Vocabulary'];
      } else {
        const catList = [
          { name: 'Speaking', score: Number(cats.speaking?.score ?? cats.speaking ?? 0) },
          { name: 'Vocabulary', score: Number(cats.vocabulary?.score ?? cats.vocabulary ?? 0) },
          { name: 'Grammar', score: Number(cats.grammar?.score ?? cats.grammar ?? 0) },
          { name: 'Conversation', score: Number(cats.conversation?.score ?? cats.conversation ?? 0) },
          { name: 'Listening', score: Number(cats.listening?.score ?? cats.listening ?? 0) },
          { name: 'Reading', score: Number(cats.reading?.score ?? cats.reading ?? 0) }
        ].sort((a, b) => a.score - b.score);

        const lowest = catList[0];
        const highest = catList[catList.length - 1];

        reply = `Your overall Communication index is **${overall}%** (${commActs.length} exercises completed). **${lowest.name} practice is the current communication priority** (${lowest.score}%). Your strongest area is **${highest.name}** (${highest.score}%). Focusing on ${lowest.name.toLowerCase()} drills will yield the highest interview ROI.`;
        suggestions = [`Start ${lowest.name} Practice`, 'Complete Daily Communication Sprint', 'Practice Engineering Dialogue'];
      }
    } else if (hasNoActivity) {
      reply = `Greetings ${studentName}! I am NEXUS AI. You currently have no recorded skill evidence, assessments, or course enrollments. Complete your first diagnostic assessment or add skills to baseline your capability index!`;
      suggestions = ['Start Diagnostic Assessment', 'Explore Course Catalog', 'Add Verified Skills'];
    } else if (query.includes('gap') || query.includes('skill') || query.includes('improve') || query.includes('next') || query.includes('action')) {
      const skillIntel = student ? await relationalManager.getAllStudentSkillIntelligence(student.studentId || student.id) : [];
      if (skillIntel.length > 0) {
        const primary = skillIntel.find(s => s.proficiency < 85) || skillIntel[0];
        const nextAction = primary.bestNextAction || { action: 'Continue Curriculum', reason: 'Advance your module lessons' };
        reply = `In **${primary.skillName}**, your Learning Progress is **${primary.learningProgress}%** and demonstrated Skill Proficiency is **${primary.proficiency}%** (${primary.completedLessons}/${primary.totalLessons} lessons, ${primary.practiceStats?.totalAttempts || 0} practice attempts at ${primary.practiceStats?.accuracy || 0}% accuracy). **Best Next Action:** ${nextAction.action}. *Why this is recommended:* ${nextAction.reason}`;
        suggestions = [nextAction.action, `Practice ${primary.skillName} Drills`, 'View Skill Intelligence'];
      } else {
        const sp = student?.skillProfile;
        const missing = sp?.missingSkills || [];
        if (missing.length > 0) {
          reply = `Based on your target role (${sp?.targetRole || 'Full Stack Engineer'}), your primary skill gap is **${missing[0]}**${missing.length > 1 ? ` followed by **${missing.slice(1).join(', ')}**` : ''}. Closing these gaps will boost your opportunity match rates!`;
          suggestions = [`Practice ${missing[0]}`, 'View Skill Intelligence', 'Review Capability Snapshot'];
        } else {
          reply = `Your skills profile matches current benchmarks. You have ${skills.length} skills recorded with an overall readiness of **${readiness}%**. Enroll in an institutional skill track to start building verified proficiency.`;
          suggestions = ['Explore Institutional Skills', 'Find Matching Opportunities', 'Take Skill Assessment'];
        }
      }
    } else if (query.includes('assessment') || query.includes('test') || query.includes('score')) {
      if (assessments.length > 0) {
        const lastA = assessments[assessments.length - 1];
        reply = `You have completed ${assessments.length} assessment(s). Most recent: **${lastA.domain || 'Technical'}** with a score of **${lastA.score || 0}%**. Career readiness is currently **${readiness}%**.`;
        suggestions = ['Retake Assessment', 'Take Another Domain Test', 'View Skill Ledger'];
      } else {
        reply = `You haven't completed any assessments yet. Completing an assessment provides cryptographically verifiable proof of your capabilities on your Digital Passport.`;
        suggestions = ['Start First Assessment', 'Prepare with Course Modules'];
      }
    } else if (query.includes('course') || query.includes('learn') || query.includes('enroll')) {
      if (enrollments.length > 0) {
        const active = enrollments.find(e => e.status === 'active' || e.progress < 100) || enrollments[0];
        reply = `You are enrolled in **${active.courseTitle || active.title || 'a course'}** (${active.progress || 0}% completed). Completing remaining modules unlocks institutional certification.`;
        suggestions = ['Continue Current Course', 'Browse Course Catalog', 'View Certificates'];
      } else {
        reply = `You are not currently enrolled in any courses. Browse the Course Catalog to enroll in subsidized academic cohorts.`;
        suggestions = ['Browse Course Catalog', 'Explore Advanced Tech'];
      }
    } else if (query.includes('communication') || query.includes('speak') || query.includes('interview') || query.includes('english') || query.includes('soft skill') || query.includes('presentation') || query.includes('dialogue')) {
      const comm = student?.communication || {};
      const cats = comm.categories || {};
      const overall = Number(comm.overallScore) || 0;
      const acts = comm.activities || [];

      if (acts.length === 0) {
        reply = `You currently have **0% recorded Communication capability**. Daily communication practice, workplace dialogues, and speaking exercises will directly elevate your interview readiness and corporate collaboration scores.`;
        suggestions = ['Start Daily Communication Drill', 'Practice Interview Speaking', 'Workplace Vocabulary'];
      } else {
        const catList = [
          { name: 'Speaking', score: Number(cats.speaking?.score ?? cats.speaking ?? 0) },
          { name: 'Vocabulary', score: Number(cats.vocabulary?.score ?? cats.vocabulary ?? 0) },
          { name: 'Grammar', score: Number(cats.grammar?.score ?? cats.grammar ?? 0) },
          { name: 'Conversation', score: Number(cats.conversation?.score ?? cats.conversation ?? 0) },
          { name: 'Listening', score: Number(cats.listening?.score ?? cats.listening ?? 0) },
          { name: 'Reading', score: Number(cats.reading?.score ?? cats.reading ?? 0) }
        ].sort((a, b) => a.score - b.score);

        const lowest = catList[0];
        const highest = catList[catList.length - 1];

        reply = `Your overall Communication index is **${overall}%** (${acts.length} exercises completed). **${lowest.name} practice is the current communication priority** (${lowest.score}%). Your strongest area is **${highest.name}** (${highest.score}%). Focusing on ${lowest.name.toLowerCase()} drills will yield the highest interview ROI.`;
        suggestions = [`Start ${lowest.name} Practice`, 'Complete Daily Communication Sprint', 'Practice Engineering Dialogue'];
      }
    } else if (query.includes('job') || query.includes('internship') || query.includes('opportunity')) {
      const allOpps = await relationalManager.getOpportunities();
      const oppCount = (allOpps || []).length;
      reply = `There are **${oppCount} active industry opportunities** available across partner employers. Your current profile readiness is **${readiness}%**.`;
      suggestions = ['View Matching Opportunities', 'Filter by Skill Match', 'Update Resume Profile'];
    } else {
      reply = `Greetings ${studentName}! I am NEXUS AI. I'm actively tracking your skills (${skills.length} recorded), course progress (${enrollments.length} enrolled), and verified readiness (**${readiness}%**). How can I accelerate your roadmap today?`;
      suggestions = ['How do I close my skill gaps?', 'Show my top opportunities', 'Review assessment progress', 'View Course Catalog'];
    }

    res.json({
      success: true,
      reply,
      suggestions,
      telemetry: {
        readiness: `${readiness}%`,
        integrity: '100%',
        activeStreak: assessments.length > 0 || enrollments.length > 0 ? 'Active' : 'No activity yet'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
