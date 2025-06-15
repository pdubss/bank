import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    "postgresql://postgres.hemeefitmzeejzjrczbv:P57q2CsPUHrbFb4i@aws-0-us-east-2.pooler.supabase.com:6543/postgres",
  ssl: false,
});

async function testConnection(req, res) {
  try {
    const res = await pool.query("SELECT NOW()");
    console.log("Database time", res.rows[0]);
  } catch (error) {
    console.error("Database connection error", error);
  }
}
testConnection();

export default pool;
