import { Arg, Args, Authorized, Ctx, Mutation, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "../utils/context";
import { Token } from "../entities/Token";
import { Paginated, PaginationArgs } from "../utils/paginated";

@ObjectType()
export class TokensResponse extends Paginated(Token) {}

@Resolver(Token)
export class TokenResolver {

  @Query(() => TokensResponse)
  @Authorized()
  public async getTokens(@Ctx() ctx: Context, @Args() { offset, limit }: PaginationArgs): Promise<TokensResponse> {
    const [tokens, count] = await ctx.em.findAndCount(Token, { user: ctx.user.id }, { limit, offset });

    return {
      data: tokens,
      count: count
    };
  }  

  @Mutation(() => Boolean)
  @Authorized()
  public async deleteToken(@Ctx() ctx: Context, @Arg('id') id: string) {
    const token = ctx.em.getReference(Token, id);

    await ctx.em.removeAndFlush(token);

    return true;
  }
}