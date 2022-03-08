import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { User } from "./User";

@ObjectType()
@Entity()
export class Post {
  constructor(values: Partial<Post>) {
    Object.assign(this, values);
  }

  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property()
  body!: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'cascade' })
  user!: User;

  @Field()
  @Property()
  created: Date = new Date();
}
