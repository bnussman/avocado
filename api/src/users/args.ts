import { ArgsType, Field } from "type-graphql";
import { IsAlpha, IsEmail, MaxLength, MinLength } from "class-validator";

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
}

@ArgsType()
export class LoginArgs {
  @Field()
  username!: string;

  @Field()
  password!: string;
}