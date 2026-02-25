import pg from "pg";

// Postgres returns NUMERIC/DECIMAL and BIGINT as strings by default.
// Override the type parsers so they come back as JS numbers.
pg.types.setTypeParser(1700, parseFloat); // OID 1700 = numeric / decimal
pg.types.setTypeParser(20, (val: string) => {
  const n = Number(val);
  return Number.isSafeInteger(n) ? n : val; // keep as string if > Number.MAX_SAFE_INTEGER
});

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  console.error("Unexpected pool error:", err);
});

export { pool };
