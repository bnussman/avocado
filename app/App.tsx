import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ApolloProvider, gql } from '@apollo/client';
import { client } from './utils/apollo';
import { Feed } from './routes/feed';
import { NativeBaseProvider } from 'native-base';

const Stack = createNativeStackNavigator();

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

export default function App() {
    return (
        <NativeBaseProvider>
            <ApolloProvider client={client}>
                <NavigationContainer>
                    <Stack.Navigator>
                        <Stack.Screen name="Feed" component={Feed} />
                    </Stack.Navigator>
                </NavigationContainer>
            </ApolloProvider>
        </NativeBaseProvider>
    );
}
