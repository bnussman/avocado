import { ApolloProvider, gql, useQuery } from '@apollo/client';
import { Box, ChakraProvider, Container } from '@chakra-ui/react'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { Header } from './components/Header';
import { GetUserQuery } from './generated/graphql';
import { client } from './utils/apollo';

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

function Avocado() {
  const { data } = useQuery<GetUserQuery>(User);

  return (
    <Router>
      <Header />
      <Container maxW="container.xl">
        {data?.getUser && (<Box>Hello {data?.getUser.name}</Box>)}
      </Container>
    </Router>
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
