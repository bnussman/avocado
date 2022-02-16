import { Configuration, Connection, IDatabaseDriver, LoadStrategy } from "@mikro-orm/core";

export default {
  entities: ['./build/entities/*.js'],
  entitiesTs: ['./src/entities/*.ts'],
  user: 'root',
  password: 'avocado',
  type: 'mysql',
  clientUrl: `mysql://root@db:3306/avocado`,
  loadStrategy: LoadStrategy.JOINED,
  debug: true,
} as unknown as Configuration<IDatabaseDriver<Connection>>