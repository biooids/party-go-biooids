// src/middleware/validate.ts

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

/**
 * A middleware that validates the request against a provided Zod schema.
 * @param schema The Zod schema to validate against.
 */
export const validate =
  (schema: z.ZodType) =>
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
      files: req.files,
    });
    next();
  };
