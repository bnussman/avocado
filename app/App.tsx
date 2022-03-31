import 'react-native-gesture-handler';
import React from 'react';
import { NativeBaseProvider, useColorMode, extendTheme } from 'native-base';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ApolloProvider, useQuery } from '@apollo/client';
import { GetUserQuery } from './generated/graphql';
import { client } from './utils/apollo';
import { Login } from './routes/Login';
import { SignUp } from './routes/SignUp';
import { User } from './utils/userUser';
import { StatusBar } from 'expo-status-bar';
import { colors } from './utils/constants';
import { Drawer as MyDrawer } from './components/Drawer';
import { Feed } from './routes/feed';
import { NewPost } from './routes/feed/NewPost';
import { createStackNavigator } from '@react-navigation/stack';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

const theme = extendTheme({ colors });

function DrawerNavigator() {
  const { data } = useQuery<GetUserQuery>(User, { errorPolicy: 'ignore' });

  return (
    <Drawer.Navigator
      useLegacyImplementation
      drawerContent={(props) => <MyDrawer {...props} />}
    >
      <Drawer.Screen name="Feed" component={Feed} />
      {!data?.getUser && (
        <>
          <Drawer.Screen name="Login" component={Login} />
          <Drawer.Screen name="Sign Up" component={SignUp} />
        </>
      )}
    </Drawer.Navigator>
  );
}

function Navigation() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={DrawerNavigator} />
      <Stack.Screen options={{ presentation: "modal" }} name="New Post" component={NewPost} />
    </Stack.Navigator>
  );
}

function Avocado() {
  const { colorMode } = useColorMode();

  return (
    <ApolloProvider client={client}>
      <StatusBar style={colorMode === "dark" ? "light" : "dark"} />
      <NavigationContainer theme={colorMode === "dark" ? DarkTheme : DefaultTheme} >
        <Navigation />
      </NavigationContainer>
    </ApolloProvider>
  );
}

export default function App() {
  return (
    <NativeBaseProvider theme={theme}>
      <Avocado />
    </NativeBaseProvider>
  );
}
