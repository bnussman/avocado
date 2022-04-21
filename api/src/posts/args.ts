import { MinLength } from "class-validator";
import { GraphQLUpload, Upload } from "graphql-upload";
import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class PostArgs {
  @Field()
  @MinLength(3)
  body!: string;

  @Field(() => [GraphQLUpload], { nullable: true })
  pictures?: Upload[];
}