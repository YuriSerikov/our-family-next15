//import { UserData } from "../user.ts"; 

// to make the file a module and avoid the TypeScript error
export { }
declare global {
  namespace Express {
    export interface Request {
      userData?: string | JwtPayload;
    }
  }
}