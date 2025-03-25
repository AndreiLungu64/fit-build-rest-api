import path from "path";
import { fileURLToPath } from "url";
import { Request, Response} from "express";
import bcrypt from "bcrypt";

import fsPromises from "fs/promises"
import jwt from "jsonwebtoken";
import {config} from "dotenv";
config();

import json from "../model/users.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    const match = await bcrypt.compare(pwd, foundUser.password); // authorise the login
    console.log(match);
    if(match) {
        //create JWTs
        const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
        const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;

        if(!accessTokenSecret || !refreshTokenSecret) {
        res.status(500).json({ message: 'Server configuration error' });
        return;
        }

        const accessToken = jwt.sign(
            {"username" : foundUser.username},
            accessTokenSecret,
            {expiresIn: '30s'} //5-15 min in production
        );

        const refreshToken = jwt.sign(
            refreshTokenSecret,
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


        //send the tokens to the frontend
        //send the accessToken as JSON
        res.json({accessToken})

        //send the refreshToken to the frontend as a httpOnly Cookie (not available to js)
        res.cookie("jwt", refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000}) //the cookie will expire after 24

        // res.json({"message" : `User ${user} is logged in!`});
    }
    else{ 
        res.sendStatus(401);//unauthorised
    }
}

export default {handleLogin}