import path from "path";
import { fileURLToPath } from "url";
import {employeesController} from "../../controllers/employeesController.js"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import verifyJWT from "../../middleware/verifyJWT.js";

import json from "../../model/employees.json" with { type: "json" };
const data: { employees: typeof json } = { employees: json };

import express from "express";
const router = express.Router();

//chain after route() the http methods we want to provide for the same route
router.route("/")
    // .get(verifyJWT, employeesController.getAllEmployees) //using the middleware for a specific route, first the request goes throught the middleware, then to the employeesController
    .get(verifyJWT, employeesController.getAllEmployees)
    .post(employeesController.createNewEmployee)
    .put(employeesController.updateEmployee)
    .delete(employeesController.deleteEmployee);

router.route("/:id")
.get(employeesController.getEmployee) 

export default router;
