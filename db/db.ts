import pkg from 'pg'; //pg package is the official Node.js client for PostgreSQL
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Create a connection pool instance
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  if (!client) return;
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) {
      return console.error('Error executing query', err.stack);
    }
    console.log('Connected to database:', result.rows[0]);
  });
});

// Export the query method
export const query = (text: string, params?: any[]) => pool.query(text, params);

// Export the pool for direct use when needed
export default pool;
