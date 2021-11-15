import { gql } from "apollo-server-core";
import { db } from "../db";
import { GraphqlContext } from "../models";
import {
    Account,
    AccountVideosArgs,
    AuthenticateResponse,
    MutationAuthenticateArgs,
    MutationRegisterArgs,
} from "../models/generated/sdl";
import { authenticateService } from "../services/authenticate.service";

export const accountTypeDefinition = gql`
    extend type Mutation {
        authenticate(username: String!, password: String!): AuthenticateResponse!
        register(email: String!, username: String!, password: String!): Account!
    }

    extend type Query {
        me: Account! @auth
    }

    type Account {
        id: Int!
        username: String!
        email: String!
        videos(take: Int, orderBy: VideoOrderBy): [Video!]
        createdAt: DateTime!
    }

    type AuthenticateResponse {
        token: String!
        me: Account!
    }
`;

export const accountTypeResolver = {
    Account: {
        videos(_, args: AccountVideosArgs, { context }: GraphqlContext) {
            return db.account.findFirst({ where: { id: context?.accountId } }).videos(args);
        },
    },
};

export const accountQueryResolver = {
    me(_, __, { context }: GraphqlContext) {
        return db.account.findFirst({
            where: {
                id: context?.accountId,
            },
        });
    },
};

export const accountMutationResolver = {
    async authenticate(_, args: MutationAuthenticateArgs): Promise<AuthenticateResponse> {
        const login = await authenticateService.login(args?.username, args?.password);
        return {
            me: login?.account,
            token: login?.token,
        };
    },
    async register(_, args: MutationRegisterArgs): Promise<Account> {
        const account = await authenticateService.register({
            username: args?.username,
            email: args?.email,
            password: args?.password,
        });
        return account;
    },
};
