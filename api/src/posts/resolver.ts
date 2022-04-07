import { Arg, Args, Authorized, Ctx, Mutation, ObjectType, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from "type-graphql";
import { Context } from "../utils/context";
import { Post } from "../entities/Post";
import { Paginated, PaginationArgs } from "../utils/paginated";
import { PostArgs } from "./args";
import { QueryOrder } from "@mikro-orm/core";
import { Like } from "../entities/Like";

@ObjectType()
export class PostsResponse extends Paginated(Post) {}

@Resolver(Post)
export class PostsResolver {

  @Query(() => PostsResponse)
  public async getPosts(@Ctx() ctx: Context, @Args() { offset, limit }: PaginationArgs): Promise<PostsResponse> {
    const [posts, count] = await ctx.em.findAndCount(Post, {}, {
      limit,
      offset,
      orderBy: { created: QueryOrder.DESC },
      populate: ['user']
    });

    return {
      data: posts,
      count: count
    };
  }  

  @Mutation(() => Boolean)
  @Authorized()
  public async deletePost(@Ctx() ctx: Context, @Arg('id') id: string, @PubSub() pubSub: PubSubEngine) {
    const token = ctx.em.getReference(Post, id);

    await ctx.em.removeAndFlush(token);

    pubSub.publish("delete-post", id);

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

    pubSub.publish("create-post", post);

    return post;
  }

  @Mutation(() => Number)
  @Authorized()
  public async toggleLike(@Ctx() { user, em }: Context, @PubSub() pubSub: PubSubEngine, @Arg('id') id: string) {
    const post = await em.findOneOrFail(Post, id);
    const like = new Like({ user, post });

    let likes;

    try {
      await em.persistAndFlush(like);

      likes = post.likes + 1;

      post.likes = likes;

    }
    catch (error) {
      // @TODOD check if we have a uniqueness error (if we do, we dislike)
      await em.nativeDelete(Like, { user, post });

      likes = post.likes - 1;

      post.likes = likes;

    }

    em.persistAndFlush(post);

    pubSub.publish(`likes-${id}`, likes);

    return likes;
  }

  @Subscription(() => Post, { topics: "create-post" })
  public addPost(@Root() post: Post): Post {
    return post;
  }

  @Subscription(() => Number, {
    topics: ({ args }) => `likes-${args.id}`,
  })
  public likesPost(@Arg("id") id: string, @Root() likes: number): number {
    return likes;
  }

  @Subscription(() => String, { topics: "delete-post" })
  public removePost(@Root() id: string): string {
    return id;
  }
}