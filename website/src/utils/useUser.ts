import { useQuery } from "@apollo/client";
import { User } from "../App";
import { GetUserQuery } from "../generated/graphql";

export function useUser() {
  const { data, ...rest } = useQuery<GetUserQuery>(User, { fetchPolicy: 'cache-only' });

  return { user: data?.getUser, rest };
}