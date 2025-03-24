import { CorsOptions } from "cors";

const whitelist = ["https://yoursite.com", "http:127.0.0.1: 5500", "http://localhost:3500"]; //in production put here only your frontent url
//origin is the name of the property cors expects, the parameter "origin" is the domain from where the request came
const corsOptions: CorsOptions = {
  origin: (origin: string | undefined, callback: (error: Error | null, success?: boolean) => void) => {
    //null means no error - the first parameter is for errors, true means "allow this domain"
    if ((origin && whitelist.indexOf(origin) !== -1) || !origin) callback(null, true); //in production use: if (origin && whitelist.indexOf(origin) !== -1) callback(null, true);
    else callback(new Error("Not allowed by CORS!"));
  },
  optionsSuccessStatus: 200, // success status
};

export { corsOptions };
