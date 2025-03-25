import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
config();

//the recommended pattern in TypeScript is to modify the global Express namespace instead of the interface
// declare namespace Express {
//   interface Request {
//     user?: string | JwtPayload;
//   }
// }

interface RequestWithUser extends Request {
  user?: string | JwtPayload;
}

const verifyJWT = (req: RequestWithUser, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.sendStatus(401); //unauthorised
    return;
  }

  console.log(authHeader); //will print : "Beare" token (bearer string and the actual token)
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    if (err || !decoded) {
      res.sendStatus(403); //forbidden, invalid token
      return;
    }
    req.user = (decoded as JwtPayload).username;
    next();
  });
};

export default verifyJWT;
