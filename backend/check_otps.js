const { Pool } = require('pg');
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_ikcMJfXBhQ16@ep-lively-lab-azup6nw8.c-3.ap-southeast-1.aws.neon.tech/neondb?sslmode=require'
});

async function check() {
  const res = await pool.query("SELECT * FROM otps WHERE email = 'mdsadiqueamin721721@gmail.com' ORDER BY created_at DESC LIMIT 3");
  console.log('OTPS FOR USER:', JSON.stringify(res.rows, null, 2));
  await pool.end();
}

check();
