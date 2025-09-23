import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
  connectTimeout: 10000,
});

export default pool;