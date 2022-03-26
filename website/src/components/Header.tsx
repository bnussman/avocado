import Logo from '../assets/icon.png';
import { SignupModal } from './SignupModal';
import { LoginModal } from './LoginModal';
import { useUser } from '../utils/useUser';
import { UserMenu } from './UserMenu';
import { AddIcon } from '@chakra-ui/icons';
import { NewPostModal } from './NewPostModal';
import { Link } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  useDisclosure,
  Stack,
  Button,
  Image,
  useColorMode,
  Switch,
  useBreakpointValue,
  IconButton,
} from '@chakra-ui/react';

export function Header() {
  const { user } = useUser();
  const { colorMode, toggleColorMode } = useColorMode();
  const isMobile = useBreakpointValue({ base: true, md: false })

  const {
    isOpen: isPostOpen,
    onClose: onPostClose,
    onOpen: onPostOpen
  } = useDisclosure();

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
        <HStack spacing={4} alignItems='center'>
          <Box>
            <Flex alignItems='center' as={Link} to="/">
              <Icon />
            </Flex>
          </Box>
          <HStack
            as='nav'
            spacing={2}
            display="flex"
          >
            {!user && <Button onClick={onLoginOpen}>Login</Button>}
            {!user && <Button colorScheme="purple" onClick={onSignupOpen}>Sign Up</Button>}
            {user && <UserMenu />}
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
            {isMobile ? 
              <IconButton
                aria-label="New Post"
                colorScheme="purple"
                isDisabled={!user}
                icon={<AddIcon />}
                onClick={onPostOpen}
              />
              :
              <Button
                isDisabled={!user}
                colorScheme="purple"
                rightIcon={<AddIcon />}
                onClick={onPostOpen}
              >
                New Post
              </Button>
            }
            <Box>☀️</Box>
            <Switch
              isChecked={colorMode === "dark"}
              onChange={toggleColorMode}
              colorScheme="brand"
              size="lg"
              ml={2}
            />
            <Box>🌙</Box>
          </Stack>
        </Flex>
      </Flex>
      <LoginModal isOpen={isLoginOpen} onClose={onLoginClose} />
      <SignupModal isOpen={isSignupOpen} onClose={onSignupClose} />
      <NewPostModal isOpen={isPostOpen} onClose={onPostClose} />
    </>
  );
}
