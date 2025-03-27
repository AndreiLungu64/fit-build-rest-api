import { Request, Response} from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import {config} from "dotenv";
config();

import json from "../model/users.json" with { type: "json" };
import { User, UserDB } from "../types/globalTypes.js";

const usersDB: UserDB = {
  users: json,
  setUsers: function (data: User[]) {
    this.users = data;
  },
};

//in short, this sends the cookie from the frontend to the backend to issue a new access token
const handleRefreshToken = (req: Request, res : Response) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) { //if no cookies or no jwt
      res.sendStatus(401);
      return;
    }
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

    //evaluate jwt -  cryptographic verification between the refreshToken and REFRESH_TOKEN_SECRET
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET!, (err: jwt.VerifyErrors | null, decoded: string | JwtPayload | undefined) => {
        if(err){
            res.sendStatus(403);//forbidden
            return;
        }

        //decoded is the payload from the token that was originally created with jwt.sign()
        const decodedUsername = (decoded as JwtPayload).username;

        if(foundUser.username !== decodedUsername) {
            res.sendStatus(403);//forbidden
            return;
        }

        const roles = Object.values(foundUser.roles); // Object.values({"user": 2002}) = [2002]
        //if the decoded username match with the user's username create a new access token and send it to the frontend
        const accessToken = jwt.sign(
            { 
                "userInfo": {
                    "username" : foundUser.username,
                    "roles" : roles,
                }   
            },
            process.env.ACCESS_TOKEN_SECRET!,
            {expiresIn: "30s"},
        );

        res.json({ accessToken }); //send access token as json
    })
    
}

export default {handleRefreshToken}


/*
The frontend application:
Receive this JSON response
Extract the access token value
Store it (typically in state)
Use it for future API requests by adding it to the Authorization header
*/