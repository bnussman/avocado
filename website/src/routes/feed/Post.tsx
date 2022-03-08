import { Text, Avatar, Box, HStack, Stack } from '@chakra-ui/react';
import { GetPostsQuery } from '../../generated/graphql';
import { Unpacked } from '../../utils/types';

export function Post({ body, user }: Unpacked<GetPostsQuery['getPosts']['data']>) {
  return (
    <Box borderWidth='1px' borderRadius='lg' p={8}>
      <Stack spacing={4}>
        <HStack>
          <Avatar />
          <Box>
            <Text fontWeight="extrabold">{user.name}</Text>
            <Text fontSize="sm">@{user.username}</Text>
          </Box>
          {/* <Spacer />
          <Button colorScheme="red">Delete</Button> */}
        </HStack>
        <Box>
          {body}
        </Box>
      </Stack>
    </Box>
  );
}