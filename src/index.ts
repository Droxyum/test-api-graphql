import { ApolloServer } from "apollo-server-express";
import express from "express";
import { execute, subscribe } from "graphql";
import { PubSub } from "graphql-subscriptions";
import http from "http";
import { SubscriptionServer } from "subscriptions-transport-ws";
import { schema } from "./controllers";
import { jwtHelper } from "./helpers/auth.helper";
import { GraphqlContext } from "./models";

const PORT = 4000;
const PATH = "/graphql";

const pubsub = new PubSub();

(async () => {
    const app = express();
    const httpServer = http.createServer(app);

    const subscriptionServer = SubscriptionServer.create(
        {
            schema,
            execute,
            subscribe,
            onConnect: (connectionParams): GraphqlContext => {
                const header =
                    (connectionParams?.Authorization as string) ||
                    (connectionParams?.authorization as string) ||
                    "";

                if (header?.length) {
                    const context = jwtHelper.decode(header);
                    return { context: context || null, pubsub };
                }

                return { context: null, pubsub };
            },
        },
        { server: httpServer, path: PATH },
    );

    const apolloServer = new ApolloServer({
        schema,
        context: ({ req }): GraphqlContext => {
            const header =
                (req?.headers?.authorization as string) ||
                (req?.headers?.Authorization as string) ||
                "";

            if (header?.length) {
                const context = jwtHelper.decode(header);
                return { context: context || null, pubsub };
            }

            return { context: null, pubsub };
        },
        plugins: [
            {
                async serverWillStart() {
                    return {
                        async drainServer() {
                            subscriptionServer.close();
                        },
                    };
                },
            },
        ],
        introspection: true,
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app, path: PATH });

    httpServer.listen(PORT, () => {
        console.log(
            `-> Http server started at: http://localhost:${PORT}${apolloServer.graphqlPath}`,
        );
        console.log(
            `-> Subscription server started at: ws://localhost:${PORT}${apolloServer.graphqlPath}`,
        );
    });
})();
