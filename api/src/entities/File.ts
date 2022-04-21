import { Entity, ManyToOne, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
export class File {
  constructor(values: Partial<File>) {
    Object.assign(this, values);
  }

  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property()
  url!: string;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'cascade' })
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, { onDelete: 'cascade' })
  post!: Post;

  @Field()
  @Property()
  created: Date = new Date();
}
