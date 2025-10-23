import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@ObjectType()
export class RelatedEntity {
  @Field()
  type: string;

  @Field()
  id: string;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class ActivityItem {
  @Field(() => ID)
  id: string;

  @Field()
  type: string;

  @Field()
  action: string;

  @Field()
  description: string;

  @Field(() => Date)
  timestamp: Date;

  @Field(() => GraphQLJSON, { nullable: true })
  metadata?: any;

  @Field(() => RelatedEntity, { nullable: true })
  relatedEntity?: RelatedEntity;
}

@ObjectType()
export class ActivityFeedResponse {
  @Field(() => [ActivityItem])
  items: ActivityItem[];

  @Field(() => Int)
  total: number;
}

@ObjectType()
export class Agent {
  @Field(() => ID)
  uuid: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class Conversation {
  @Field(() => ID)
  uuid: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Agent)
  agent: Agent;

  @Field(() => Int)
  messageCount: number;
}

@ObjectType()
export class CollectionDefinition {
  @Field(() => ID)
  uuid: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  slug?: string;
}

@ObjectType()
export class CollectionActivity {
  @Field(() => ID)
  uuid: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => CollectionDefinition)
  collectionDefinition: CollectionDefinition;
}
