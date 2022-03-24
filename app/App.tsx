import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ApolloProvider, gql } from '@apollo/client';
import { client } from './utils/apollo';
import { NativeBaseProvider } from 'native-base';
import { Feed } from './routes/feed';
import { Login } from './routes/Login';
import { SignUp } from './routes/SignUp';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { useUser } from './utils/userUser';

const Drawer = createDrawerNavigator();

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
`

function Navigation() {
  const { user } = useUser();

  return (
    <Drawer.Navigator useLegacyImplementation>
      <Drawer.Screen name="Feed" component={Feed} />
      <Drawer.Screen name="Login" component={Login} />
      <Drawer.Screen name="Sign Up" component={SignUp} />
    </Drawer.Navigator>
  );
}

export default function App() {

  return (
    <NativeBaseProvider>
      <ApolloProvider client={client}>
        <NavigationContainer>
          <Navigation />
        </NavigationContainer>
      </ApolloProvider>
    </NativeBaseProvider>
  );
}
