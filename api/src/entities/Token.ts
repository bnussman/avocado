import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { User } from "./User";

@ObjectType()
@Entity()
export class Token {

  constructor(user: User) {
    this.user = user;
  }

  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property()
  created: Date = new Date();

  @Field()
  @Property({ onUpdate: () => new Date() })
  updated: Date = new Date();

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'cascade' })
  user!: User;
}
