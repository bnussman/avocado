import { ApolloError } from "@apollo/client";

export function useValidationErrors<T>(error: ApolloError | undefined) {
  if (error === undefined) {
    return undefined;
  }

  const errors = error?.graphQLErrors[0]?.extensions as { [k in keyof T]: string[] };

  return errors;
}
