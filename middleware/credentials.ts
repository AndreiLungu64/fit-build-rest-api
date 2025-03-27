import { allowedOrigins } from "../config/allowedOrigins.js";
import { Request, Response, NextFunction } from "express";

function credentials(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  // no origin or not in allowed list
  if (!origin || !allowedOrigins.includes(origin)) {
    res.status(403).json({ message: "Not allowed by CORS" });
    return;
  }

  // origin is allowed
  res.header("Access-Control-Allow-Credentials", "true");
  next();
}

export { credentials };
