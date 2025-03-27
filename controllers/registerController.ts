import fsPromises from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import { Request, Response} from "express";
import bcrypt from "bcrypt";

import json from "../model/users.json" with { type: "json" };

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { User, UserDB } from "../types/globalTypes.js";

const usersDB: UserDB = {
  users: json,
  setUsers: function (data: User[]) {
    this.users = data;
  },
};

const handleNewUser = async (req: Request, res: Response) => {
  const { user, pwd } = req.body;
  if (!user || !pwd) {
    res.status(400).json({ message: "Username and password are required." });
    return;
  }

  //check for duplicate usernames in the db
  const duplicate = usersDB.users.find((person) => person.username === user);
  if(duplicate) {
    res.sendStatus(409); // conflict
    return;
  }

  try {
    //encrypt the password
    const hashedPassword = await bcrypt.hash(pwd, 10); //hash the password and add 10 rounds of salts

    const newUser: User = {
        username: user,
        roles: {"User" : 2001},
        password: hashedPassword,
    }
    
    usersDB.setUsers([...usersDB.users, newUser]);
    await fsPromises.writeFile(path.join(__dirname, "..", "model", "users.json"), JSON.stringify(usersDB.users));
    console.log(usersDB.users);
    res.status(201).json({"message" : `New user ${user} created!`});
  } catch (err) {
    if(err instanceof Error){
        res.status(500).json({"message" : err.message});
    }
  }
};

export default {handleNewUser};