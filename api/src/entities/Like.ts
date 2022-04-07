import { Entity, ManyToOne, PrimaryKey, Unique } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { Post } from "./Post";
import { User } from "./User";

@ObjectType()
@Entity()
@Unique({ properties: ['user', 'post'] })
export class Like {
  constructor(values: Omit<Like, 'id'>) {
    Object.assign(this, values);
  }

  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'cascade' })
  user!: User;

  @Field(() => Post)
  @ManyToOne(() => Post, { onDelete: 'cascade' })
  post!: Post;
}
