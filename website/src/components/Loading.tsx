import { Center, Spinner } from '@chakra-ui/react';

export function Loading() {
  return (
    <Center h="100px">
      <Spinner size="xl" />
    </Center>
  );
}