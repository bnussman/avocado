import { ApolloProvider, gql, useQuery } from '@apollo/client';
import { Box, Button, ChakraProvider, useDisclosure } from '@chakra-ui/react'
import { LoginModal } from './components/LoginModal';
import { GetUserQuery } from './generated/graphql';
import { client } from './utils/apollo';

const User = gql`
  query GetUser {
    getUser {
      id
      first
      last
      username
    }
  }
`;

function Avocado() {
  const { data, loading, error } = useQuery<GetUserQuery>(User);
  const { isOpen: isLoginOpen, onClose: onLoginClose, onOpen: onLoginOpen } = useDisclosure();

  return (
    <Box>
      <Button onClick={onLoginOpen}>Login</Button>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
    </Box>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <ChakraProvider>
        <Avocado />
      </ChakraProvider>
    </ApolloProvider>
  );
}

export default App
