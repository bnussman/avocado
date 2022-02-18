import { AuthChecker } from "type-graphql";
import { Context } from "./context";

export const authChecker: AuthChecker<Context> = ({ args, context }, roles) => {
  const { user } = context;

  return Boolean(user);
};
