import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import json from "../../data/employees.json" with { type: "json" };
const data: { employees: typeof json } = { employees: json };

import express from "express";
const router = express.Router();

//chain after route() the http methods we want to provide for the same route
router.route("/")
    .get((req, res) => {
        res.json(data.employees);
    })
    .post((req, res) => {
        res.json({
            "firstname": req.body.firstname,
            "lastname": req.body.lastname,
        })
    })
    .put((req,res) => {
        res.json({
            "firstname": req.body.firstname,
            "lastname": req.body.lastname,
        })
    })
    .delete((req, res) => {
        res.json({"id" : req.body.id});
    });

router.route("/:id")
.get((req, res) => {
    res.json({"id" : req.params.id});
}) 

export default router;
