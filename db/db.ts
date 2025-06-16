/*
This file is a standard database connection setup for a TypeScript Node.js application using PostgreSQL. 

/*Connection Pool:
 - A collection of database connections that are created ahead of time and reused
 - Saves time by not creating a new connection for every request
 - Manages how many connections are active at once
 - You don't necessarily need multiple connections even when interacting with just one database, but a connection pool is still 
 beneficial for several reasons: concurent requests, performance, as your application grows, the pool will scale appropriately without you needing to change your code.

When your code needs to talk to the database, it :
 - Borrows" a connection (client) from the pool
 - "Releasing" means returning that connection back to the pool when you're done. This lets another request use that connection later


The query function: A simple way to run SQL commands without manually handling clients
The pool object: Gives direct access to all pool features when you need more control
You export both so other parts of your code can choose the right tool for each situation
 */

import pkg from 'pg'; //pg package is the official Node.js client for PostgreSQL
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

// Creates a connection pool to your PostgreSQL database using credentials from environment variables:
const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// Test the connection by:
// Acquiring a client from the pool with connect
// Running a simple query (SELECT NOW()) (that returns the current date and time from the PostgreSQL server)to check if the connection works
// Releasing the client back to the pool
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

// Export the pool object for direct use when needed
export default pool;
