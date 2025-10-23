import { ObjectType, Field, ID, Float, Int } from '@nestjs/graphql';

@ObjectType()
export class QuotaDefinition {
  @Field(() => ID)
  uuid: string;

  @Field()
  name: string;

  @Field({ nullable: true })
  description?: string;
}

@ObjectType()
export class UserQuota {
  @Field(() => ID)
  uuid: string;

  @Field(() => QuotaDefinition)
  quotaDefinition: QuotaDefinition;

  @Field(() => Int)
  currentUsage: number;

  @Field(() => Int)
  limit: number;

  @Field(() => Date, { nullable: true })
  resetDate?: Date;

  @Field()
  isUnlimited: boolean;

  @Field(() => Int, { nullable: true })
  remainingQuota?: number;

  @Field(() => Float)
  usagePercentage: number;
}

@ObjectType()
export class QuotaUsage {
  @Field(() => ID)
  uuid: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Int)
  usage: number;
}

@ObjectType()
export class QuotaInfo {
  @Field(() => [UserQuota])
  quotas: UserQuota[];

  @Field(() => Int)
  totalUsage: number;

  @Field(() => [QuotaUsage])
  recentUsage: QuotaUsage[];
}

@ObjectType()
export class QuotaEvent {
  @Field(() => ID)
  uuid: string;

  @Field(() => Date)
  createdAt: Date;

  @Field()
  eventType: string;

  @Field(() => Int)
  amount: number;

  @Field(() => QuotaDefinition)
  quotaDefinition: QuotaDefinition;
}
