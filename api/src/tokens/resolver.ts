import { Args, Authorized, Ctx, ObjectType, Query, Resolver } from "type-graphql";
import { Context } from "../utils/context";
import { Token } from "../entities/Token";
import { Paginated, PaginationArgs } from "../utils/paginated";

@ObjectType()
export class TokensResponse extends Paginated(Token) {}

@Resolver(Token)
export class TokenResolver {

  @Query(() => TokensResponse)
  @Authorized()
  public async getUsers(@Ctx() ctx: Context, @Args() { offset, limit }: PaginationArgs): Promise<TokensResponse> {
    const [tokens, count] = await ctx.em.findAndCount( Token, {}, { limit, offset });

    return {
      data: tokens,
      count: count
    };
  }
}