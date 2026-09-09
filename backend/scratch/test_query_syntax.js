require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const rm = require('../src/db/relationalManager');

async function test() {
  const ts = Date.now();
  const cleanEmail = `test.reg.${ts}@campus.edu`;
  const regRes = await rm.registerUser({
    role: 'student',
    name: 'Rohan Sharma',
    email: cleanEmail,
    password: 'StrongPassword123!',
    collegeId: 'TN010',
    department: 'CSE',
    careerGoal: 'AI / Machine Learning Engineer'
  });
  console.log('registerUser result:', regRes.success, 'user.studentId:', regRes.user?.studentId);
  const stu = await rm.getStudentById(regRes.user?.studentId);
  console.log('getStudentById result:', stu ? {
    id: stu.id,
    studentId: stu.studentId,
    placementStatus: stu.placementStatus,
    placement_status: stu.placement_status
  } : 'NOT FOUND');

  const pgStu = await rm.pg.query('SELECT id, roll_number, placement_status FROM students WHERE id = $1', [regRes.user?.studentId]);
  console.log('pg query direct:', pgStu.rows[0]);

  process.exit(0);
}

test().catch(e => { console.error(e); process.exit(1); });
