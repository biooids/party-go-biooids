// src/types/express.d.ts

import { SystemRole, SanitizedUser } from "./user.types";

export {};

declare global {
  namespace Express {
    interface Request {
      user?: SanitizedUser | null;
    }
  }
}
