import { NextFunction, Request, Response } from 'express';

//accept the roles codes we want to pass in
// this outer function allowes us to pass in the middleware func the allowed roles
const verifyRoles = (...allowedRoles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req?.roles) {
      res.sendStatus(401); //unauthorised
      return;
    }

    const rolesArray = [...allowedRoles];
    // console.log('Allowed roles: ', rolesArray); //roles passed by me in the middleware when i apply it to a specific route
    // console.log('Your roles: ', req.roles); // roles of the user, extracted from JWT and made avalable on req in vreifyJWT middleware

    /*this logic checks if the user has at least one of the allowed roles (the ones you passed in the verifyRoles when you set this middleware for a specific route), which is a common authorization pattern. if req.roles = [2000] //only user, and allowRoles = [5000] // only admin  this will result in false and the request would not pass further
     */
    const result = req.roles
      ?.map((role: number) => rolesArray.includes(role))
      .find((val: boolean) => val === true);

    if (!result) {
      res.sendStatus(401); //unauthorised
      //   console.log('You dont have the necessary role to perform this action!');
      return;
    }

    next();
  };
};

export default verifyRoles;
