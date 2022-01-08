import { SESSION_KEY } from "@constants";
import { Context } from "@types";

import type { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<Context> = ({ context }, next) => {
  if (!context.request.session.get(SESSION_KEY)) {
    throw new Error("not authenticated");
  }

  return next();
};
