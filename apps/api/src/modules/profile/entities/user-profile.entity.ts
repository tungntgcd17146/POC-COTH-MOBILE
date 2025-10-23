import { ObjectType, Field, ID } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class Company {
  @Field(() => ID)
  uuid: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  logo?: string;
}

@ObjectType()
export class Country {
  @Field()
  code: string;

  @Field()
  name: string;
}

@ObjectType()
export class Address {
  @Field({ nullable: true })
  street1?: string;

  @Field({ nullable: true })
  street2?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  state?: string;

  @Field({ nullable: true })
  zip?: string;

  @Field(() => Country, { nullable: true })
  country?: Country;
}

@ObjectType()
export class UserProfile {
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

  @Field({ nullable: true })
  phone?: string;

  @Field({ nullable: true })
  status?: string;

  @Field(() => [String])
  roles: string[];

  @Field()
  completedWelcome: boolean;

  @Field()
  completedAdditionalInformation: boolean;

  @Field(() => Company, { nullable: true })
  company?: Company;

  @Field(() => Address, { nullable: true })
  address?: Address;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;
}
