import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property, Unique } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { Post } from "./Post";
import { Token } from "./Token";

@ObjectType()
@Entity()
@Unique({ properties: ['email', 'username'] })
export class User {

  constructor(values: Partial<User>) {
    Object.assign(this, values);
  }

  @Field()
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property()
  first!: string;

  @Field()
  @Property()
  last!: string;

  @Field()
  @Property()
  username!: string;

  @Field()
  @Property()
  email!: string;

  @Field()
  @Property()
  password!: string;

  @Field(() => String)
  @Property({ persist: false })
  name(): string {
    return `${this.first} ${this.last}`;
  }

  @Field(() => [Token])
  @OneToMany(() => Token, (b: Token) => b.user, { cascade: [Cascade.ALL] })
  tokens = new Collection<Token>(this);

  @Field(() => [Post])
  @OneToMany(() => Post, (b: Post) => b.user, { cascade: [Cascade.ALL] })
  posts = new Collection<Post>(this);
}
