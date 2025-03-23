import express from "express";
// import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { fileURLToPath } from "url";
import path from "path";
import { dirname } from "path";
import { logger } from "./middleware/logEvents.js";
import { errorHandler } from "./middleware/errorHandler.js";
import cors from "cors";
import { CorsOptions } from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3500;

const whitelist = ["https://yoursite.com", "http:127.0.0.1: 5500", "http://localhost:3500"]; //in production put here only your frontent url
//origin is the name of the property cors expects, the parameter "origin" is the domain from where the request came
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) => {
    //null means no error - the first parameter is for errors, true means "allow this domain"
    if ((origin && whitelist.indexOf(origin) !== -1) || !origin) callback(null, true); //in production use: if (origin && whitelist.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not allowed by CORS!"));
  },
  optionsSuccessStatus: 200, // success status
};

app.use(logger); // custom middleware, see implementation in middleware/logEvents.ts
app.use(cors(corsOptions)); //cors third party middleware
app.use(express.urlencoded({ extended: false })); //urlencoded middleware for handling url encoded data- form data, build-in middleware
app.use(express.json()); //json middleware to access json from a submission, build-in middleware
app.use(express.static(path.join(__dirname, "/public"))); //static middleware to access static files, build-in middleware

app.get("^/$|/index(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.get("/new-page(.html)?", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "new-page.html"));
});

app.get("/old-page(.html)?", (req, res) => {
  res.redirect(301, "/new-page.html");
});

app.get("/*", (req, res) => {
  res.status(404).sendFile(path.join(__dirname, "views", "404 .html"));
});

//app.all used to customise the 404 response from above
//app.use is for middleware, app.all is for routing and applies to all http methods at once
app.all("*", (req, res) => {
  //can handle multiple outcomes depending the requested file
  res.status(404);

  /*this is a series of conditional checks to determine the preffered response format based on  client's accepted header
    is a property in the request header reffering to the preffered response type*/
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404 .html"));
  } else if (req.accepts("json")) {
    res.json({ error: "404 Not Found" });
  } else {
    res.type("text").send("404 Not Found");
  }
});

//custom error handling middleware
// app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
//   console.error(err.stack);
//   res.status(500).send(err.message); //send 500- server error, and print on the browser the err.message
// });
//is better to store this middleware in middleware folder and use it like:
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
