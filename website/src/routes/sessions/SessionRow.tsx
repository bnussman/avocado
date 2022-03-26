import { gql, useMutation } from "@apollo/client";
import { DeleteIcon } from "@chakra-ui/icons";
import { Tr, Td, IconButton, useToast, Badge } from "@chakra-ui/react";
import { Tokens } from ".";
import { User } from "../../utils/useUser";
import { Hidden } from "../../components/Hidden";
import { DeleteTokenMutation, GetTokensQuery } from "../../generated/graphql";
import { client } from "../../utils/apollo";
import { Unpacked } from "../../utils/types";
import { DateTime } from 'luxon';

const DeleteToken = gql`
  mutation DeleteToken($id: String!) {
    deleteToken(id: $id)
  }
`;

export function SessionRow({ id, created }: Unpacked<GetTokensQuery['getTokens']['data']>) {
  const toast = useToast();

  const [remove, { loading }] = useMutation<DeleteTokenMutation>(DeleteToken);

  const currentToken = localStorage.getItem('token');

  const isCurrentSession = currentToken === id;

  async function deleteToken(id: string) {
    remove({
      variables: { id },
      refetchQueries: [Tokens],
    }).then(() => {
      if (isCurrentSession) {
        localStorage.removeItem('token');
        client.writeQuery({
          query: User,
          data: { getUser: null }
        });
      }
    }).catch((e) => toast({ description: e.message, status: 'error' }));
  }

  return (
    <Tr key={id}>
      <Td whiteSpace="nowrap">
        {id}
        {isCurrentSession && <Badge mx={4} variant='solid' colorScheme="green">Current Session</Badge>}
      </Td>
      <Hidden sm>
        <Td>{new Date(created).toLocaleString()}</Td>
      </Hidden>
      <Hidden md>
        <Td>{DateTime.fromISO(created).toRelative()}</Td>
      </Hidden>
      <Td textAlign="right">
        <IconButton
          isLoading={loading}
          colorScheme="red"
          aria-label={`Delete session ${id}`}
          icon={<DeleteIcon />}
          onClick={() => deleteToken(id)}
        />
      </Td>
    </Tr>
  );
}
