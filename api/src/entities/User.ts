import { Cascade, Collection, Entity, OneToMany, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, ObjectType } from "type-graphql";
import { v4 } from "uuid";
import { Token } from "./Token";

@ObjectType()
@Entity()
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
}
