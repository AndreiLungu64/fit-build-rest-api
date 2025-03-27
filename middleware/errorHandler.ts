import { Request, Response, NextFunction } from "express";
import { logEvents } from "./logEvents.js";

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  logEvents(`${err.name}\t${err.message}`, "errLog.txt");
  console.error(err.stack);
  res.status(500).send(err.message); //send 500- server error, and print on the browser the err.message
}
