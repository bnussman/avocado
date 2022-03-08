import { MinLength } from "class-validator";
import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class PostArgs {
  @Field()
  @MinLength(3)
  body!: string;
}