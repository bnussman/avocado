import { ApolloError } from "@apollo/client";
import { Text, Alert, AlertIcon, Box } from "@chakra-ui/react";

interface Props {
  error: ApolloError;
}

export function Error({ error }: Props) {
  return (
    <Alert status="error" mb={4}>
      <AlertIcon />
      <Box>
        {error.message}
      </Box>
    </Alert>
  );
}