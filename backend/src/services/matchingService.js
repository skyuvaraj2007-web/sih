// backend/src/services/matchingService.js
/**
 * Centralized matching service for student ↔ opportunity and company ↔ candidate.
 * Uses skill overlap and requirements matching against real database entities.
 */
const relationalManager = require('../db/relationalManager');

/**
 * Compute match score between a student and an opportunity.
 * Returns detailed breakdown.
 */
async function matchStudentToOpportunity(studentId, opportunityId) {
  const student = await relationalManager.getStudentById(studentId);
  const opportunity = await relationalManager.getOpportunityById(opportunityId);
  if (!student || !opportunity) throw new Error('Student or Opportunity not found');

  const studentSkillNames = (student.skills || []).map(s => (s.name || s.skill || '').trim().toLowerCase());
  
  const rawReq = opportunity.requiredSkills || opportunity.skillsMatrix || opportunity.skills || [];
  const requiredSkills = rawReq.map(s => {
    if (typeof s === 'string') return s.trim().toLowerCase();
    return (s.name || s.skill || s.title || '').trim().toLowerCase();
  }).filter(Boolean);

  const matched = requiredSkills.filter(s => studentSkillNames.includes(s));
  const missing = requiredSkills.filter(s => !studentSkillNames.includes(s));
  const matchScore = requiredSkills.length > 0
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 0;

  const reasons = matched.map(s => `✓ You have ${s} skill`);
  const improvements = missing.map(s => `• Learn/improve ${s}`);

  const result = {
    studentId,
    opportunityId,
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    reasons,
    improvements,
    evidence: {
      totalRequired: requiredSkills.length,
      totalMatched: matched.length
    },
    explanation: requiredSkills.length === 0
      ? 'No specific skill requirements listed for this opportunity.'
      : `Matched ${matched.length} of ${requiredSkills.length} required skills (${matchScore}%).`
  };

  // Persist result if relational manager supports it
  if (typeof relationalManager.insertMatchResult === 'function') {
    await relationalManager.insertMatchResult(result);
  }
  return result;
}

/**
 * Compute match between a company and a candidate (student).
 */
async function matchCompanyToCandidate(companyId, candidateId) {
  let oppId = null;
  if (typeof relationalManager.getCompanyOpportunityTemplate === 'function') {
    const opp = await relationalManager.getCompanyOpportunityTemplate(companyId);
    if (opp) oppId = opp.oppId || opp.opp_id || opp.id;
  }
  if (!oppId) {
    const opps = await relationalManager.getOpportunitiesByCompany(companyId);
    if (opps && opps.length > 0) {
      oppId = opps[0].oppId || opps[0].opp_id || opps[0].id;
    }
  }

  if (oppId) {
    return await matchStudentToOpportunity(candidateId, oppId);
  }

  // Fallback if no opportunity posted yet - genuine zero state
  return {
    companyId,
    studentId: candidateId,
    matchScore: 0,
    matchedSkills: [],
    missingSkills: [],
    reasons: [],
    improvements: [],
    explanation: 'No active opportunity requirements posted yet.'
  };
}

/**
 * Calculate match between a candidate and an opportunity (supports both in-memory and DB objects)
 */
function calculateMatch(candidate, opportunity) {
  const skills = Array.isArray(candidate?.skills) ? candidate.skills : [];
  const candidateSkills = skills.map(s => {
    if (typeof s === 'string') return s.trim().toLowerCase();
    return (s.name || s.skill || s.title || '').trim().toLowerCase();
  }).filter(Boolean);

  const rawReq = opportunity?.requiredSkills || opportunity?.skillsMatrix || opportunity?.skills || [];
  const requiredSkills = rawReq.map(s => {
    if (typeof s === 'string') return s.trim().toLowerCase();
    return (s.name || s.skill || s.title || '').trim().toLowerCase();
  }).filter(Boolean);

  const matched = requiredSkills.filter(s => candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));
  const missing = requiredSkills.filter(s => !candidateSkills.some(cs => cs.includes(s) || s.includes(cs)));

  const matchScore = requiredSkills.length > 0
    ? Math.round((matched.length / requiredSkills.length) * 100)
    : 0;

  const reasons = matched.map(s => `✓ Candidate possesses ${s}`);
  if (reasons.length === 0 && requiredSkills.length > 0) {
    reasons.push(`Matched 0 of ${requiredSkills.length} required skills`);
  }
  const improvements = missing.map(s => `• Need to acquire/verify ${s}`);

  return {
    matchScore,
    matchedSkills: matched,
    missingSkills: missing,
    reasons,
    improvements,
    explanation: requiredSkills.length === 0
      ? 'No specific skill requirements defined.'
      : `Matched ${matched.length} of ${requiredSkills.length} required skills (${matchScore}%).`
  };
}

module.exports = { matchStudentToOpportunity, matchCompanyToCandidate, calculateMatch };
