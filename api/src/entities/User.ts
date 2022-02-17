import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";

@ObjectType()
@Entity()
export class User {

  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property()
  username!: string;

  @Field()
  @Property()
  email!: string;

  @Field()
  @Property()
  first!: string;

  @Field()
  @Property()
  last!: string;
}
