const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const rm = require('../backend/src/db/relationalManager');

async function testSubmission() {
  console.log('--- TESTING ASSESSMENT ANSWER PERSISTENCE ---');
  const asmtId = 'bd03f6f2-f071-42bc-a945-5fb962c7fbe1';
  const student = await rm.getStudentById('arun.kumar@nexus.edu');
  console.log('Student found:', student.id, student.name, student.email);

  const asmt = await rm.getAssessmentQuestionsForStudent(asmtId, student.id);
  console.log('Assessment loaded:', asmt.title, 'Questions:', asmt.questions.length);

  if (asmt.questions.length === 0) {
    console.error('No questions found in assessment!');
    process.exit(1);
  }

  const q = asmt.questions[0];
  console.log('First question:', q.questionText, 'Options:', q.options);

  await rm.pg.query(
    "UPDATE question_options SET is_correct = true WHERE question_id = $1 AND option_text = 'Tuple'",
    [q.id]
  );

  const optDetails = await rm.pg.query(
    'SELECT id, option_text, is_correct, option_order FROM question_options WHERE question_id = $1',
    [q.id]
  );
  console.log('DB Question Options:', optDetails.rows);

  const correctOption = optDetails.rows.find(o => o.is_correct) || optDetails.rows[0];
  const answers = [
    {
      questionId: q.id,
      selectedOption: correctOption.id
    }
  ];

  console.log('Submitting answers:', answers);
  const result = await rm.submitInstitutionAssessmentAttempt({
    assessmentId: asmtId,
    studentId: student.id,
    answers
  });

  console.log('Submission result:', result);

  const effAttemptId = result.id || result.attemptId;
  const attemptRow = await rm.pg.query(
    'SELECT * FROM assessment_attempts WHERE id = $1',
    [effAttemptId]
  );
  console.log('assessment_attempts row count:', attemptRow.rows.length, 'Score:', attemptRow.rows[0]?.score);

  const answerRows = await rm.pg.query(
    'SELECT * FROM assessment_answers WHERE attempt_id = $1',
    [effAttemptId]
  );
  console.log('assessment_answers rows count:', answerRows.rows.length);
  if (answerRows.rows.length > 0) {
    console.log('assessment_answers row:', answerRows.rows[0]);
  }

  if (answerRows.rows.length > 0) {
    console.log('✅ PASS: assessment_answers row persisted successfully!');
  } else {
    console.error('❌ FAIL: 0 assessment_answers rows persisted!');
    process.exit(1);
  }

  process.exit(0);
}

testSubmission().catch(e => {
  console.error('Test error:', e);
  process.exit(1);
});
