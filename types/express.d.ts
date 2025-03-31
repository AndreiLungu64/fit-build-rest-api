import type { JwtPayload } from 'jsonwebtoken';

// the recommended pattern in TypeScript is to modify the global Express namespace like below instead of the interface
declare global {
  namespace Express {
    interface Request {
      user?: string | JwtPayload;
      roles?: number[] | JwtPayload;
    }
  }
}

// Alternative:
// redeffine the Request parameter to contain the user property (which it doesn't by default), use it everywhere instead of Request
interface RequestWithUserAndRoles extends Request {
  user?: string | JwtPayload;
  roles?: string | JwtPayload;
}
