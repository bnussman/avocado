import Logo from '../assets/icon.png';
import { client } from '../utils/apollo';
import { SignupModal } from './SignupModal';
import { User } from '../App';
import { Link } from "react-router-dom";
import { gql, useMutation, useQuery } from '@apollo/client';
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { GetUserQuery, LogoutMutation } from '../generated/graphql';
import { LoginModal } from './LoginModal';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  Stack,
  Button,
  Image,
  useColorMode,
  Switch,
  useToast
} from '@chakra-ui/react';

const Logout = gql`
  mutation Logout {
    logout
  }
`;

export function Header() {
  const { data } = useQuery<GetUserQuery>(User);
  const [logout, { loading }] = useMutation<LogoutMutation>(Logout);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();

  const toast = useToast();

  const {
    isOpen: isSignupOpen,
    onClose: onSignupClose,
    onOpen: onSignupOpen
  } = useDisclosure();


  const {
    isOpen: isLoginOpen,
    onClose: onLoginClose,
    onOpen: onLoginOpen
  } = useDisclosure();

  const user = data?.getUser;

  const onLogout = async () => {
    const { data, errors } = await logout();

    if (data) {
      localStorage.removeItem('token');

      client.writeQuery({
        query: User,
        data: { getUser: null }
      });
    }

    if (errors) {
      toast({ status: 'error', title: "Unable to Logout", description: errors[0].message });
    }
  };

  return (
    <>
      <Flex h={16} alignItems='center' justifyContent='space-between' px={4}>
        <IconButton
          size='md'
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label='Open Menu'
          display={{ md: !isOpen ? 'none' : 'inherit' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems='center'>
          <Box>
            <Flex alignItems='center'>
              <Flex
                backgroundColor='white'
                alignItems='center'
                justifyContent='center'
                borderRadius='xl'
                boxShadow="dark-lg"
                width={10}
                height={10}
              >
                <Image h={8} src={Logo} />
              </Flex>
              <Box ml={3} as={Link} to='/' fontWeight="bold" fontSize="2xl">Avocado</Box>
            </Flex>
          </Box>
          <HStack
            as='nav'
            spacing={2}
            display={{ base: 'none', md: 'flex' }}
          >
            {/* <Button as={Link} variant="ghost" to='/faq'>FAQ</Button>
              <Button as={Link} variant="ghost" to='/about'>About</Button>
              <Button as={Link} variant="ghost" to='/download' target="_black">Download</Button> */}
          </HStack>
        </HStack>
        <Flex alignItems='center'>
          <Stack
            flex={{ base: 1, md: 0 }}
            justify='flex-end'
            direction='row'
            spacing={4}
            alignItems='center'
          >
            {!user && <Button onClick={onSignupOpen}>Sign Up</Button>}
            {!user && <Button onClick={onLoginOpen}>Login</Button>}
            {user && <Button onClick={onLogout} isLoading={loading}>Logout</Button>}
            <Switch
              isChecked={colorMode === "dark"}
              onChange={toggleColorMode}
              colorScheme="brand"
              size="lg"
              ml={2}
            />
          </Stack>
        </Flex>
      </Flex>
      {isOpen ? (
        <Box pb={4} pl={4}>
          <Stack as='nav' spacing={4}>
            {/* <Link to='/faq'>FAQ</Link>
            <Link to='/about'>About</Link>
            <Link to='/download' target="_blank">Download</Link> */}
          </Stack>
        </Box>
      ) : null}
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <SignupModal isOpen={isSignupOpen} onClose={onSignupClose} />
    </>
  );
}
