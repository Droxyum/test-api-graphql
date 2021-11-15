import { gql } from "apollo-server-express";
import { withFilter } from "graphql-subscriptions";
import { GraphqlContext } from "../models";
import {
    ChatEvent,
    MutationCreateChatEventArgs,
    SubscriptionSubscribeChatArgs,
} from "../models/generated/sdl";

export const chatTypeDefinition = gql`
    extend type Mutation {
        createChatEvent(id: String!, content: String!): ChatEvent!
    }

    extend type Subscription {
        subscribeChat(id: String!): ChatEvent
    }

    type ChatEvent {
        id: String!
        content: String!
    }
`;

export const chatMutationResolver = {
    createChatEvent(_, args: MutationCreateChatEventArgs, { pubsub }: GraphqlContext): ChatEvent {
        const event: ChatEvent = {
            id: args?.id,
            content: args?.content,
        };
        pubsub.publish("CHAT_EVENT_CREATED", { subscribeChat: event });
        return event;
    },
};

export const chatSubscriptionResolver = {
    subscribeChat: {
        subscribe: withFilter(
            (_, __, { pubsub }: GraphqlContext) => pubsub.asyncIterator("CHAT_EVENT_CREATED"),
            (payload, variables) => variables?.id === payload?.subscribeChat?.id,
        ),
    },
};
