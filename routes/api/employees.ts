import path from "path";
import { fileURLToPath } from "url";
import {employeesController} from "../../controllers/employeesController.js"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import json from "../../model/employees.json" with { type: "json" };
const data: { employees: typeof json } = { employees: json };

import express from "express";
const router = express.Router();

//chain after route() the http methods we want to provide for the same route
router.route("/")
    .get(employeesController.createNewEmployee)
    .post(employeesController.createNewEmployee)
    .put(employeesController.updateEmployee)
    .delete(employeesController.deleteEmployee);

router.route("/:id")
.get(employeesController.getEmployee) 

export default router;
