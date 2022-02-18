import { Arg, Args, Authorized, Ctx, Field, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "../utils/context";
import { LoginArgs, SignUpArgs } from "./args";
import { hash, compare } from "bcrypt";
import { AuthenticationError } from "apollo-server-core";
import { Token } from "../entities/Token";
import { User } from "../entities/User";

@ObjectType()
class Auth {
  @Field()
  public user!: User;

  @Field()
  public token!: string;
}

@Resolver(User)
export class UserResolver {

  @Query(() => User)
  @Authorized()
  public async getUser(@Ctx() ctx: Context, @Arg('id', { nullable: true }) id?: string): Promise<User> {
    return id ? await ctx.em.findOneOrFail(User, id) : ctx.user;
  }


  @Mutation(() => Auth)
  public async signup(@Ctx() ctx: Context, @Args() args: SignUpArgs): Promise<Auth> {
    const user = new User(args);
    const token = new Token(user);

    user.password = await hash(args.password, 10);

    ctx.em.persistAndFlush([user, token]);

    return {
      user,
      token: token.id,
    };
  }

  @Mutation(() => Auth)
  public async login(@Ctx() ctx: Context, @Args() { username, password }: LoginArgs): Promise<Auth> {
    const user = await ctx.em.findOne(User, { $or: [ { username }, { email: username } ] });

    if (!user) {
      throw new AuthenticationError("User not found");
    }

    const token = new Token(user);

    const isPasswordCorrect = await compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new AuthenticationError("Password is incorrect");
    }

    ctx.em.persistAndFlush(token);

    return {
      user,
      token: token.id
    };
  }

  @Mutation(() => Boolean)
  @Authorized()
  public async logout(@Ctx() ctx: Context) {
    await ctx.em.removeAndFlush(ctx.token);

    return true;
  }
}
