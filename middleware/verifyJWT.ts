import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
config();

//the recommended pattern in TypeScript is to modify the global Express namespace like below instead of the interface
// declare namespace Express {
//   interface Request {
//     user?: string | JwtPayload;
//   }
// }

//redeffine the Request parameter to contain the user property (which it doesn't by default)
interface RequestWithUser extends Request {
  user?: string | JwtPayload;
}

//verify if the access token attached in the request header is a valid one, if it is
const verifyJWT = (req: RequestWithUser, res: Response, next: NextFunction) => {
  //accessing the bearer token (access token) from the authorisation header (a request has multiple headers authorisation contianing the bearer token)
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    res.sendStatus(401); //unauthorised, it means an unauthorized user tried to access a protected route
    return;
  }

  //   console.log(authHeader); //will print : "Beare" token (bearer string and the actual token)
  const token = authHeader.split(" ")[1]; //get only the token

  //checks if the token is valid by verifying its signature using the access token secret
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!, (err, decoded) => {
    //IF THE ACCESS TOKEN EXPIRES THIS IS THE POINT WHERE IT WILL FAIL
    if (err || !decoded) {
      res.sendStatus(403); //forbidden, invalid token, or error
      return;
    }

    //Extracting the username from the decoded JWT payload and attaching it to the request object
    /*The purpose is to make the authenticated user's identity available to all subsequent middleware and route handlers that process this request. Instead of decoding the token in multiple places, you decode it once in the middleware, and then any route handler can simply use req.user to know which user is making the request.*/
    req.user = (decoded as JwtPayload).username;
    next();
  });
};

export default verifyJWT;
