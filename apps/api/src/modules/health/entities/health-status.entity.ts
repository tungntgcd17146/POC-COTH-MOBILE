import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class HealthStatus {
  @Field()
  status: string;

  @Field()
  database: string;

  @Field(() => Date)
  timestamp: Date;
}
