/*Key concepts:
- Reads the schema.sql file containing table definitions and database structure
- Uses transactions to ensure database changes are atomic (all succeed or all fail)
- Transaction handling:
  - BEGIN starts a transaction
  - COMMIT saves all changes if successful
  - ROLLBACK undoes all changes if any errors occur

The initialization process:
1. Reads schema.sql from the file system
2. Gets a client from the connection pool
3. Executes the SQL commands within a transaction
4. Releases the client when done

###############################################################################################################
This file isn't absolutely essential but serves an important purpose:
It automatically sets up your database structure by:

Reading your database schema (tables, constraints, etc.) from a schema.sql file
Executing those SQL commands to create/update the database structure
Using transactions to ensure all changes succeed or fail together

Think of it as a database setup script that:
Makes database initialization repeatable and consistent
Saves you from manually running SQL commands
The file can either be run directly as a one-time setup script or called from elsewhere in your application when needed.
*/

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
