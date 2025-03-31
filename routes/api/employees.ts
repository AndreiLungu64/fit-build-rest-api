import {employeesController} from "../../controllers/employeesController.js"
import { ROLES_LIST } from "../../config/rolesList.js";
import verifyRoles from "../../middleware/verifyRoles.js";
// import verifyJWT from "../../middleware/verifyJWT.js";

import json from "../../model/employees.json" with { type: "json" };
const data: { employees: typeof json } = { employees: json };

import express from "express";
const router = express.Router();

/*
Note:
chain after route() the http methods we want to provide for the same route
.get(verifyJWT, employeesController.getAllEmployees) //using the verifyJWT middleware for a specific route, 
// first the request goes throught the middleware, then to the employeesController*/

router.route("/")
    .get(employeesController.getAllEmployees)//everyone can access the get route, its required with JWT, no role required
    .post(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), employeesController.createNewEmployee)//pass the roles (code) allowed on this route
    .put(verifyRoles(ROLES_LIST.Admin, ROLES_LIST.Editor), employeesController.updateEmployee)
    .delete(verifyRoles(ROLES_LIST.Admin), employeesController.deleteEmployee);//only an adimin can use the delete route

router.route("/:id")
.get(employeesController.getEmployee) 

export default router;
