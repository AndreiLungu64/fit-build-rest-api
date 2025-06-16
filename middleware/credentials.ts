import { allowedOrigins } from '../config/allowedOrigins.js';
import { Request, Response, NextFunction } from 'express';

/*Together, these components (credentials middleware, corsOptions and adding {sameSite:"none", secure:true} to sending and deleting cookies)create a security system that lets your frontend website communicate with your API while blocking unauthorized websites from accessing it.*/

/*This middleware checks if the requesting website (origin) is allowed to interact with your API:
It gets the requesting website's address from req.headers.origin. 

If the origin is allowed, it sets the Access-Control-Allow-Credentials header to true, which permits the requesting website to send cookies to your API (or other credentials like HTTP authentication entries (username/password), Client SSL certificates)

Without this header set to true, even if a browser sends a request with credentials from another domain, those credentials would be ignored by the browser's security policy. This header essentially says "yes, I'm intentionally allowing this other website to send user credentials to me.*/

// function credentials(req: Request, res: Response, next: NextFunction) {
//   const origin = req.headers.origin;

//   console.log('Incoming origin:', origin);
//   console.log('Allowed origins:', allowedOrigins);

//   // no origin or not in allowed list
//   if (!origin || !allowedOrigins.includes(origin)) {
//     res.status(403).json({ message: 'Not allowed by CORS' });
//     console.log('Credentials middleware didnt allowed this request');
//     return;
//   }

//   // origin is allowed
//   res.header('Access-Control-Allow-Credentials', 'true');
//   next();
// }

// export { credentials };

function credentials(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin;

  console.log('Incoming origin:', origin);
  console.log('Allowed origins:', allowedOrigins);

  // If there is an origin and it's not in the allowed list, reject
  if (origin && !allowedOrigins.includes(origin)) {
    res.status(403).json({ message: 'Not allowed by CORS' });
    console.log('Credentials middleware didnt allowed this request');
    return;
  }

  // Origin is allowed or there's no origin (same origin request)
  if (origin) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
}
export { credentials };
