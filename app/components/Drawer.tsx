import React from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { gql, useMutation } from "@apollo/client";
import { DrawerContentComponentProps, DrawerContentScrollView } from "@react-navigation/drawer";
import { Text, Avatar, Box, Flex, HStack, Pressable, Switch, useColorMode, VStack, Divider } from "native-base";
import { LogoutMutation } from "../generated/graphql";
import { client } from "../utils/apollo";
import { User, useUser } from "../utils/userUser";

const Logout = gql`
  mutation Logout {
    logout
  }
`;

export function Drawer(props: DrawerContentComponentProps) {
  const { user } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();
  const [logout] = useMutation<LogoutMutation>(Logout);

  const handleLogout = async () => {
    props.navigation.navigate("Feed");

    client.writeQuery({
      query: User,
      data: {
        getUser: null,
      },
    });

    logout().finally(() => {
      AsyncStorage.clear();
    });
  };

  return (
    <DrawerContentScrollView {...props}>
      <VStack space={6} my={2} mx={2}>
        {user && (
          <Flex ml={2} direction="row" alignItems="center">
            <Avatar mr={4} source={{ uri: user.picture }} />
            <Box>
              <Text fontWeight="extrabold">{user?.name}</Text>
              <Text fontSize={14} mt={0.5} fontWeight={400}>
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
