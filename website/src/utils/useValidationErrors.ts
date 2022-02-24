import { ApolloError } from "@apollo/client";

export function useValidationErrors<T>(error: ApolloError | undefined) {
  if (error === undefined) {
    return undefined;
  }

  try {
    return JSON.parse(error.message) as { [k in keyof T]: string[] };
  } catch (e) {
    return undefined;
  }
}