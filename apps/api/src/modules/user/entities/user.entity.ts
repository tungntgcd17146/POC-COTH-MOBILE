import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class User {
  @Field(() => ID)
  uuid: string;

  @Field()
  email: string;

  @Field()
  username: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field(() => [String])
  roles: string[];

  @Field({ nullable: true })
  status?: string;

  @Field({ nullable: true })
  phone?: string;

  @Field()
  completedWelcome: boolean;

  @Field()
  completedAdditionalInformation: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  lastLoginTime?: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}
