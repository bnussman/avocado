import Logo from '../assets/icon.png';
import { client } from '../utils/apollo';
import { SignupModal } from './SignupModal';
import { User } from '../App';
import { Link } from "react-router-dom";
import { gql, useMutation } from '@apollo/client';
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";
import { LogoutMutation } from '../generated/graphql';
import { LoginModal } from './LoginModal';
import { useUser } from '../utils/useUser';
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
  useToast,
  useBreakpointValue
} from '@chakra-ui/react';

const Logout = gql`
  mutation Logout {
    logout
  }
`;

export function Header() {
  const { user } = useUser();
  const [logout, { loading }] = useMutation<LogoutMutation>(Logout);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false })

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

  const onLogout = async () => {
    const { data, errors } = await logout();

    if (data) {
      localStorage.removeItem('token');

      client.writeQuery({
        query: User,
        data: { getUser: null }
      });

      client.resetStore();
    }

    if (errors) {
      toast({ status: 'error', title: "Unable to Logout", description: errors[0].message });
    }
  };

  const Icon = () => (
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
  );

  return (
    <>
      <Flex h={16} alignItems='center' justifyContent='space-between' px={4} mb={2}>
        {isMobile && (
          <HStack spacing={4} as={Link} to='/'>
            <Icon />
            <IconButton
              size='md'
              icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
              aria-label='Open Menu'
              onClick={isOpen ? onClose : onOpen}
            />
          </HStack>
        )}
        <HStack spacing={8} alignItems='center'>
          <Box>
            <Flex alignItems='center'>
              {!isMobile && (
                <>
                  <Icon />
                  <Box
                    ml={3}
                    as={Link}
                    to='/'
                    fontWeight="extrabold"
                    fontSize="2xl"
                    bgGradient='linear(to-r, #59c173, #a17fe0, #5D26C1)'
                    bgClip='text'
                  >
                    Avocado
                  </Box>
                </>)}
            </Flex>
          </Box>
          <HStack
            as='nav'
            spacing={2}
            display={{ base: 'none', md: 'flex' }}
          >
            {/* <Button as={Link} variant="ghost" to='/sessions'>Sessions</Button>*/}
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
            {!user && <Button onClick={onLoginOpen}>Login</Button>}
            {!user && <Button colorScheme="purple" onClick={onSignupOpen}>Sign Up</Button>}
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
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <SignupModal isOpen={isSignupOpen} onClose={onSignupClose} />
      {isOpen ? (
        <Box pb={4} pl={4}>
          <Stack as='nav' spacing={4}>
            <Link to='/sessions'>Sessions</Link>
          </Stack>
        </Box>
      ) : null}
    </>
  );
}
