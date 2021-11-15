import { ApolloError } from "apollo-server-errors";

export namespace GraphqlErrors {
    export const BadCredential: [string, string] = ["Bad credentials", "AUTH_BAD_CREDENTIALS"];
    export const AccountEmailAlreadyExist: [string, string] = [
        "Account email already exist",
        "ACCOUNT_ALREADY_EXIST",
    ];
    export const AccountUsernameAlreadyExist: [string, string] = [
        "Account username already exist",
        "ACCOUNT_ALREADY_EXIST",
    ];
}

export class GraphqlError extends ApolloError {
    constructor(message: string, code: string) {
        super(message, code);
    }
}
