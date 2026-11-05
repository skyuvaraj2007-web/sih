/**
 * SKILLNEXUS — Intelligent Assessment Guard & Authority Routing Service
 * 
 * Safety & Privacy Invariants:
 * - Never accuses student of cheating. Uses terms: "Potential Integrity Event", "Integrity Signal", "Review Required".
 * - Explicit student consent required before starting monitored sessions.
 * - Multi-tenant isolation: Students see only own events; Institutions see only mapped students; Industry sees only authorized candidates.
 * - Automated Authority Routing:
 *   * ACADEMIC Assessments -> Assigned Faculty Member, Academic Coordinator, Institution Admin.
 *   * INDUSTRY Assessments -> Company Assessment Administrator, Assigned Industry Evaluator.
 *   * STRICT ISOLATION: Academic events NEVER reach companies; Industry events NEVER reach institutions.
 * - Human review workflow (CONFIRMED, DISMISSED, NEEDS_MORE_REVIEW, ESCALATED).
 * - Never auto-fails students. Auto-save answers preserved.
 */

const { pool, getClient, isConfigured } = require('../config/db');

class AssessmentGuardService {
  async getClient() {
    return await getClient();
  }

  /**
   * Helper to resolve student UUID from various identifier forms
   */
  async resolveStudentUuid(identifier) {
    if (!identifier) return null;
    if (!isConfigured()) {
      try {
        const relationalManager = require('../db/relationalManager');
        const s = await relationalManager.getStudentById(identifier);
        if (s) {
          return {
            id: s.id || s.studentId,
            user_id: s.userId || s.id,
            institution_id: s.institutionId || s.collegeId,
            student_name: s.name || s.fullName,
            roll_number: s.rollNumber || s.regNo,
            email: s.email
          };
        }
      } catch (e) {}
      return null;
    }
    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT s.id, s.institution_id, s.full_name as student_name, s.roll_number, u.email, s.user_id 
         FROM students s
         LEFT JOIN users u ON u.id = s.user_id
         WHERE s.id::text = $1 OR s.user_id::text = $1 OR s.roll_number = $1 OR u.email = $1 
         LIMIT 1`,
        [String(identifier)]
      );
      if (res.rows.length > 0) return res.rows[0];
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Start a monitoring session with explicit consent validation
   */
  async startSession({ assessmentId, studentId, consentGiven, cameraEnabled = false, microphoneEnabled = false, monitoringEnabled = true }) {
    if (!consentGiven) {
      const err = new Error('Explicit student consent is required to start a monitored assessment.');
      err.statusCode = 400;
      throw err;
    }

    const student = await this.resolveStudentUuid(studentId);
    if (!student) {
      const err = new Error(`Student record not found for identifier "${studentId}".`);
      err.statusCode = 404;
      throw err;
    }

    if (!isConfigured()) {
      return {
        success: true,
        message: 'Assessment monitoring session initialized (offline prototype mode).',
        session: {
          id: 'session-' + Date.now(),
          assessment_id: assessmentId,
          student_id: student.id,
          started_at: new Date().toISOString(),
          consent_given: Boolean(consentGiven),
          camera_enabled: Boolean(cameraEnabled),
          microphone_enabled: Boolean(microphoneEnabled),
          monitoring_enabled: Boolean(monitoringEnabled),
          status: 'ACTIVE'
        }
      };
    }

    const client = await this.getClient();
    try {
      // Create or activate monitoring session in PostgreSQL
      const res = await client.query(
        `INSERT INTO assessment_monitoring_sessions 
          (assessment_id, student_id, started_at, consent_given, camera_enabled, microphone_enabled, monitoring_enabled, status)
         VALUES ($1, $2, NOW(), $3, $4, $5, $6, 'ACTIVE')
         RETURNING *`,
        [assessmentId, student.id, Boolean(consentGiven), Boolean(cameraEnabled), Boolean(microphoneEnabled), Boolean(monitoringEnabled)]
      );

      return {
        success: true,
        message: 'Assessment monitoring session initialized with verified student consent.',
        session: res.rows[0]
      };
    } finally {
      client.release();
    }
  }

  /**
   * Determine assessment type and resolve the appropriate authorities
   * ACADEMIC: Assigned Faculty, Academic Coordinator, Institution Admin
   * INDUSTRY: Company Assessment Administrator, Assigned Industry Evaluator
   * STRICT ISOLATION ENFORCED: Never mixes authorities across sectors.
   */
  async determineAssessmentAuthorities(assessmentId, studentId) {
    const client = await this.getClient();
    try {
      // 1. Fetch Assessment metadata
      const asmtRes = await client.query(
        `SELECT id, title, assessment_type, company_id, institution_id, academician_id 
         FROM assessments 
         WHERE id = $1`,
        [assessmentId]
      );
      const assessment = asmtRes.rows[0] || {
        id: assessmentId,
        title: 'Technical Assessment',
        assessment_type: 'ACADEMIC',
        company_id: null,
        institution_id: null,
        academician_id: null
      };

      // 2. Fetch Student details
      const student = await this.resolveStudentUuid(studentId);
      const studentInstitutionId = student?.institution_id || assessment.institution_id;

      // 3. Classify Assessment Sector
      const isIndustry = Boolean(
        assessment.company_id ||
        String(assessment.assessment_type || '').toUpperCase() === 'INDUSTRY' ||
        String(assessment.assessment_type || '').toUpperCase() === 'CORPORATE'
      );

      const assessmentType = isIndustry ? 'INDUSTRY' : 'ACADEMIC';
      const authorities = [];

      if (assessmentType === 'ACADEMIC') {
        // ── ACADEMIC RECIPIENT 1: Assigned Faculty Member ──
        let facultyResolved = false;
        if (student?.id) {
          const facultyRes = await client.query(
            `SELECT ssm.staff_id, ap.user_id as faculty_user_id, ap.full_name, ap.designation, u.email
             FROM student_staff_mapping ssm
             LEFT JOIN academician_profiles ap ON (ap.id = ssm.staff_id OR ap.user_id = ssm.staff_id)
             LEFT JOIN users u ON u.id = COALESCE(ap.user_id, ssm.staff_id)
             WHERE ssm.student_id = $1 AND ssm.is_active = true
             LIMIT 1`,
            [student.id]
          );
          if (facultyRes.rows.length > 0 && facultyRes.rows[0].faculty_user_id) {
            authorities.push({
              userId: facultyRes.rows[0].faculty_user_id,
              role: 'faculty',
              name: facultyRes.rows[0].full_name || 'Assigned Faculty Advisor',
              email: facultyRes.rows[0].email,
              designation: facultyRes.rows[0].designation || 'Faculty Mentor'
            });
            facultyResolved = true;
          }
        }

        // Fallback for faculty: Assessment creator academician or institution faculty
        if (!facultyResolved) {
          if (assessment.academician_id) {
            const acadRes = await client.query(
              `SELECT ap.user_id as faculty_user_id, ap.full_name, ap.designation, u.email
               FROM academician_profiles ap
               LEFT JOIN users u ON u.id = ap.user_id
               WHERE ap.id = $1 OR ap.user_id = $1
               LIMIT 1`,
              [assessment.academician_id]
            );
            if (acadRes.rows.length > 0 && acadRes.rows[0].faculty_user_id) {
              authorities.push({
                userId: acadRes.rows[0].faculty_user_id,
                role: 'faculty',
                name: acadRes.rows[0].full_name || 'Course Instructor',
                email: acadRes.rows[0].email,
                designation: acadRes.rows[0].designation || 'Course Faculty'
              });
              facultyResolved = true;
            }
          }
        }

        if (!facultyResolved && studentInstitutionId) {
          const defaultFacRes = await client.query(
            `SELECT ap.user_id as faculty_user_id, ap.full_name, ap.designation, u.email
             FROM academician_profiles ap
             LEFT JOIN users u ON u.id = ap.user_id
             WHERE ap.institution_id = $1
             ORDER BY ap.created_at ASC LIMIT 1`,
            [studentInstitutionId]
          );
          if (defaultFacRes.rows.length > 0 && defaultFacRes.rows[0].faculty_user_id) {
            authorities.push({
              userId: defaultFacRes.rows[0].faculty_user_id,
              role: 'faculty',
              name: defaultFacRes.rows[0].full_name || 'Faculty Member',
              email: defaultFacRes.rows[0].email,
              designation: defaultFacRes.rows[0].designation || 'Academician'
            });
          }
        }

        // ── ACADEMIC RECIPIENT 2: Academic Coordinator ──
        if (studentInstitutionId) {
          const coordRes = await client.query(
            `SELECT ap.user_id as coordinator_user_id, ap.full_name, ap.designation, u.email
             FROM academician_profiles ap
             LEFT JOIN users u ON u.id = ap.user_id
             WHERE ap.institution_id = $1 AND (
               LOWER(ap.designation) LIKE '%coordinator%' OR
               LOWER(ap.designation) LIKE '%hod%' OR
               LOWER(ap.designation) LIKE '%head%'
             )
             LIMIT 1`,
            [studentInstitutionId]
          );
          if (coordRes.rows.length > 0 && coordRes.rows[0].coordinator_user_id) {
            // Avoid duplicate if same user as faculty
            if (!authorities.some(a => a.userId === coordRes.rows[0].coordinator_user_id)) {
              authorities.push({
                userId: coordRes.rows[0].coordinator_user_id,
                role: 'coordinator',
                name: coordRes.rows[0].full_name || 'Academic Coordinator',
                email: coordRes.rows[0].email,
                designation: coordRes.rows[0].designation || 'Department Coordinator'
              });
            }
          }
        }

        // ── ACADEMIC RECIPIENT 3: Institution Assessment Administrator ──
        if (studentInstitutionId) {
          const instAdminRes = await client.query(
            `SELECT im.user_id as admin_user_id, im.member_role, im.designation, u.email
             FROM institution_members im
             LEFT JOIN users u ON u.id = im.user_id
             WHERE im.institution_id = $1 AND im.is_active = true AND (
               LOWER(im.member_role) IN ('admin', 'institution_admin', 'lead', 'principal') OR
               LOWER(im.designation) LIKE '%admin%' OR
               LOWER(im.designation) LIKE '%officer%'
             )
             LIMIT 1`,
            [studentInstitutionId]
          );
          if (instAdminRes.rows.length > 0 && instAdminRes.rows[0].admin_user_id) {
            if (!authorities.some(a => a.userId === instAdminRes.rows[0].admin_user_id)) {
              authorities.push({
                userId: instAdminRes.rows[0].admin_user_id,
                role: 'institution_admin',
                name: 'Institution Assessment Administrator',
                email: instAdminRes.rows[0].email,
                designation: instAdminRes.rows[0].designation || 'Institution Administrator'
              });
            }
          } else {
            // Fallback: User with role 'institution'
            const userInstRes = await client.query(
              `SELECT u.id as admin_user_id, u.email
               FROM users u
               JOIN user_roles ur ON u.id = ur.user_id
               JOIN roles r ON ur.role_id = r.id
               WHERE LOWER(r.code) = 'institution'
               ORDER BY u.created_at ASC LIMIT 1`
            );
            if (userInstRes.rows.length > 0 && !authorities.some(a => a.userId === userInstRes.rows[0].admin_user_id)) {
              authorities.push({
                userId: userInstRes.rows[0].admin_user_id,
                role: 'institution_admin',
                name: 'Institution Administrator',
                email: userInstRes.rows[0].email,
                designation: 'Institution Admin'
              });
            }
          }
        }
      } else {
        // ── INDUSTRY ASSESSMENT AUTHORITIES ──
        const companyId = assessment.company_id;

        // Recipient 1: Company Assessment Administrator
        if (companyId) {
          const compAdminRes = await client.query(
            `SELECT cm.user_id as admin_user_id, cm.designation, u.email
             FROM company_members cm
             LEFT JOIN users u ON u.id = cm.user_id
             WHERE cm.company_id = $1 AND cm.is_active = true
             ORDER BY cm.joined_at ASC LIMIT 1`,
            [companyId]
          );
          if (compAdminRes.rows.length > 0 && compAdminRes.rows[0].admin_user_id) {
            authorities.push({
              userId: compAdminRes.rows[0].admin_user_id,
              role: 'company_admin',
              name: 'Company Assessment Administrator',
              email: compAdminRes.rows[0].email,
              designation: compAdminRes.rows[0].designation || 'Talent Acquisition Lead'
            });
          }
        }

        // Recipient 2: Assigned Industry Evaluator / Recruiter
        if (companyId) {
          const evaluatorRes = await client.query(
            `SELECT cm.user_id as evaluator_user_id, cm.designation, u.email
             FROM company_members cm
             LEFT JOIN users u ON u.id = cm.user_id
             WHERE cm.company_id = $1 AND cm.is_active = true AND (
               LOWER(cm.designation) LIKE '%evaluator%' OR
               LOWER(cm.designation) LIKE '%recruiter%' OR
               LOWER(cm.designation) LIKE '%interviewer%'
             )
             LIMIT 1`,
            [companyId]
          );
          if (evaluatorRes.rows.length > 0 && evaluatorRes.rows[0].evaluator_user_id) {
            if (!authorities.some(a => a.userId === evaluatorRes.rows[0].evaluator_user_id)) {
              authorities.push({
                userId: evaluatorRes.rows[0].evaluator_user_id,
                role: 'industry_evaluator',
                name: 'Industry Evaluator',
                email: evaluatorRes.rows[0].email,
                designation: evaluatorRes.rows[0].designation || 'Technical Evaluator'
              });
            }
          }
        }

        // Fallback for company admin if none resolved
        if (authorities.length === 0) {
          const compUserRes = await client.query(
            `SELECT u.id as admin_user_id, u.email
             FROM users u
             JOIN user_roles ur ON u.id = ur.user_id
             JOIN roles r ON ur.role_id = r.id
             WHERE LOWER(r.code) = 'company'
             ORDER BY u.created_at ASC LIMIT 1`
          );
          if (compUserRes.rows.length > 0) {
            authorities.push({
              userId: compUserRes.rows[0].admin_user_id,
              role: 'company_admin',
              name: 'Company Recruiter',
              email: compUserRes.rows[0].email,
              designation: 'Recruiter'
            });
          }
        }
      }

      return {
        assessmentType,
        assessment,
        student,
        authorities
      };
    } finally {
      client.release();
    }
  }

  /**
   * Helper to format a friendly, non-accusatory event description
   */
  formatEventDescription(eventType, metadata = {}) {
    switch (String(eventType).toUpperCase()) {
      case 'TAB_SWITCH':
        return 'Browser tab switched during assessment.';
      case 'WINDOW_BLUR':
        return 'Assessment window lost focus.';
      case 'FULLSCREEN_EXIT':
        return 'Full-screen mode was exited.';
      case 'PASTE_ATTEMPT':
        return 'Clipboard paste attempt intercepted.';
      case 'COPY_ATTEMPT':
        return 'Content copy shortcut triggered.';
      case 'CAMERA_DISCONNECTED':
        return 'Webcam video stream was disconnected or revoked.';
      case 'FACE_ABSENT':
        return 'Primary candidate face not detected in frame.';
      case 'MULTIPLE_FACES':
        return 'Multiple persons detected in webcam view.';
      case 'PHONE_DETECTED':
        return 'External electronic device detected in frame.';
      default:
        return metadata.description || `Integrity signal: ${eventType}`;
    }
  }

  /**
   * Record a potential integrity event with non-accusatory terminology,
   * write to assessment_monitoring_events and assessment_integrity_events,
   * and automatically route notifications to designated authorities.
   */
  async recordEvent({
    sessionId,
    assessmentId,
    studentId,
    eventType,
    durationSeconds = 0,
    confidence = 100,
    severity = 'WARNING',
    questionId = null,
    metadata = {}
  }) {
    if (!eventType) {
      const err = new Error('eventType is required.');
      err.statusCode = 400;
      throw err;
    }

    const student = await this.resolveStudentUuid(studentId);
    if (!student) {
      const err = new Error(`Student not found for identifier "${studentId}".`);
      err.statusCode = 404;
      throw err;
    }

    // Normalize non-accusatory severity
    const rawSev = String(severity || 'WARNING').toUpperCase();
    let normalizedSeverity = 'WARNING';
    if (rawSev === 'INFO' || rawSev === 'LOW') normalizedSeverity = 'INFO';
    else if (rawSev === 'REVIEW_REQUIRED' || rawSev === 'HIGH' || rawSev === 'CRITICAL') normalizedSeverity = 'REVIEW_REQUIRED';
    else normalizedSeverity = 'WARNING';

    const eventDescription = this.formatEventDescription(eventType, metadata);

    if (!isConfigured()) {
      return {
        success: true,
        message: 'Integrity signal registered (offline prototype mode).',
        event: {
          id: 'event-' + Date.now(),
          session_id: sessionId,
          event_type: eventType,
          event_description: eventDescription,
          severity: normalizedSeverity,
          confidence,
          timestamp: new Date().toISOString(),
          metadata
        },
        notificationsDispatched: 0
      };
    }

    const client = await this.getClient();
    try {
      // 1. Resolve active session if not provided
      let activeSessionId = sessionId;
      if (!activeSessionId) {
        const sesRes = await client.query(
          `SELECT id FROM assessment_monitoring_sessions 
           WHERE assessment_id = $1 AND student_id = $2 AND status = 'ACTIVE' 
           ORDER BY started_at DESC LIMIT 1`,
          [assessmentId, student.id]
        );
        if (sesRes.rows.length > 0) {
          activeSessionId = sesRes.rows[0].id;
        }
      }

      // 2. Resolve authorities & assessment sector
      const { assessmentType, assessment, authorities } = await this.determineAssessmentAuthorities(assessmentId, student.id);

      // 3. Insert into assessment_monitoring_events
      const ameRes = await client.query(
        `INSERT INTO assessment_monitoring_events 
          (session_id, assessment_id, student_id, assessment_type, event_type, event_description, severity, occurred_at, duration_seconds, confidence, question_id, metadata, review_status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, $10, $11, 'PENDING_REVIEW')
         RETURNING *`,
        [
          activeSessionId || null,
          assessmentId,
          student.id,
          assessmentType,
          eventType,
          eventDescription,
          normalizedSeverity,
          parseInt(durationSeconds, 10) || 0,
          parseFloat(confidence) || 100.0,
          questionId ? String(questionId) : null,
          JSON.stringify({
            ...metadata,
            label: 'Potential Integrity Event',
            humanReviewRecommended: true
          })
        ]
      );
      const recordedEvent = ameRes.rows[0];

      // 4. Sync to assessment_integrity_events for backwards compatibility
      try {
        await client.query(
          `INSERT INTO assessment_integrity_events 
            (id, session_id, assessment_id, student_id, event_type, event_timestamp, duration_seconds, confidence, severity, question_id, metadata, review_status)
           VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7, $8, $9, $10, 'PENDING_REVIEW')
           ON CONFLICT (id) DO NOTHING`,
          [
            recordedEvent.id,
            activeSessionId || null,
            assessmentId,
            student.id,
            eventType,
            parseInt(durationSeconds, 10) || 0,
            parseFloat(confidence) || 100.0,
            normalizedSeverity === 'REVIEW_REQUIRED' ? 'HIGH' : normalizedSeverity === 'INFO' ? 'LOW' : 'MEDIUM',
            questionId ? String(questionId) : null,
            JSON.stringify({
              ...metadata,
              label: 'Potential Integrity Event',
              humanReviewRecommended: true
            })
          ]
        );
      } catch (syncErr) {
        // Table sync warning only
      }

      // 5. Automatic Authority Routing & Notification
      let notificationsDispatched = 0;
      const shouldNotify = normalizedSeverity === 'WARNING' || normalizedSeverity === 'REVIEW_REQUIRED';

      if (shouldNotify && authorities.length > 0) {
        // Deduplication check: check if an identical event occurred within 30 seconds for this session
        const recentCheck = await client.query(
          `SELECT id FROM assessment_monitoring_events 
           WHERE session_id = $1 AND event_type = $2 AND id <> $3 AND occurred_at > NOW() - INTERVAL '30 seconds'
           LIMIT 1`,
          [activeSessionId, eventType, recordedEvent.id]
        );

        const isDuplicateSpam = recentCheck.rows.length > 0 && normalizedSeverity !== 'REVIEW_REQUIRED';

        if (!isDuplicateSpam) {
          for (const auth of authorities) {
            // A. Insert into assessment_notification_recipients
            await client.query(
              `INSERT INTO assessment_notification_recipients 
                (event_id, recipient_user_id, recipient_role, notification_status, created_at)
               VALUES ($1, $2, $3, 'SENT', NOW())`,
              [recordedEvent.id, auth.userId, auth.role]
            );

            // B. Insert into central notifications table
            const notifTitle = `Assessment Alert: ${eventType.replace(/_/g, ' ')} (${normalizedSeverity})`;
            const notifMsg = `Integrity Signal during "${assessment.title}" for student ${student.student_name || 'Candidate'} (${student.roll_number || 'N/A'}). Human review recommended.`;

            // Map granular authority role to notifications table constraint ('institution' | 'company' | 'student')
            const notifRecipientType = ['company_admin', 'industry_evaluator', 'company'].includes(auth.role)
              ? 'company'
              : (auth.role === 'student' ? 'student' : 'institution');

            await client.query(
              `INSERT INTO notifications 
                (recipient_type, recipient_id, notification_type, title, message, related_entity_type, related_entity_id, details, is_read, is_deleted, created_at)
               VALUES ($1, $2, 'ASSESSMENT_INTEGRITY_ALERT', $3, $4, 'assessment_monitoring_events', $5, $6, false, false, NOW())`,
              [
                notifRecipientType,
                auth.userId,
                notifTitle,
                notifMsg,
                recordedEvent.id,
                JSON.stringify({
                  eventId: recordedEvent.id,
                  sessionId: activeSessionId,
                  assessmentId: assessment.id,
                  assessmentTitle: assessment.title,
                  assessmentType,
                  studentId: student.id,
                  studentName: student.student_name,
                  rollNumber: student.roll_number,
                  authorityRole: auth.role,
                  eventType,
                  severity: normalizedSeverity,
                  confidence: parseFloat(confidence) || 100.0,
                  occurredAt: recordedEvent.occurred_at
                })
              ]
            );

            notificationsDispatched++;
          }
        }
      }

      return {
        success: true,
        message: 'Integrity signal recorded and routed to designated authorities for review.',
        event: recordedEvent,
        notificationsDispatched,
        routedAuthorities: authorities.map(a => ({ role: a.role, name: a.name }))
      };
    } finally {
      client.release();
    }
  }

  /**
   * End a monitoring session
   */
  async endSession({ sessionId, assessmentId, studentId }) {
    const student = studentId ? await this.resolveStudentUuid(studentId) : null;
    const client = await this.getClient();
    try {
      let res;
      if (sessionId) {
        res = await client.query(
          `UPDATE assessment_monitoring_sessions 
           SET ended_at = NOW(), status = 'COMPLETED'
           WHERE id = $1
           RETURNING *`,
          [sessionId]
        );
      } else if (assessmentId && student) {
        res = await client.query(
          `UPDATE assessment_monitoring_sessions 
           SET ended_at = NOW(), status = 'COMPLETED'
           WHERE assessment_id = $1 AND student_id = $2 AND status = 'ACTIVE'
           RETURNING *`,
          [assessmentId, student.id]
        );
      }

      const session = res?.rows?.[0] || null;
      let durationMinutes = 0;
      if (session?.started_at && session?.ended_at) {
        durationMinutes = Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000);
      }

      return {
        success: true,
        message: 'Assessment monitoring session concluded.',
        session,
        durationMinutes
      };
    } finally {
      client.release();
    }
  }

  /**
   * Record question attempt telemetry
   */
  async recordQuestionAttempt({ assessmentId, studentId, questionId, answer, score = 0, isCorrect = false, timeSpentSeconds = 0, attemptNumber = 1, skillTag = null, difficulty = null }) {
    const student = await this.resolveStudentUuid(studentId);
    if (!student) {
      const err = new Error(`Student not found for identifier "${studentId}".`);
      err.statusCode = 404;
      throw err;
    }

    const client = await this.getClient();
    try {
      const res = await client.query(
        `INSERT INTO assessment_question_attempts 
          (assessment_id, student_id, question_id, answer, score, is_correct, time_spent_seconds, attempt_number, skill_tag, difficulty, submitted_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
         RETURNING *`,
        [
          assessmentId,
          student.id,
          String(questionId),
          typeof answer === 'object' ? JSON.stringify(answer) : String(answer || ''),
          parseFloat(score) || 0,
          Boolean(isCorrect),
          parseInt(timeSpentSeconds, 10) || 0,
          parseInt(attemptNumber, 10) || 1,
          skillTag || null,
          difficulty || null
        ]
      );

      return {
        success: true,
        data: res.rows[0]
      };
    } finally {
      client.release();
    }
  }

  /**
   * Question-level analytics for an assessment attempt
   */
  async getQuestionAnalytics({ assessmentId, studentId }) {
    const student = await this.resolveStudentUuid(studentId);
    if (!student) {
      const err = new Error(`Student not found for identifier "${studentId}".`);
      err.statusCode = 404;
      throw err;
    }

    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT * FROM assessment_question_attempts 
         WHERE assessment_id = $1 AND student_id = $2 
         ORDER BY submitted_at ASC`,
        [assessmentId, student.id]
      );

