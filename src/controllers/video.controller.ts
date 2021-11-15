import { gql } from "apollo-server-core";

export const videoTypeDefinition = gql`
    type Video {
        id: Int!
        title: String!
        description: String
        createdAt: DateTime!
    }

    input VideoOrderBy {
        title: OrderBy
        createdAt: OrderBy
    }

    enum OrderBy {
        desc
        asc
    }
`;
