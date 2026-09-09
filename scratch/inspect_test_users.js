const path = require('path');
require(path.join(__dirname, '../backend/node_modules/dotenv')).config({ path: path.join(__dirname, '../backend/.env') });
const rm = require('../backend/src/db/relationalManager');

async function main() {
  const users = await rm.pg.query(`
    SELECT 
      u.id, u.email, u.full_name, u.role as direct_role, r.name as role_table_name,
      im.institution_id as member_inst_id,
      cm.company_id as member_comp_id,
      s.institution_id as student_inst_id,
      s.roll_number,
      i.code as inst_code, i.name as inst_name,
      c.company_name as comp_name
    FROM users u
    LEFT JOIN user_roles ur ON u.id = ur.user_id
    LEFT JOIN roles r ON ur.role_id = r.id
    LEFT JOIN institution_members im ON u.id = im.user_id
    LEFT JOIN company_members cm ON u.id = cm.user_id
    LEFT JOIN students s ON u.id = s.user_id
    LEFT JOIN institutions i ON (im.institution_id = i.id OR s.institution_id = i.id)
    LEFT JOIN companies c ON cm.company_id = c.id
    ORDER BY u.role, u.email
  `);
  
  console.log(`Total users in PostgreSQL: ${users.rows.length}`);
  const roles = {};
  users.rows.forEach(u => {
    const r = u.direct_role || u.role_table_name || 'NO_ROLE';
    roles[r] = roles[r] || [];
    roles[r].push(u);
  });

  for (const [role, list] of Object.entries(roles)) {
    console.log(`\nRole: ${role} (${list.length} users)`);
    list.slice(0, 5).forEach(u => {
      console.log(`  - ${u.email.padEnd(32)} | ${(u.full_name || 'N/A').padEnd(25)} | Inst: ${u.inst_code || u.inst_name || 'N/A'} | Comp: ${u.comp_name || 'N/A'}`);
    });
  }

  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
