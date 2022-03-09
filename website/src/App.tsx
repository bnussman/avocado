import { ApolloProvider, gql, useQuery } from '@apollo/client';
import { ChakraProvider, Container } from '@chakra-ui/react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Header } from './components/Header';
import { GetUserQuery } from './generated/graphql';
import { Feed } from './routes/feed';
import { Home } from './routes/home';
import { Sessions } from './routes/sessions';
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
  const { loading } = useQuery<GetUserQuery>(User);


  if (loading) {
    return null;
  }

  return (
    <BrowserRouter>
      <Header />
      <Container maxW="container.lg">
        <Routes>
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/" element={<Feed />} />
        </Routes>
      </Container>
    </BrowserRouter>
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

export default App;