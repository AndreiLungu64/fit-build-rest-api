import path from "path";
import { fileURLToPath } from "url";
import { Request, Response} from "express";
import bcrypt from "bcrypt";

import json from "../model/users.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface User {
  username: string;
  password: string;
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
    const match = await bcrypt.compare(pwd, foundUser.password);
    if(match) {
        //create JWTs
        res.json({"message" : `User ${user} is logged in!`});
    }
    else{
        res.sendStatus(401);//unauthorised
    }
}

export default {handleLogin}