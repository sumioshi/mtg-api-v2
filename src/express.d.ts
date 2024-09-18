import { IUser } from './schema/user.schema';
import { Cache } from 'cache-manager';  
declare module 'express-serve-static-core' {
  interface Request {
      user?: IUser;
      cache?: Cache;  
  }
}
