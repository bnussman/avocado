import { Cascade, Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { Like } from "./Like";
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

  @Field()
  @Property()
  likes: number = 0;

  @Field(() => User)
  @ManyToOne(() => User, { onDelete: 'cascade' })
  user!: User;

  @Field(() => [Like])
  @OneToMany(() => Like, (b: Like) => b.post, { cascade: [Cascade.ALL] })
  _likes = new Collection<Like>(this);

  @Field()
  @Property()
  created: Date = new Date();
}
