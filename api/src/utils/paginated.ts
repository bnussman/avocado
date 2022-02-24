import { ArgsType, ClassType, Field, Int, ObjectType } from 'type-graphql';
import { Max, Min } from 'class-validator';

export function Paginated<T>(TItemClass: ClassType<T>) {
  @ObjectType({ isAbstract: true })
  abstract class PaginatedResponseClass {
    @Field(() => [TItemClass])
    data!: T[];

    @Field(() => Int)
    count!: number;
  }
  return PaginatedResponseClass;
}


@ArgsType()
export class PaginationArgs {

  @Field(type => Int, { nullable: true })
  @Min(0)
  offset?: number;

  @Field(type => Int, { nullable: true })
  @Min(1)
  @Max(50)
  limit: number = 25;

  @Field(type => String, { nullable: true })
  query?: string;
}
