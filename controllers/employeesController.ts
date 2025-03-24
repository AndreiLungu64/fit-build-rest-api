import { Request, Response, NextFunction, ErrorRequestHandler } from "express";

import json from "../model/employees.json" with { type: "json" };
import { rm } from "fs";
import { parse } from "path";
// const data: { employees: typeof json } = { employees: json };

const data = {
    employees: json,
    setEmployees: function(data: typeof json){
        this.employees = data;
    }
}

const getAllEmployees = (req: Request, res: Response) => {
  res.json(data.employees);
};

const createNewEmployee = (req: Request, res: Response)  => {
   const newEmployee = {
    id: data.employees[data.employees.length - 1].id + 1 || 1,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
   }

   if(!newEmployee.firstname || !newEmployee.lastname){ //if the data is incomplete return an error message
    res.status(400).json({"message" : "First and last name are required"});
    return;
   }

   data.setEmployees([...data.employees, newEmployee]);//update data in db (here in json file)
   res.status(201).json(data.employees); //send the response status 201 for record created, and send the updated data back
}

const updateEmployee = (req: Request, res: Response) => {
    const employee = data.employees.find(emp => emp.id === parseInt(req.body.id));
    if(!employee){
        res.status(400).json({"message" : `Employee ID ${req.body.id} not found`});
        return;
    }

    if(req.body.firstname) employee.firstname = req.body.firstname;
    if(req.body.lastname) employee.lastname = req.body.lastname;
    const filteredArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
    const unsortedArray = [...filteredArray, employee];
    // data.setEmployees(unsortedArray.sort((a, b) => a.id > b.id ? 1 : a.id < b.id ? -1 : 0 ));
    data.setEmployees(unsortedArray.sort((a, b) => a.id - b.id));
    res.status(200).json(data.employees);
}

const deleteEmployee = (req: Request, res: Response)=> {
    const employee = data.employees.find(emp => emp.id === parseInt(req.body.id));
    if(!employee){
        res.status(400).json({"message": `Employee ID ${req.body.id} not found`});
        return;
    }
    const filteredArray = data.employees.filter(emp => emp.id !== parseInt(req.body.id));
    data.setEmployees([...filteredArray]);
    res.json(data.employees);
}

const getEmployee = (req: Request, res: Response) => {
    const employee = data.employees.find(emp => emp.id === parseInt(req.params.id));
    if(!employee){
        res.status(400).json({"message":  `Employee ID ${req.params.id} not found`});
        return;
    }
    res.json(employee);
}

const employeesController = {getAllEmployees, getEmployee, createNewEmployee, updateEmployee, deleteEmployee}

export {employeesController};