import { Request, Response} from "express";
import json from "../model/users.json" with { type: "json" };
import fsPromises from "fs/promises";
import path from "path";

import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { User, UserDB } from "../types/globalTypes.js";

const usersDB: UserDB = {
  users: json,
  setUsers: function (data: User[]) {
    this.users = data;
  },
};

//delete the access token from the cookie and from the db (but keeping the user and pass)
const handleLogout = async (req: Request, res : Response) => {
    //on client, also delete the accessToken //TODO

    const cookies = req.cookies;
    if (!cookies?.jwt) { //if no cookies or no jwt
      res.sendStatus(204); //successful - no content to send back
      return;
    }
    const refreshToken = cookies.jwt;

    //check if the refreshToken is in the DB 
    const foundUser = usersDB.users.find(person => person.refreshToken === refreshToken);
    //if no user, but a kookie, delete the kookie - is possible to have no user but a cookie if a user was deleted from the database but their cookie still exists in their browser
    if(!foundUser){
        res.clearCookie("jwt", {httpOnly: true, sameSite:"none", secure: true});
        res.sendStatus(203); //successful but no content to send back
        return;
    }

    //if we reached this point it means we found the user with the accessToken from the cookie
    //Delete the refreshToken from the DB
    const otherUsers = usersDB.users.filter(person => person.refreshToken !== foundUser.refreshToken);
    const currentUser = {...foundUser, refreshToken: ''};
    usersDB.setUsers([...otherUsers, currentUser])
    await fsPromises.writeFile(path.join(__dirname, '..', "model", "users.json"), JSON.stringify(usersDB.users));

    res.clearCookie("jwt", {httpOnly: true, sameSite:"none", secure: true});
    res.sendStatus(204);
}

export default {handleLogout}


/*
The frontend application:
Receive this JSON response
Extract the access token value
Store it (typically in state)
Use it for future API requests by adding it to the Authorization header
*/