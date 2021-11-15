import { PubSub } from "graphql-subscriptions";

export interface Context {
    accountId: number;
}

export interface GraphqlContext {
    context: Context;
    pubsub: PubSub;
}
