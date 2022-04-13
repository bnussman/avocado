import { Configuration, Connection, IDatabaseDriver, LoadStrategy } from "@mikro-orm/core";
import { DB_CA, DB_PASSWORD, DB_URL, DB_USER, isProduction } from "./utils/constants";

export default {
  entities: ['./build/entities/*.js'],
  entitiesTs: ['./src/entities/*.ts'],
  type: 'mysql',
  user: DB_USER,
  password: DB_PASSWORD,
  clientUrl: DB_URL,
  // loadStrategy: LoadStrategy.JOINED,
  debug: !isProduction,
  driverOptions: DB_CA ? {
    connection: {
      ssl: {
        ca: DB_CA,
      }
    }
  } : undefined,
  // clientUrl: `mysql://root@db:3306/avocado`,
} as unknown as Configuration<IDatabaseDriver<Connection>>
