import { Connection, EntityManager, IDatabaseDriver } from "@mikro-orm/core";
import { Token } from "../entities/Token";
import { User } from "../entities/User";

export interface Context {
  em: EntityManager<IDatabaseDriver<Connection>>;
  user: User;
  token: Token;
}