import {User} from "../entities/User";
import {Mutation, Query, Resolver} from "type-graphql";

@Resolver(User)
export class UserResolver {

  @Query(() => Boolean)
  public async getUser(): Promise<boolean> {
    return true;
  }

  @Mutation(() => Boolean)
  public async deleteUser(): Promise<boolean> {
    return false;
  }
}
