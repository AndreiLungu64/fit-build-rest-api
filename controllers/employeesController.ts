import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

import json from "../model/employees.json" with { type: "json" };
const data: { employees: typeof json } = { employees: json };

const getAllEmployees = (req: Request, res: Response) => {
  res.json(data.employees);
};

const getEmployee = (req: Request, res: Response) => {
    res.json({"id" : req.params.id});
}

const createNewEmployee = (req: Request, res: Response)  => {
    res.json({
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
    })
}

const updateEmployee = (req: Request, res: Response) => {
    res.json({
        "firstname": req.body.firstname,
        "lastname": req.body.lastname,
    })
}

const deleteEmployee = (req: Request, res: Response)=> {
    res.json({"id" : req.body.id});
}

const employeesController = {getAllEmployees, getEmployee, createNewEmployee, updateEmployee, deleteEmployee}

export {employeesController};