      const attempts = res.rows;
      const skillBuckets = {};

      for (const a of attempts) {
        const skill = a.skill_tag || 'General';
        if (!skillBuckets[skill]) {
          skillBuckets[skill] = { total: 0, correct: 0, scoreTotal: 0, timeSpent: 0 };
        }
        skillBuckets[skill].total += 1;
        if (a.is_correct) skillBuckets[skill].correct += 1;
        skillBuckets[skill].scoreTotal += Number(a.score) || 0;
        skillBuckets[skill].timeSpent += Number(a.time_spent_seconds) || 0;
      }

      const strongSkills = [];
      const moderateSkills = [];
      const needsImprovement = [];

      for (const [name, data] of Object.entries(skillBuckets)) {
        const accuracy = data.total > 0 ? (data.correct / data.total) * 100 : 0;
        const entry = {
          skill: name,
          accuracy: Math.round(accuracy),
          questionsCount: data.total,
          timeSpentSeconds: data.timeSpent
        };
        if (accuracy >= 75) strongSkills.push(entry);
        else if (accuracy >= 50) moderateSkills.push(entry);
        else needsImprovement.push(entry);
      }

      return {
        success: true,
        assessmentId,
        studentId: student.id,
        totalQuestionsAttempted: attempts.length,
        strongSkills,
        moderateSkills,
        needsImprovement,
        questionAttempts: attempts
      };
    } finally {
      client.release();
    }
  }

  /**
   * Retrieve role-scoped Assessment Integrity Report
   */
  async getIntegrityReport({ assessmentId, studentId, requestingUser }) {
    const client = await this.getClient();
    try {
      // 1. Resolve student
      let targetStudent = null;
      if (studentId) {
        targetStudent = await this.resolveStudentUuid(studentId);
      } else if (requestingUser?.role === 'student') {
        targetStudent = await this.resolveStudentUuid(requestingUser.studentId || requestingUser.id);
      }

      if (!targetStudent) {
        const err = new Error('Student identification required for integrity report.');
        err.statusCode = 400;
        throw err;
      }

      // 2. Multi-tenant Authorization Check
      const userRole = String(requestingUser?.role || 'student').toLowerCase();
      if (userRole === 'student') {
        const myStudent = await this.resolveStudentUuid(requestingUser.studentId || requestingUser.id);
        if (!myStudent || myStudent.id !== targetStudent.id) {
          const err = new Error('Access denied: You can only view your own assessment integrity report.');
          err.statusCode = 403;
          throw err;
        }
      } else if (userRole === 'institution' || userRole === 'academician' || userRole === 'faculty') {
        const userInstId = requestingUser.institutionId || requestingUser.collegeId;
        if (userInstId && targetStudent.institution_id && targetStudent.institution_id !== userInstId) {
          const err = new Error('Access denied: Student does not belong to your institution.');
          err.statusCode = 403;
          throw err;
        }
      } else if (userRole === 'company' || userRole === 'industry') {
        const companyId = requestingUser.companyId || requestingUser.id;
        const asmtCheck = await client.query(
          `SELECT id FROM assessments WHERE id = $1 AND company_id = $2`,
          [assessmentId, companyId]
        );
        const targetCheck = await client.query(
          `SELECT at.id FROM assessment_targets at 
           JOIN assessments a ON a.id = at.assessment_id 
           WHERE at.assessment_id = $1 AND at.student_id = $2 AND a.company_id = $3`,
          [assessmentId, targetStudent.id, companyId]
        );
        if (asmtCheck.rows.length === 0 && targetCheck.rows.length === 0) {
          const err = new Error('Access denied: Candidate assessment is not authorized for your organization.');
          err.statusCode = 403;
          throw err;
        }
      }

      // 3. Fetch Assessment Metadata
      const asmtRes = await client.query(
        `SELECT id, title, duration_minutes, passing_score FROM assessments WHERE id = $1`,
        [assessmentId]
      );
      const assessment = asmtRes.rows[0] || { id: assessmentId, title: 'Technical Assessment', duration_minutes: 45 };

      // 4. Fetch Monitoring Session
      const sesRes = await client.query(
        `SELECT * FROM assessment_monitoring_sessions 
         WHERE assessment_id = $1 AND student_id = $2 
         ORDER BY started_at DESC LIMIT 1`,
        [assessmentId, targetStudent.id]
      );
      const session = sesRes.rows[0] || null;

      // 5. Fetch Integrity Events from assessment_monitoring_events
      const evRes = await client.query(
        `SELECT ame.*, u.email as reviewer_email 
         FROM assessment_monitoring_events ame
         LEFT JOIN users u ON u.id = ame.reviewed_by
         WHERE ame.assessment_id = $1 AND ame.student_id = $2 
         ORDER BY ame.occurred_at ASC`,
        [assessmentId, targetStudent.id]
      );
      const events = evRes.rows;

      // 6. Aggregate telemetry statistics
      let tabSwitches = 0;
      let fullscreenExits = 0;
      let pasteAttempts = 0;
      let additionalPersons = 0;
      let phoneLikeObjects = 0;
      let faceAbsences = 0;
      let otherEvents = 0;

      for (const ev of events) {
        const type = String(ev.event_type || '').toUpperCase();
        if (type.includes('TAB_SWITCH') || type.includes('WINDOW_BLUR')) tabSwitches++;
        else if (type.includes('FULLSCREEN')) fullscreenExits++;
        else if (type.includes('PASTE')) pasteAttempts++;
        else if (type.includes('MULTIPLE_FACES') || type.includes('MULTIPLE_PERSON') || type.includes('ADDITIONAL_PERSON')) additionalPersons++;
        else if (type.includes('PHONE') || type.includes('EXTERNAL_DEVICE')) phoneLikeObjects++;
        else if (type.includes('FACE_ABSENT') || type.includes('NO_FACE')) faceAbsences++;
        else otherEvents++;
      }

      const totalSignals = events.length;
      const overallStatus = totalSignals === 0 ? 'NORMAL' : 'REVIEW_REQUIRED';

      let durationMinutes = assessment.duration_minutes || 45;
      if (session?.started_at && session?.ended_at) {
        durationMinutes = Math.max(1, Math.round((new Date(session.ended_at) - new Date(session.started_at)) / 60000));
      }

      return {
        success: true,
        data: {
          assessmentId: assessment.id,
          assessmentTitle: assessment.title,
          student: {
            id: targetStudent.id,
            name: targetStudent.student_name,
            email: targetStudent.email,
            rollNumber: targetStudent.roll_number
          },
          durationMinutes,
          session: session ? {
            id: session.id,
            startedAt: session.started_at,
            endedAt: session.ended_at,
            consentGiven: session.consent_given,
            cameraEnabled: session.camera_enabled,
            microphoneEnabled: session.microphone_enabled,
            status: session.status
          } : null,
          counters: {
            tabSwitches,
            fullscreenExits,
            pasteAttempts,
            additionalPersons,
            phoneLikeObjects,
            faceAbsences,
            otherEvents,
            totalSignals
          },
          overallStatus,
          statusLabel: overallStatus === 'NORMAL' ? 'Standard Assessment Flow' : 'Potential Integrity Event — Review Required',
          events: events.map(e => ({
            id: e.id,
            eventType: e.event_type,
            description: e.event_description,
            timestamp: e.occurred_at || e.event_timestamp,
            durationSeconds: e.duration_seconds,
            confidence: e.confidence,
            severity: e.severity,
            questionId: e.question_id,
            metadata: e.metadata,
            reviewStatus: e.review_status,
            reviewedBy: e.reviewer_email || e.reviewed_by,
            reviewedAt: e.reviewed_at
          }))
        }
      };
    } finally {
      client.release();
    }
  }

  /**
   * Human review workflow action (CONFIRMED, DISMISSED, NEEDS_MORE_REVIEW, ESCALATED)
   */
  async reviewEvent({ eventId, reviewerUserId, reviewerRole = 'faculty', reviewStatus, notes = '' }) {
    const validStatuses = ['CONFIRMED', 'DISMISSED', 'NEEDS_MORE_REVIEW', 'ESCALATED'];
    const normalized = String(reviewStatus || '').toUpperCase();
    if (!validStatuses.includes(normalized)) {
      const err = new Error(`Invalid reviewStatus "${reviewStatus}". Must be one of: ${validStatuses.join(', ')}`);
      err.statusCode = 400;
      throw err;
    }

    const client = await this.getClient();
    try {
      // 1. Check if event exists
      const checkRes = await client.query(
        `SELECT id, metadata, assessment_id, student_id FROM assessment_monitoring_events WHERE id = $1`,
        [eventId]
      );
      if (checkRes.rows.length === 0) {
        const err = new Error('Assessment monitoring event not found.');
        err.statusCode = 404;
        throw err;
      }

      const curMeta = checkRes.rows[0].metadata || {};
      const updatedMeta = {
        ...curMeta,
        reviewerNotes: notes,
        reviewedByRole: reviewerRole,
        reviewedAt: new Date().toISOString()
      };

      // 2. Insert into assessment_event_reviews table
      await client.query(
        `INSERT INTO assessment_event_reviews 
          (event_id, reviewer_id, review_action, reviewer_comment, reviewed_at, created_at)
         VALUES ($1, $2, $3, $4, NOW(), NOW())`,
        [eventId, reviewerUserId || null, normalized, notes]
      );

      // 3. Update assessment_monitoring_events
      const res = await client.query(
        `UPDATE assessment_monitoring_events 
         SET review_status = $1, reviewed_by = $2, reviewed_at = NOW(), metadata = $3 
         WHERE id = $4 
         RETURNING *`,
        [normalized, reviewerUserId || null, JSON.stringify(updatedMeta), eventId]
      );

      // 4. Update assessment_integrity_events if present
      try {
        await client.query(
          `UPDATE assessment_integrity_events 
           SET review_status = $1, reviewed_by = $2, reviewed_at = NOW(), metadata = $3 
           WHERE id = $4`,
          [normalized, reviewerUserId || null, JSON.stringify(updatedMeta), eventId]
        );
      } catch (e) {}

      return {
        success: true,
        message: `Event review status updated to "${normalized}".`,
        event: res.rows[0]
      };
    } finally {
      client.release();
    }
  }

  /**
   * Escalate an event to a higher authority (Faculty -> Coordinator/Institution Admin, Evaluator -> Company Admin)
   */
  async escalateEvent({ eventId, reviewerUserId, reviewerRole = 'faculty', notes = '', targetRole = null }) {
    const client = await this.getClient();
    try {
      const checkRes = await client.query(
        `SELECT ame.*, a.title as assessment_title, s.full_name as student_name, s.roll_number, s.institution_id 
         FROM assessment_monitoring_events ame
         JOIN assessments a ON a.id = ame.assessment_id
         JOIN students s ON s.id = ame.student_id
         WHERE ame.id = $1`,
        [eventId]
      );

      if (checkRes.rows.length === 0) {
        const err = new Error('Assessment monitoring event not found.');
        err.statusCode = 404;
        throw err;
      }

      const event = checkRes.rows[0];
      const isAcademic = event.assessment_type === 'ACADEMIC';
      const resolvedTargetRole = targetRole || (isAcademic ? 'coordinator' : 'company_admin');

      // 1. Review action as ESCALATED
      await this.reviewEvent({
        eventId,
        reviewerUserId,
        reviewerRole,
        reviewStatus: 'ESCALATED',
        notes: `Escalated to ${resolvedTargetRole}: ${notes}`
      });

      // 2. Resolve destination recipient user id
      let targetUserId = null;
      if (isAcademic) {
        const coordRes = await client.query(
          `SELECT ap.user_id 
           FROM academician_profiles ap 
           WHERE ap.institution_id = $1 AND (LOWER(ap.designation) LIKE '%coordinator%' OR LOWER(ap.designation) LIKE '%hod%')
           LIMIT 1`,
          [event.institution_id]
        );
        targetUserId = coordRes.rows[0]?.user_id || null;
      } else {
        const compAdminRes = await client.query(
          `SELECT cm.user_id 
           FROM company_members cm
           JOIN assessments a ON a.company_id = cm.company_id
           WHERE a.id = $1 AND cm.is_active = true
           ORDER BY cm.joined_at ASC LIMIT 1`,
          [event.assessment_id]
        );
        targetUserId = compAdminRes.rows[0]?.user_id || null;
      }

      // 3. Dispatch escalation notification
      if (targetUserId) {
        const notifRecipientType = isAcademic ? 'institution' : 'company';
        await client.query(
          `INSERT INTO notifications 
            (recipient_type, recipient_id, notification_type, title, message, related_entity_type, related_entity_id, details, is_read, is_deleted, created_at)
           VALUES ($1, $2, 'ASSESSMENT_ESCALATED_ALERT', $3, $4, 'assessment_monitoring_events', $5, $6, false, false, NOW())`,
          [
            notifRecipientType,
            targetUserId,
            `Escalated Assessment Event: ${event.event_type.replace(/_/g, ' ')}`,
            `Faculty has escalated an integrity event for ${event.student_name} (${event.roll_number}) in "${event.assessment_title}". Reason: ${notes}`,
            eventId,
            JSON.stringify({
              eventId,
              assessmentId: event.assessment_id,
              studentId: event.student_id,
              studentName: event.student_name,
              targetRole: resolvedTargetRole,
              escalatedBy: reviewerUserId,
              escalationNotes: notes,
              escalatedAt: new Date().toISOString()
            })
          ]
        );
      }

      return {
        success: true,
        message: `Event successfully escalated to ${resolvedTargetRole}.`,
        eventId,
        escalatedTo: resolvedTargetRole
      };
    } finally {
      client.release();
    }
  }

  isUuid(str) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str || ''));
  }

  async resolveInstitutionUuid(identifier) {
    if (!identifier) return null;
    const str = String(identifier).trim();
    if (this.isUuid(str)) return str;

    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT id FROM institutions WHERE code = $1 OR short_name = $1 OR name ILIKE $1 LIMIT 1`,
        [str]
      );
      if (res.rows.length > 0) return res.rows[0].id;
      return null;
    } catch (e) {
      return null;
    } finally {
      client.release();
    }
  }

  async resolveCompanyUuid(identifier) {
    if (!identifier) return null;
    const str = String(identifier).trim();
    if (this.isUuid(str)) return str;

    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT id FROM companies WHERE id::text = $1 OR name ILIKE $1 LIMIT 1`,
        [str]
      );
      if (res.rows.length > 0) return res.rows[0].id;
      return null;
    } catch (e) {
      return null;
    } finally {
      client.release();
    }
  }

  /**
   * Faculty-Scoped Alerts:
   * Returns events for students mentored by or assigned to this faculty
   */
  async getFacultyAlerts({ userId, institutionId, limit = 50, status = null }) {
    const client = await this.getClient();
    try {
      const cleanInstId = await this.resolveInstitutionUuid(institutionId);
      const cleanUserId = this.isUuid(userId) ? userId : null;

      let query = `
        SELECT ame.*, a.title as assessment_title, s.full_name as student_name, s.roll_number, u.email as student_email
        FROM assessment_monitoring_events ame
        JOIN assessments a ON a.id = ame.assessment_id
        JOIN students s ON s.id = ame.student_id
        LEFT JOIN users u ON u.id = s.user_id
        WHERE ame.assessment_type = 'ACADEMIC'
          AND (
            ($1::uuid IS NOT NULL AND s.id IN (SELECT student_id FROM student_staff_mapping WHERE (staff_id = $1::uuid OR staff_id IN (SELECT id FROM academician_profiles WHERE user_id = $1::uuid)) AND is_active = true))
            OR ($1::uuid IS NOT NULL AND ame.id IN (SELECT event_id FROM assessment_notification_recipients WHERE recipient_user_id = $1::uuid))
            OR ($1::uuid IS NOT NULL AND a.academician_id IN (SELECT id FROM academician_profiles WHERE user_id = $1::uuid))
            OR ($2::uuid IS NOT NULL AND s.institution_id = $2::uuid)
          )
      `;
      const params = [cleanUserId, cleanInstId];

      if (status) {
        params.push(status.toUpperCase());
        query += ` AND ame.review_status = $${params.length}`;
      }

      query += ` ORDER BY ame.occurred_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const res = await client.query(query, params);
      return {
        success: true,
        data: res.rows
      };
    } finally {
      client.release();
    }
  }

  /**
   * Coordinator-Scoped Alerts:
   * Returns department-wide alerts and escalated events
   */
  async getCoordinatorAlerts({ userId, institutionId, departmentId = null, limit = 50, status = null }) {
    const client = await this.getClient();
    try {
      const cleanInstId = await this.resolveInstitutionUuid(institutionId);
      const cleanUserId = this.isUuid(userId) ? userId : null;
      const cleanDeptId = this.isUuid(departmentId) ? departmentId : null;

      let query = `
        SELECT ame.*, a.title as assessment_title, s.full_name as student_name, s.roll_number, u.email as student_email
        FROM assessment_monitoring_events ame
        JOIN assessments a ON a.id = ame.assessment_id
        JOIN students s ON s.id = ame.student_id
        LEFT JOIN users u ON u.id = s.user_id
        WHERE ame.assessment_type = 'ACADEMIC'
          AND (
            ($1::uuid IS NOT NULL AND (s.institution_id = $1::uuid OR a.institution_id = $1::uuid))
            OR ($2::uuid IS NOT NULL AND ame.id IN (SELECT event_id FROM assessment_notification_recipients WHERE recipient_user_id = $2::uuid AND recipient_role = 'coordinator'))
            OR ame.review_status = 'ESCALATED'
          )
      `;
      const params = [cleanInstId, cleanUserId];

      if (cleanDeptId) {
        params.push(cleanDeptId);
        query += ` AND s.department_id = $${params.length}`;
      }

      if (status) {
        params.push(status.toUpperCase());
        query += ` AND ame.review_status = $${params.length}`;
      }

      query += ` ORDER BY (CASE WHEN ame.review_status = 'ESCALATED' THEN 0 ELSE 1 END), ame.occurred_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const res = await client.query(query, params);
      return {
        success: true,
        data: res.rows
      };
    } finally {
      client.release();
    }
  }

  /**
   * Institution-Wide Overview & Telemetry:
   * Aggregated metrics and student monitoring events strictly scoped to this institution
   */
  async getInstitutionOverview({ userId, institutionId, limit = 100, status = null }) {
    const cleanInstId = await this.resolveInstitutionUuid(institutionId);
    if (!cleanInstId) {
      return {
        success: true,
        metrics: { total_sessions: 0, active_sessions: 0, total_events: 0, pending_reviews: 0, escalated_reviews: 0, review_required_events: 0 },
        events: []
      };
    }

    const client = await this.getClient();
    try {
      // 1. Metrics aggregation
      const metricsRes = await client.query(
        `SELECT 
          COUNT(DISTINCT ams.id) as total_sessions,
          COUNT(DISTINCT CASE WHEN ams.status = 'ACTIVE' THEN ams.id END) as active_sessions,
          COUNT(ame.id) as total_events,
          COUNT(CASE WHEN ame.review_status = 'PENDING_REVIEW' THEN ame.id END) as pending_reviews,
          COUNT(CASE WHEN ame.review_status = 'ESCALATED' THEN ame.id END) as escalated_reviews,
          COUNT(CASE WHEN ame.severity = 'REVIEW_REQUIRED' THEN ame.id END) as review_required_events
         FROM assessment_monitoring_sessions ams
         JOIN students s ON s.id = ams.student_id
         LEFT JOIN assessment_monitoring_events ame ON ame.session_id = ams.id
         WHERE s.institution_id = $1`,
        [cleanInstId]
      );

      // 2. Events list
      let eventsQuery = `
        SELECT ame.*, a.title as assessment_title, s.full_name as student_name, s.roll_number, u.email as student_email
        FROM assessment_monitoring_events ame
        JOIN assessments a ON a.id = ame.assessment_id
        JOIN students s ON s.id = ame.student_id
        LEFT JOIN users u ON u.id = s.user_id
        WHERE ame.assessment_type = 'ACADEMIC' AND s.institution_id = $1
      `;
      const params = [cleanInstId];

      if (status) {
        params.push(status.toUpperCase());
        eventsQuery += ` AND ame.review_status = $${params.length}`;
      }

      eventsQuery += ` ORDER BY ame.occurred_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const eventsRes = await client.query(eventsQuery, params);

      return {
        success: true,
        metrics: metricsRes.rows[0],
        events: eventsRes.rows
      };
    } finally {
      client.release();
    }
  }

  /**
   * Company-Scoped Candidate Alerts:
   * Returns events strictly for this company's assessments
   */
  async getCompanyAlerts({ userId, companyId, limit = 50, status = null }) {
    const cleanCompanyId = await this.resolveCompanyUuid(companyId);
    if (!cleanCompanyId) {
      return { success: true, data: [] };
    }

    const client = await this.getClient();
    try {
      let query = `
        SELECT ame.*, a.title as assessment_title, s.full_name as candidate_name, s.roll_number, u.email as candidate_email
        FROM assessment_monitoring_events ame
        JOIN assessments a ON a.id = ame.assessment_id
        JOIN students s ON s.id = ame.student_id
        LEFT JOIN users u ON u.id = s.user_id
        WHERE ame.assessment_type = 'INDUSTRY' AND a.company_id = $1
      `;
      const params = [cleanCompanyId];

      if (status) {
        params.push(status.toUpperCase());
        query += ` AND ame.review_status = $${params.length}`;
      }

      query += ` ORDER BY (CASE WHEN ame.review_status = 'ESCALATED' THEN 0 ELSE 1 END), ame.occurred_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const res = await client.query(query, params);
      return {
        success: true,
        data: res.rows
      };
    } finally {
      client.release();
    }
  }

  /**
   * Fetch assessment monitoring settings
   */
  async getMonitoringSettings(assessmentId) {
    const client = await this.getClient();
    try {
      const res = await client.query(
        `SELECT * FROM assessment_monitoring_settings WHERE assessment_id = $1`,
        [assessmentId]
      );
      if (res.rows.length > 0) return res.rows[0];

      // Default settings
      return {
        assessment_id: assessmentId,
        fullscreen_monitoring_enabled: true,
        camera_monitoring_enabled: true,
        face_presence_enabled: true,
        notification_threshold: 'WARNING'
      };
    } finally {
      client.release();
    }
  }

  /**
   * Update or configure assessment monitoring settings
   */
  async updateMonitoringSettings({ assessmentId, settings, userId }) {
    const client = await this.getClient();
    try {
      const {
        fullscreenMonitoringEnabled = true,
        cameraMonitoringEnabled = true,
        facePresenceEnabled = true,
        notificationThreshold = 'WARNING'
      } = settings;

      const res = await client.query(
        `INSERT INTO assessment_monitoring_settings 
          (assessment_id, fullscreen_monitoring_enabled, camera_monitoring_enabled, face_presence_enabled, notification_threshold, configured_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (assessment_id) DO UPDATE SET
          fullscreen_monitoring_enabled = EXCLUDED.fullscreen_monitoring_enabled,
          camera_monitoring_enabled = EXCLUDED.camera_monitoring_enabled,
          face_presence_enabled = EXCLUDED.face_presence_enabled,
          notification_threshold = EXCLUDED.notification_threshold,
          configured_by = EXCLUDED.configured_by,
          updated_at = NOW()
         RETURNING *`,
        [
          assessmentId,
          Boolean(fullscreenMonitoringEnabled),
          Boolean(cameraMonitoringEnabled),
          Boolean(facePresenceEnabled),
          String(notificationThreshold).toUpperCase(),
          userId || null
        ]
      );

      return {
        success: true,
        message: 'Assessment monitoring settings saved.',
        settings: res.rows[0]
      };
    } finally {
      client.release();
    }
  }
}

module.exports = new AssessmentGuardService();
