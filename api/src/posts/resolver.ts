import { Arg, Args, Authorized, Ctx, Field, Mutation, ObjectType, PubSub, PubSubEngine, Query, Resolver, Root, Subscription } from "type-graphql";
import { Context } from "../utils/context";
import { Post } from "../entities/Post";
import { Paginated, PaginationArgs } from "../utils/paginated";
import { PostArgs } from "./args";
import { PopulateHint, QueryOrder } from "@mikro-orm/core";
import { Like } from "../entities/Like";
import { User } from "../entities/User";
import { FileUpload } from "graphql-upload";
import { upload, uploadMany } from "../utils/s3";

@ObjectType()
class PostsResponse extends Post {
  @Field()
  liked!: boolean;
}

@ObjectType()
class LikeResponse {
  @Field()
  liker!: User;

  @Field()
  likes!: number;

  @Field()
  liked!: boolean;
}

@ObjectType()
export class PaginatedPostsResponse extends Paginated(PostsResponse) {}

@Resolver(Post)
export class PostsResolver {

  @Query(() => PaginatedPostsResponse)
  public async getPosts(@Ctx() ctx: Context, @Args() { offset, limit }: PaginationArgs): Promise<PaginatedPostsResponse> {
    const [posts, count] = await ctx.em.findAndCount(Post,
      {},
      {
        limit,
        offset,
        orderBy: { created: QueryOrder.DESC },
        populate: ['user', 'uploads', '_likes'],
      }
    );

    for (let i = 0; i < posts.length; i++ ) {
      console.log(i, posts[i].body);
    }

    const data = posts.map((post: Post) => ({
      ...post,
      liked: post._likes.getItems().some(like => like.user.id === ctx.user?.id)
    }))

    return { data, count };
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
      body: args.body,
      user,
    });

    const uploads = await (args.pictures as unknown as Promise<FileUpload>[]);

    if (uploads) {
      const files = await uploadMany(uploads, post, user);

      post.uploads.set(files);
    }

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
    let liked: boolean;

    try {
      await em.persistAndFlush(like);

      likes = Math.max(post.likes + 1, 0);

      post.likes = likes;

      liked = true;
    }
    catch (error) {
      await em.nativeDelete(Like, { user, post });

      likes = Math.max(post.likes - 1, 0);

      post.likes = likes;

      liked = false;
    }

    em.persistAndFlush(post);

    pubSub.publish(`likes-${id}`, {
      liker: user,
      likes,
      liked
    });

    return likes;
  }

  @Subscription(() => PostsResponse, { topics: "create-post" })
  public addPost(@Root() post: Post): PostsResponse {
    return { ...post, liked: false };
  }

  @Subscription(() => LikeResponse, {
    topics: ({ args }) => `likes-${args.id}`,
  })
  public likesPost(@Arg("id") id: string, @Root() data: LikeResponse): LikeResponse {
    return data;
  }

  @Subscription(() => String, { topics: "delete-post" })
  public removePost(@Root() id: string): string {
    return id;
  }
}