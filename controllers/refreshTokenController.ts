
// import { fileURLToPath } from "url";
import { Request, Response} from "express";


import jwt, { JwtPayload } from "jsonwebtoken";
import {config} from "dotenv";
config();

import json from "../model/users.json" with { type: "json" };

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

interface User {
  username: string;
  password: string;
  refreshToken? : string
}

interface UserDB {
  users: User[];
  setUsers: (data: User[]) => void;
}

const usersDB: UserDB = {
  users: json,
  setUsers: function (data: User[]) {
    this.users = data;
  },
};

const handleRefreshToken = (req: Request, res : Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) { //if no cookies or jwt
      res.status(401);
      return;
    }
    console.log(cookies.jwt);
    const refreshToken = cookies.jwt;

    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    if(!foundUser){
        res.sendStatus(403); //forbidden
        return;
    }

    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
    const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

    if(!accessTokenSecret || !refreshTokenSecret) {
        res.status(500).json({ message: 'Server configuration error' });
        return;
        }

    //evaluate jwt
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if(err){
            res.sendStatus(403);//forbidden
            return;
        }

        const decodedUsername = typeof decoded === "string" ? decoded : (decoded as JwtPayload).username;


        if(foundUser.username !== decodedUsername) {
            res.sendStatus(403);//forbidden
            return;
        }

        //if the decoded username match with the 
        const accessToken = jwt.sign(
            {"username": decodedUsername},
            process.env.ACCESS_TOKEN_SECRET!,
            {expiresIn: "30s"},
        );

        res.json({ accessToken }); //send access token as json
    })
    
}

export default {handleRefreshToken}