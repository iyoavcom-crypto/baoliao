import type { Request, Response } from "express";
import type { API } from "./api";
import type { AnyModelStatic } from "@/models";

export interface RequestContext {
  req: Request;
  res: Response;
  api: API;
  model: AnyModelStatic | null;
}

export const toContext = (req: Request, res: Response, api: API, model: AnyModelStatic | null): RequestContext => ({
  req,
  res,
  api,
  model,
});