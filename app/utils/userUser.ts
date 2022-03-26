import { gql, useQuery } from "@apollo/client";
import { GetUserQuery } from "../generated/graphql";

export const User = gql`
  query GetUser {
    getUser {
      id
      first
      last
      name
      username
      email
    }
  }
`;

export function useUser() {
  const { data, ...rest } = useQuery<GetUserQuery>(User, { fetchPolicy: 'cache-only' });

  return { user: data?.getUser, ...rest };
}
