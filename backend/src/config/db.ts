import sql from 'mssql';
import dotenv from 'dotenv';
dotenv.config();

const config: sql.config = {
  server: process.env.DB_SERVER!,
  database: process.env.DB_NAME!,
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  options: { encrypt: true, trustServerCertificate: false }
};

const pool = new sql.ConnectionPool(config);
const poolConnect = pool.connect();

poolConnect.catch((err: Error) => console.error('DB connection failed:', err));

export { pool, poolConnect, sql };