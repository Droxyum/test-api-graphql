import { gql } from "apollo-server-core";
import { mapSchema, getDirective, MapperKind } from "@graphql-tools/utils";
import { GraphqlError, GraphqlErrors } from "../../helpers/graphql-errors.helper";
import { GraphqlContext } from "../../models";
// import { defaultFieldResolver } from "graphql";

export const authDirectiveDefinition = gql`
    directive @auth on FIELD_DEFINITION
`;

export function authDirectiveTransformer(schema, directiveName) {
    return mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
            const directive = getDirective(schema, fieldConfig, directiveName)?.[0];
            if (directive) {
                const { resolve } = fieldConfig;
                fieldConfig.resolve = async (source, args, context: GraphqlContext, info) => {
                    if (!context?.context?.accountId) {
                        throw new GraphqlError(...GraphqlErrors.BadCredential);
                    }
                    return resolve(source, args, context, info);
                };

                return fieldConfig;
            }
            return undefined;
        },
    });
}
