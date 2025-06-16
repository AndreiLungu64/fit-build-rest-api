import express from 'express';
// import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { fileURLToPath } from 'url';
import path from 'path';
import { dirname } from 'path';

import cors from 'cors';
import { corsOptions } from './config/corsOptions.js';
import cookieParser from 'cookie-parser';

import { logger } from './middleware/logEvents.js';
import { errorHandler } from './middleware/errorHandler.js';
import { credentials } from './middleware/credentials.js';
import verifyJWT from './middleware/verifyJWT.js';

import rootRouter from './routes/root.js';
import employeesRouter from './routes/api/employees.js';
import registerRouter from './routes/api/register.js';
import authRouter from './routes/api/auth.js';
import refreshRouter from './routes/api/refresh.js';
import logoutRouter from './routes/api/logout.js';
import dotenv from 'dotenv';
dotenv.config();
import initializeDatabase from './db/init.js';
import exercisesRouter from './routes/api/exercises.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize the database
// initializeDatabase()
//   .then(() => {
//     console.log('Database initialized successfully');
//   })
//   .catch(error => {
//     console.error('Database initialization failed:', error);
//   });

const app = express();
const PORT = process.env.PORT || 3500;

//1.Middleware (first)
// custom middleware logger, see implementation in middleware/logEvents.ts
app.use(logger);

// and fetch cookies credentials requirement
//Handle options credentials check - must happen before CORS, otherwise CORS might reject requests before they even get to your credentials check
app.use(credentials);

//cors third party middleware - Cross Origin Resource Sharing
app.use(cors(corsOptions));

//built-in middleware to handle urlencoded form data
app.use(express.urlencoded({ extended: false }));

//built-in middleware for json, enables us to access json from a submission
app.use(express.json());

//third-party middleware for cookies
app.use(cookieParser());

///built-in middleware for to serve  static files from the public folder, if no path mentioned it defaults for "/"
app.use('/', express.static(path.join(__dirname, '/public')));

//2.Routers (second)
app.use('/', rootRouter);
app.use('/register', registerRouter); //doesnt need the static files middleware because an api serves json
app.use('/auth', authRouter); //doesnt need the static files middleware because an api serves json
app.use('/refresh', refreshRouter); //this route is specifically designed to be called when a user's access token has expired or is invalid
app.use('/logout', logoutRouter);
app.use('/api/exercises', exercisesRouter);
app.use(verifyJWT); //require JWT authentication for every routes below this lines
app.use('/employees', employeesRouter); //doesnt need the static files middleware because an api serves json

// #3.Unknow Routes Handler# (catch all 404)
// Option 1: Simple catch-all for unknown routes
// app.get("/*", (req, res) => {
//   res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
// });
// Option 2: Content negotiation for unknown routes - app.all used to customise the 404 response format, handle multiple outcomes depending the requested file
app.all('*', (req, res) => {
  res.status(404);
  /*this is a series of conditional checks to determine the preffered response format based on  client's accepted header
    is a property in the request header reffering to the preffered response type*/
  if (req.accepts('html')) {
    res.sendFile(path.join(__dirname, 'views', '404.html'));
  } else if (req.accepts('json')) {
    res.json({ error: '404 Not Found' });
  } else {
    res.type('text').send('404 Not Found');
  }
});

//4.#Error middleware
//custom error handling middleware
// app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
//   console.error(err.stack);
//   res.status(500).send(err.message); //send 500- server error, and print on the browser the err.message
// });
//is better to store this middleware in middleware folder and use it like:
app.use(errorHandler);

//#5.Port listener#
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
