import { User, useUser } from '../utils/useUser';
import { gql, useMutation } from '@apollo/client';
import { LogoutMutation } from '../generated/graphql';
import { client } from '../utils/apollo';
import { Link } from 'react-router-dom';
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  Avatar,
  useToast,
  Box,
  MenuDivider,
} from '@chakra-ui/react'
import { CloseIcon, LockIcon } from '@chakra-ui/icons';

const Logout = gql`
  mutation Logout {
    logout
  }
`;

export function UserMenu() {
  const { user } = useUser();
  const toast = useToast();
  const [logout] = useMutation<LogoutMutation>(Logout);

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

  if (!user) {
    return null;
  }

  return (
    <Menu>
      <MenuButton as={Button} leftIcon={<Avatar size="xs" src={user.picture} />}>
        {user.name}
      </MenuButton>
      <MenuList>
        <MenuItem icon={<LockIcon />} as={Link} to="/sessions">Sessions</MenuItem>
        <MenuDivider />
        <MenuItem icon={<CloseIcon />} onClick={onLogout}>Logout</MenuItem>
      </MenuList>
    </Menu>
  );
}
