import { makeExecutableSchema } from "@graphql-tools/schema";
import { gql } from "apollo-server-core";
import { print } from "graphql";
import { writeFileSync } from "fs";
import {
    accountMutationResolver,
    accountQueryResolver,
    accountTypeDefinition,
    accountTypeResolver,
} from "./account.controller";
import { authDirectiveDefinition, authDirectiveTransformer } from "./_directives/auth.directive";
import { videoTypeDefinition } from "./video.controller";
import {
    chatMutationResolver,
    chatSubscriptionResolver,
    chatTypeDefinition,
} from "./chat.controller";

const rootTypeDef = gql`
    scalar DateTime

    type Query {
        _: Boolean
    }

    type Mutation {
        _: Boolean
    }

    type Subscription {
        _: Boolean
    }
`;

const resolvers = {
    Query: {
        ...accountQueryResolver,
    },
    Mutation: {
        ...accountMutationResolver,
        ...chatMutationResolver,
    },
    Subscription: {
        ...chatSubscriptionResolver,
    },
    ...accountTypeResolver,
};

const typeDefs = [
    rootTypeDef,
    authDirectiveDefinition,
    accountTypeDefinition,
    videoTypeDefinition,
    chatTypeDefinition,
];
const schemaFile = (typeDefs || []).reduce((acc, tag) => (acc += print(tag)), "");
writeFileSync(__dirname + "/../../../src/schema.graphql", schemaFile);

const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

export const schema = authDirectiveTransformer(executableSchema, "auth");
