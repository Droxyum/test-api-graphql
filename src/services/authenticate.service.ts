import { db } from "../db";
import { GraphqlError, GraphqlErrors } from "../helpers/graphql-errors.helper";
import { jwtHelper, passwordHelper } from "../helpers/auth.helper";

export const authenticateService = {
    async login(username: string, password: string) {
        const account = await db.account.findFirst({
            where: {
                AND: [
                    {
                        OR: [{ email: username }, { username }],
                    },
                ],
            },
        });

        if (!passwordHelper.compare(password, account?.hash || "")) {
            throw new GraphqlError(...GraphqlErrors.BadCredential);
        }

        const token = jwtHelper.encode({ accountId: account.id });

        return {
            account,
            token,
        };
    },
    async register(data: { email: string; username: string; password: string }) {
        const [emailExist, usernameExist] = await Promise.all([
            db.account.count({ where: { email: data?.email } }),
            db.account.count({ where: { username: data?.username } }),
        ]);

        if (emailExist) {
            throw new GraphqlError(...GraphqlErrors.AccountEmailAlreadyExist);
        }

        if (usernameExist) {
            throw new GraphqlError(...GraphqlErrors.AccountUsernameAlreadyExist);
        }

        return db.account.create({
            data: {
                email: data?.email,
                username: data?.username,
                hash: passwordHelper.encode(data?.password),
            },
        });
    },
};
