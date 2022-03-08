import { Arg, Args, Authorized, Ctx, Mutation, ObjectType, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from "type-graphql";
import { Context } from "../utils/context";
import { Post } from "../entities/Post";
import { PaginationArgs } from "../utils/paginated";
import { PostArgs } from "./args";
import { QueryOrder } from "@mikro-orm/core";

@Resolver(Post)
export class PostsResolver {

  @Query(() => [Post])
  @Authorized()
  public async getPosts(@Ctx() ctx: Context, @Args() { offset, limit }: PaginationArgs): Promise<Post[]> {
    return await ctx.em.find(Post, {}, {
      limit,
      offset,
      orderBy: { created: QueryOrder.DESC },
      populate: ['user']
    });
  }  

  @Mutation(() => Boolean)
  @Authorized()
  public async deletePost(@Ctx() ctx: Context, @Arg('id') id: string) {
    const token = ctx.em.getReference(Post, id);

    await ctx.em.removeAndFlush(token);

    return true;
  }

  @Mutation(() => Post)
  @Authorized()
  public async createPost(@Ctx() { user, em }: Context, @PubSub() pubSub: PubSubEngine, @Args() args: PostArgs) {
    const post = new Post({
      ...args,
      user,
    });

    await em.persistAndFlush(post);

    pubSub.publish("post", post);

    return post;
  }

  @Subscription(() => Post, { topics: "post" })
  @Authorized('No Verification')
  public newPost(@Root() post: Post): Post {
    return post;
  }
}