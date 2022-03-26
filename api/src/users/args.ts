import { ArgsType, Field } from "type-graphql";
import { IsAlpha, IsEmail, MinLength } from "class-validator";
import { GraphQLUpload, Upload } from "graphql-upload";

@ArgsType()
export class SignUpArgs {
  @Field()
  @IsAlpha()
  first!: string;

  @Field()
  @IsAlpha()
  last!: string;

  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsAlpha()
  username!: string;

  @Field()
  @MinLength(5)
  password!: string;

  @Field(() => GraphQLUpload)
  picture!: Upload;
}

@ArgsType()
export class LoginArgs {
  @Field()
  username!: string;

  @Field()
  password!: string;
}
