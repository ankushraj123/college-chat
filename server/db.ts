import mysql from "mysql2/promise";
import "dotenv/config";

const pool = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

export default pool;