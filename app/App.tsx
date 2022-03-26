import 'react-native-gesture-handler';
import React from 'react';
import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { ApolloProvider, gql, useMutation, useQuery } from '@apollo/client';
import { client } from './utils/apollo';
import { Avatar, Text, Box, Flex, NativeBaseProvider, useColorMode, VStack, Switch, Pressable, HStack, Spinner, Icon, Divider, extendTheme } from 'native-base';
import { Feed } from './routes/feed';
import { Login } from './routes/Login';
import { SignUp } from './routes/SignUp';
import { createDrawerNavigator, DrawerContentComponentProps, DrawerContentScrollView } from '@react-navigation/drawer';
import { User, useUser } from './utils/userUser';
import { StatusBar } from 'expo-status-bar';
import { GetUserQuery, LogoutMutation } from './generated/graphql';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Drawer = createDrawerNavigator();

const colors = {
  primary: {
    100: "#FCE8F8",
    200: "#FAD1F6",
    300: "#F1B6F0",
    400: "#E19EE4",
    500: "#C87DD3",
    600: "#A25BB5",
    700: "#7E3E97",
    800: "#5C277A",
    900: "#421765",
  },
};

const theme = extendTheme({
  colors,
  config: {
    useSystemColorMode: true,
    initialColorMode: "dark",
  },
});

const Logout = gql`
  mutation Logout {
    logout
  }
`;

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();
  const [logout, { loading }] = useMutation<LogoutMutation>(Logout);

  const handleLogout = async () => {
    logout().finally(() => {
      AsyncStorage.clear();

      props.navigation.navigate("Feed");

      client.writeQuery({
        query: User,
        data: {
          getUser: null,
        },
      });

    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <VStack space={6} my={2} mx={2}>
        {user && (
          <Flex ml={2} direction="row" alignItems="center">
            <Avatar mr={4} />
            <Box>
              <Text bold>{user?.name}</Text>
              <Text fontSize={14} mt={1} fontWeight={500}>
                @{user?.username}
              </Text>
            </Box>
          </Flex>
        )}
        <VStack divider={<Divider />} space={4}>
          <VStack space={3}>
            {props.state.routeNames.map((name: string, index: number) => (
              <Pressable
                key={index}
                px={5}
                py={3}
                rounded="md"
                bg={
                  index === props.state.index
                    ? "rgba(214, 177, 228, 0.15)"
                    : "transparent"
                }
                onPress={() => {
                  props.navigation.navigate(name);
                }}
              >
                <Text fontWeight={500}>{name}</Text>
              </Pressable>
            ))}
            {user && (
              <Pressable onPress={handleLogout}>
                <HStack px={5} py={3} space={7} alignItems="center">
                  <Text mr={4} fontWeight={500}>
                    Logout
                  </Text>
                </HStack>
              </Pressable>
            )}
            <HStack space={4} px={5} py={3} alignItems="center">
              <Text>☀️</Text>
              <Switch
                isChecked={colorMode === "dark"}
                onToggle={toggleColorMode}
              />
              <Text>🌙</Text>
            </HStack>
          </VStack>
        </VStack>
      </VStack>
    </DrawerContentScrollView>
  );
}

function Navigation() {
  const { data } = useQuery<GetUserQuery>(User, { errorPolicy: 'ignore' });
  const { colorMode } = useColorMode();

  return (
    <Drawer.Navigator
      useLegacyImplementation
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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
