/**
 * ============================================================================
 * SKILL NEXUS AI — STUDENT SEEDING UTILITY (scratch/add_more_students.js)
 * ============================================================================
 * Utility to seed additional student cohorts into PostgreSQL (skillnexus_db).
 * Idempotent: Skips users and student profiles that already exist.
 * ============================================================================
 */

const path = require('path');
const { Pool } = require(path.join(__dirname, '../backend/node_modules/pg'));
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({
  path: path.join(__dirname, '../backend/.env')
});

const pool = new Pool({
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432', 10),
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || '#9942891197@Rudra',
  database: process.env.PGDATABASE || 'skillnexus_db'
});

const STUDENTS_TO_SEED = [
  {
    fullName: 'Sanjay M',
    email: 'sanjay.m@psgtech.ac.in',
    rollNumber: '21L101',
    graduationYear: 2026,
    readinessScore: 92,
    institutionCode: 'TN010',
    departmentCode: 'CSE',
    skills: ['C++', 'Python', 'Linux', 'Docker']
  },
  {
    fullName: 'Ananya Ramesh',
    email: 'ananya.r@skcet.ac.in',
    rollNumber: '720722105041',
    graduationYear: 2026,
    readinessScore: 88,
    institutionCode: 'TN010',
    departmentCode: 'ECE',
    skills: ['Python', 'SQL', 'Power BI']
  },
  {
    fullName: 'Vignesh V',
    email: 'vignesh.v@kongu.edu',
    rollNumber: '21MER108',
    graduationYear: 2026,
    readinessScore: 85,
    institutionCode: 'TN010',
    departmentCode: 'MECH',
    skills: ['Python', 'ROS2', 'C++']
  },
  {
    fullName: 'Naveen Kumar',
    email: 'naveen.k@ksg.edu.in',
    rollNumber: '711622103019',
    graduationYear: 2026,
    readinessScore: 78,
    institutionCode: 'TN010',
    departmentCode: 'CIVIL',
    skills: ['Python', 'SQL', 'BIM']
  }
];

async function seedStudents() {
  console.log('Connecting to PostgreSQL to seed students...');
  const client = await pool.connect();

  try {
    // Default password hash for nexus@2026
    const defaultPasswordHash = '$2b$10$yBoWpG7yUi3a/w/jWTL0aeDMKGiwKhtjFcS7AmLylCX./hOXt81e2';

    for (const stu of STUDENTS_TO_SEED) {
      // 1. Check if user already exists
      const existingUser = await client.query('SELECT id FROM users WHERE email = $1', [stu.email]);
      let userId;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        console.log(`[EXISTS] User ${stu.email} already present (ID: ${userId})`);
      } else {
        const userRes = await client.query(
          `INSERT INTO users (email, password_hash, role)
           VALUES ($1, $2, 'STUDENT')
           RETURNING id`,
          [stu.email, defaultPasswordHash]
        );
        userId = userRes.rows[0].id;
        console.log(`[CREATED] User ${stu.email} created (ID: ${userId})`);
      }

      // 2. Resolve institution
      const instRes = await client.query(
        'SELECT id FROM institutions WHERE code = $1 LIMIT 1',
        [stu.institutionCode]
      );
      const instId = instRes.rows.length > 0 ? instRes.rows[0].id : null;

      // 3. Resolve department
      let deptId = null;
      if (instId) {
        const deptRes = await client.query(
          'SELECT id FROM departments WHERE institution_id = $1 LIMIT 1',
          [instId]
        );
        deptId = deptRes.rows.length > 0 ? deptRes.rows[0].id : null;
      }

      // 4. Check if student record exists
      const existingStudent = await client.query('SELECT id FROM students WHERE user_id = $1', [userId]);

      if (existingStudent.rows.length === 0 && instId) {
        const stuRes = await client.query(
          `INSERT INTO students (user_id, full_name, institution_id, department_id, roll_number, graduation_year, readiness_score)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           RETURNING id`,
          [userId, stu.fullName, instId, deptId, stu.rollNumber, stu.graduationYear, stu.readinessScore]
        );
        console.log(`[CREATED] Student profile created for ${stu.fullName} (ID: ${stuRes.rows[0].id})`);
      } else {
        console.log(`[EXISTS] Student profile already present for ${stu.fullName}`);
      }
    }

    console.log('\nStudent seeding process completed successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

seedStudents().catch(err => {
  console.error('Seeding Error:', err.message);
  process.exit(1);
});
