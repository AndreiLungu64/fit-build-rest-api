// src/db/init.ts
import fs from 'fs';
import path from 'path';
import pool from './db.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function initializeDatabase() {
  try {
    // Read the schema.sql file
    const schemaFilePath = path.join(__dirname, '../../schema.sql');
    const schema = fs.readFileSync(schemaFilePath, 'utf8');

    // Connect to the database
    const client = await pool.connect();

    try {
      // Begin transaction
      await client.query('BEGIN');

      // Execute the schema SQL
      await client.query(schema);

      // If you have initial data to insert, you can do it here

      // Commit the transaction
      await client.query('COMMIT');

      console.log('Database initialized successfully');
    } catch (error) {
      // If there's an error, roll back the transaction
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Release the client back to the pool
      client.release();
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Run the initialization if this file is executed directly
if (import.meta.url === new URL(import.meta.url, import.meta.url).href) {
  initializeDatabase()
    .then(() => {
      console.log('Database setup completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Database setup failed:', error);
      process.exit(1);
    });
}

export default initializeDatabase;
