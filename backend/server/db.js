import pg from "pg";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
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
