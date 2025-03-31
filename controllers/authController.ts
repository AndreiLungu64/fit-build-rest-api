import path from "path";
import { Request, Response} from "express";
import bcrypt from "bcrypt";

import fsPromises from "fs/promises"
import jwt from "jsonwebtoken";
import {config} from "dotenv";
config();

import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import json from "../model/users.json" with { type: "json" };
import { User, UserDB } from "../types/globalTypes.js";

const usersDB: UserDB = {
  users: json,
  setUsers: function (data: User[]) {
    this.users = data;
  },
};

const handleLogin = async (req: Request, res : Response) => {
    const { user, pwd } = req.body;
    if (!user || !pwd) {
      res.status(400).json({ message: "Username and password are required." });
      return;
    }

    const foundUser = usersDB.users.find(person => person.username === user);
    if(!foundUser){
        res.sendStatus(401); //unauthorised
        return;
    }

    //evaluate password
    const match = await bcrypt.compare(pwd, foundUser.password); // authorise the login, compare the hashed password with entered pasword

    if(match) {
        const roles = Object.values(foundUser.roles);//array of the user roles codes, not actual roles [2002]
        console.log();
        //create JWTs
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

        if(!accessTokenSecret || !refreshTokenSecret) {
        res.status(500).json({ message: 'Server configuration error' });
        return;
        }

        // {"username" : foundUser.username}, //payload - data embeded in the token, I replaced it with the user role
        const accessToken = jwt.sign(
            { 
                "userInfo": {
                    "username" : foundUser.username,
                    "roles" : roles,
                }   
            },
            process.env.ACCESS_TOKEN_SECRET!,
            {expiresIn: '30s'} //5-15 min in production
        );

        //no need to store the roles in refresh token, its only used to in accessToken genration
        const refreshToken = jwt.sign(
            {"username" : foundUser.username},
            process.env.REFRESH_TOKEN_SECRET!,
            {expiresIn: '1d'} //24h in production
        );

        //save refresh token with current user in the DB, that can be cross-refferenced when it is send back to crate another access token
        const otherUses = usersDB.users.filter(person => person.username !== foundUser.username);
        const currentUser = {
            ...foundUser,
            refreshToken,
        }
        usersDB.setUsers([...otherUses, currentUser]);
        await fsPromises.writeFile(path.join(__dirname, "..", "model", "users.json"), JSON.stringify(usersDB.users));


        //send the refreshToken to the frontend as a httpOnly Cookie (not available to js)
        //once the refresh token is send as a cookie it remains avalable as a cookie on the frontend till it expries
        /*So once the cookie is sent to the frontend after authorisation it remains avalable on the frontend till it expires. 
        For every subsequent request to your server/domain, the browser automatically attaches this cookie to the request headers.*/

        // sameSite allows cookies to be send with cross-site requests (with requests that come from other domains, like from your client)
        //secure:true setting for cookies means that the cookie will only be sent over HTTPS only
        //remove secure:true only when testing /refresh with thunderclient
        res.cookie("jwt", refreshToken, {httpOnly: true, sameSite:"none", secure:true, maxAge: 24 * 60 * 60 * 1000}) 

        //send the tokens to the frontend
        //send the accessToken as JSON
        res.json({accessToken})

        // res.json({"message" : `User ${user} is logged in!`});
    }
    else{ 
        res.sendStatus(401);//unauthorised
    }
}

export default {handleLogin}

