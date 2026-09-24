/**
 * SKILL NEXUS AI — Student Skill Aggregator Service
 * 
 * Aggregates student skills from:
 * 1. Student profile skills (student_skills table)
 * 2. Completed course enrollments (enrollments + courses tables)
 * 3. Verified certificates (certificates table)
 * 4. Technical projects (projects table)
 * 5. Diagnostic and domain assessments (assessment_attempts + assessments tables)
 * 
 * Produces a normalized, canonical skill profile.
 * NEVER fabricates random or synthetic skills; strictly uses platform data.
 */

const { supabase } = require('../../config/supabase');
const relationalManager = require('../../db/relationalManager');

function canonicalLevel(levelStr, score = 70) {
  const norm = String(levelStr || '').trim().toUpperCase();
  if (norm === 'EXPERT' || score >= 90) return 'Expert';
  if (norm === 'ADVANCED' || score >= 80) return 'Advanced';
  if (norm === 'BEGINNER' || score < 60) return 'Beginner';
  return 'Intermediate';
}

function determineCategory(name) {
  const n = String(name || '').toLowerCase();
  if (/(python|java|c\+\+|rust|javascript|typescript|c#|golang|go\b|php|ruby|swift|kotlin|c\b)/i.test(n)) {
    return 'Programming';
  }
  if (/(sql|postgres|database|mongodb|redis|prisma|mysql|nosql|oracle)/i.test(n)) {
    return 'Database';
  }
  if (/(machine learning|data|ai|fastapi|pandas|deep learning|pytorch|tensorflow|nlp|llm|generative ai|power bi|excel|analytics)/i.test(n)) {
    return 'Data & AI';
  }
  if (/(react|html|css|frontend|web|vue|angular|next\.js|tailwind|ui|ux|node)/i.test(n)) {
    return 'Web Development';
  }
  if (/(docker|kubernetes|aws|cloud|azure|gcp|devops|ci\/cd|microservices|distributed|linux)/i.test(n)) {
    return 'Cloud & Distributed';
  }
  if (/(security|cybersecurity|network|cryptography|ethical hacking|firewall)/i.test(n)) {
    return 'Security & Systems';
  }
  return 'General Technical';
}

function normalizeKey(str) {
  return String(str || '').toLowerCase().trim().replace(/[\.\-_ ]/g, '');
}

class StudentSkillAggregator {
  /**
   * Resolves actual student UUID from user/student id
   */
  async resolveStudent(studentIdentifier) {
    if (!studentIdentifier) return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(studentIdentifier).trim());
    
    try {
      if (isUuid) {
        const { data: stu } = await supabase
          .from('students')
          .select('*')
          .or(`id.eq.${studentIdentifier},user_id.eq.${studentIdentifier}`)
          .limit(1)
          .maybeSingle();

        if (stu) return stu;
      } else {
        const { data: stu } = await supabase
          .from('students')
          .select('*')
          .eq('roll_number', studentIdentifier)
          .limit(1)
          .maybeSingle();

        if (stu) return stu;
      }
    } catch (e) {
      console.debug('[SkillAggregator] resolveStudent Supabase notice:', e.message);
    }

    try {
      return await relationalManager.getStudentById(studentIdentifier);
    } catch (e) {
      return null;
    }
  }

  /**
   * Aggregate and normalize skills from all 5 platform data sources
   */
  async aggregateStudentSkills(studentIdentifier) {
    const student = await this.resolveStudent(studentIdentifier);
    if (!student) {
      return {
        student: null,
        skills: [],
        metrics: { total: 0, verified: 0, coursesCompleted: 0, assessmentsCompleted: 0, projectsCount: 0 }
      };
    }

    const studentUuid = student.id;
    const skillMap = new Map(); // key: normalizedName -> skillObject

    // Helper to merge / upgrade a skill record safely
    const recordSkill = ({
      name,
      category,
      level,
      score,
      credibilityScore = 0,
      source,
      verificationStatus,
      lastUpdated,
      weight = 1
    }) => {
      const cleanName = String(name || '').trim();
      if (!cleanName) return;

      const norm = normalizeKey(cleanName);
      const cat = category || determineCategory(cleanName);
      const numericScore = Math.max(0, Math.min(100, Math.round(Number(score) || 60)));
      const canonLevel = canonicalLevel(level, numericScore);
      const isVerified = verificationStatus === 'VERIFIED';

      const existing = skillMap.get(norm);
      if (!existing) {
        skillMap.set(norm, {
          skillName: cleanName,
          category: cat,
          proficiencyLevel: canonLevel,
          score: numericScore,
          proficiencyScore: numericScore,
          credibilityScore: Number(credibilityScore || 0),
          source,
          verificationStatus: verificationStatus || 'SELF_ASSESSED',
          isVerified,
          lastUpdated: lastUpdated || new Date().toISOString()
        });
      } else {
        // Upgrade score / verification if source is stronger
        const newScore = Math.max(existing.score, numericScore);
        const newCred = Math.max(existing.credibilityScore || 0, Number(credibilityScore || 0));
        const upgradedVerified = existing.isVerified || isVerified;
        const upgradedStatus = upgradedVerified ? 'VERIFIED' : (verificationStatus === 'CLAIMED' ? 'CLAIMED' : existing.verificationStatus);

        skillMap.set(norm, {
          ...existing,
          skillName: cleanName.length >= existing.skillName.length ? cleanName : existing.skillName,
          category: existing.category || cat,
          score: newScore,
          proficiencyScore: newScore,
          credibilityScore: newCred,
          proficiencyLevel: canonicalLevel(existing.proficiencyLevel, newScore),
          verificationStatus: upgradedStatus,
          isVerified: upgradedVerified,
          source: isVerified ? source : (existing.isVerified ? existing.source : `${existing.source}, ${source}`),
          lastUpdated: lastUpdated || existing.lastUpdated
        });
      }
    };

    // ─────────────────────────────────────────────────────────────────────────
    // Source 1: student_skills table (Profile & claim records)
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const { data: dbSkills, error: dbSkillsErr } = await supabase
        .from('student_skills')
        .select(`
          id,
          self_rating,
          claimed_level,
          verified_level,
          confidence_score,
          proficiency_score,
          proficiency_level,
          credibility_score,
          evidence_count,
          last_verified_at,
          verification_status,
          last_updated,
          skill_name,
          category,
          source,
          skills (
            id,
            name,
            difficulty,
            industry_demand
          )
        `)
        .eq('student_id', studentUuid);

      if (!dbSkillsErr && Array.isArray(dbSkills)) {
        dbSkills.forEach(row => {
          const rawName = row.skill_name || row.skills?.name;
          if (!rawName) return;
          const score = row.proficiency_score || row.confidence_score || (row.self_rating ? row.self_rating * 20 : 70);
          const isVerified = row.verification_status === 'VERIFIED';
          const level = row.proficiency_level || (isVerified ? (row.verified_level || row.claimed_level) : row.claimed_level);
          recordSkill({
            name: rawName,
            category: row.category || determineCategory(rawName),
            level,
            score,
            credibilityScore: row.credibility_score || 0,
            source: row.source || (isVerified ? 'Skill Graph 2.0 Verified' : 'Student Profile Claim'),
            verificationStatus: row.verification_status || 'CLAIMED',
            lastUpdated: row.last_verified_at || row.last_updated
          });
        });
      }
    } catch (err) {
      console.debug('[SkillAggregator] Source 1 note:', err.message);
    }

    // Also check student.skills embedded JSON array if present
    if (Array.isArray(student.skills)) {
      student.skills.forEach(s => {
        const rawName = s.name || s.skill;
        if (rawName) {
          recordSkill({
            name: rawName,
            category: s.category || determineCategory(rawName),
            level: s.level || 'Intermediate',
            score: s.masteryScore || s.confidence || (s.verified ? 85 : 65),
            source: s.source || (s.verified ? 'Assessment Stamp' : 'Profile Skill'),
            verificationStatus: s.verified ? 'VERIFIED' : (s.verificationStatus || 'SELF_ASSESSED'),
            lastUpdated: s.createdAt || s.lastUpdated
          });
        }
      });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Source 2: Completed Course Enrollments
    // ─────────────────────────────────────────────────────────────────────────
    let completedCoursesCount = 0;
    try {
      const { data: enrollments, error: enrollErr } = await supabase
        .from('enrollments')
        .select(`
          id,
          status,
          progress_percentage,
          completed_at,
          courses (
            id,
            title,
            category,
            skill_category,
            learning_objectives,
            difficulty
          )
        `)
        .eq('student_id', studentUuid);

      if (!enrollErr && Array.isArray(enrollments)) {
        enrollments.forEach(e => {
          if (!e.courses) return;
          const progress = Number(e.progress_percentage || 0);
          const isCompleted = e.status === 'Completed' || progress >= 100;
          if (isCompleted) completedCoursesCount++;

          // Extract course title keywords / skill
          const c = e.courses;
          const title = c.title;
          const matchedCategory = c.skill_category || c.category || determineCategory(title);

          // If course is completed or near completion, award verified or high credit
          if (isCompleted || progress >= 75) {
            const courseScore = isCompleted ? 85 : Math.round(progress * 0.8);
            // Deduce primary skill from title
            const cleanedTitle = title.replace(/\d+/g, '').trim();
            recordSkill({
              name: cleanedTitle,
              category: matchedCategory,
              level: c.difficulty || (isCompleted ? 'Advanced' : 'Intermediate'),
              score: courseScore,
              source: `Course: ${title}`,
              verificationStatus: isCompleted ? 'VERIFIED' : 'IN_PROGRESS',
              lastUpdated: e.completed_at || new Date().toISOString()
            });

            // Extract specific technical skills from title keywords
            ['React', 'Node.js', 'Python', 'SQL', 'Docker', 'Go', 'JavaScript', 'TypeScript', 'Cloud Computing', 'Machine Learning'].forEach(tech => {
              if (new RegExp(`\\b${tech}\\b`, 'i').test(title)) {
                recordSkill({
                  name: tech,
                  category: determineCategory(tech),
                  level: isCompleted ? 'Advanced' : 'Intermediate',
                  score: courseScore,
                  source: `Course Completed: ${title}`,
                  verificationStatus: isCompleted ? 'VERIFIED' : 'IN_PROGRESS',
                  lastUpdated: e.completed_at || new Date().toISOString()
                });
              }
            });
          }
        });
      }
    } catch (err) {
      console.debug('[SkillAggregator] Source 2 note:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Source 3: Diagnostic and Domain Assessments
    // ─────────────────────────────────────────────────────────────────────────
    let assessmentsCount = 0;
    try {
      const { data: attempts, error: attErr } = await supabase
        .from('assessment_attempts')
        .select(`
          id,
          score,
          accuracy,
          percentile,
          status,
          completed_at,
          assessments (
            id,
            title,
            domain,
            categories,
            passing_score,
            difficulty
          )
        `)
        .eq('student_id', studentUuid)
        .order('completed_at', { ascending: false });

      if (!attErr && Array.isArray(attempts)) {
        attempts.forEach(att => {
          if (!att.assessments) return;
          const a = att.assessments;
          const score = Number(att.score || 0);
          const passingScore = Number(a.passing_score || 50);
          const passed = score >= passingScore;
          if (passed) assessmentsCount++;

          const domainName = a.domain || a.title;
          recordSkill({
            name: domainName,
            category: determineCategory(domainName),
            level: a.difficulty || (score >= 80 ? 'Advanced' : 'Intermediate'),
            score: Math.max(score, 60),
            source: `Assessment: ${a.title} (${score}%)`,
            verificationStatus: passed ? 'VERIFIED' : 'SELF_ASSESSED',
            lastUpdated: att.completed_at || new Date().toISOString()
          });

          // Check categories array / string
          if (Array.isArray(a.categories)) {
            a.categories.forEach(catItem => {
              if (typeof catItem === 'string' && catItem.length > 1) {
                recordSkill({
                  name: catItem,
                  category: determineCategory(catItem),
                  level: score >= 80 ? 'Advanced' : 'Intermediate',
                  score: Math.max(score, 60),
                  source: `Assessment: ${a.title}`,
                  verificationStatus: passed ? 'VERIFIED' : 'SELF_ASSESSED',
                  lastUpdated: att.completed_at
                });
              }
            });
          }
        });
      }
    } catch (err) {
      console.debug('[SkillAggregator] Source 3 note:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Source 4: Verified Certificates
    // ─────────────────────────────────────────────────────────────────────────
    try {
      const { data: certs, error: certErr } = await supabase
        .from('certificates')
        .select('*')
        .eq('student_id', studentUuid);

      if (!certErr && Array.isArray(certs)) {
        certs.forEach(cert => {
          const isVerified = cert.status === 'VERIFIED';
          const related = Array.isArray(cert.related_skills) ? cert.related_skills : (Array.isArray(cert.skills) ? cert.skills : []);
          related.forEach(skName => {
            recordSkill({
              name: skName,
              category: determineCategory(skName),
              level: isVerified ? 'Advanced' : 'Intermediate',
              score: isVerified ? 90 : 70,
              source: `Certificate: ${cert.title || 'Verified Credential'}`,
              verificationStatus: isVerified ? 'VERIFIED' : 'CLAIMED',
              lastUpdated: cert.verified_at || cert.created_at
            });
          });
        });
      }
    } catch (err) {
      console.debug('[SkillAggregator] Source 4 note:', err.message);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Source 5: Projects Tech Stack
    // ─────────────────────────────────────────────────────────────────────────
    let projectsCount = 0;
    try {
      const { data: projs, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('student_id', studentUuid);

      if (!projErr && Array.isArray(projs)) {
        projs.forEach(proj => {
          projectsCount++;
          const techList = Array.isArray(proj.tech_stack) ? proj.tech_stack : (Array.isArray(proj.skills) ? proj.skills : []);
          const isProven = proj.status === 'VERIFIED' || proj.status === 'Validated';
          techList.forEach(tech => {
            recordSkill({
              name: tech,
              category: determineCategory(tech),
              level: isProven ? 'Advanced' : 'Intermediate',
              score: isProven ? 85 : 70,
              source: `Project: ${proj.title || 'Engineering Capstone'}`,
              verificationStatus: isProven ? 'VERIFIED' : 'CLAIMED',
              lastUpdated: proj.created_at
            });
          });
        });
      }
    } catch (err) {
      console.debug('[SkillAggregator] Source 5 note:', err.message);
    }

    const finalSkillsList = Array.from(skillMap.values());
    const verifiedCount = finalSkillsList.filter(s => s.isVerified).length;

    return {
      student: {
        id: student.id,
        fullName: student.full_name || student.name || 'Student',
        rollNumber: student.roll_number,
        targetCareerRole: student.target_career_role,
        currentReadiness: Number(student.readiness_score || 0)
      },
      skills: finalSkillsList,
      metrics: {
        total: finalSkillsList.length,
        verified: verifiedCount,
        coursesCompleted: completedCoursesCount,
        assessmentsCompleted: assessmentsCount,
        projectsCount
      }
    };
  }
}

module.exports = new StudentSkillAggregator();
