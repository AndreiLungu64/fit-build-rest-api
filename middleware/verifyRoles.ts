import { NextFunction, Request, Response } from 'express';

const verifyRoles = (...allowedRoles) => {
  return (req: Request, res: Response, next: NextFunction) => {

    if(!req?.roles)
  };
};
