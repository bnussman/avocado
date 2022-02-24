import { gql, useMutation } from "@apollo/client";
import { DeleteIcon } from "@chakra-ui/icons";
import { Tr, Td, IconButton, useToast } from "@chakra-ui/react";
import { Tokens } from ".";
import { User } from "../../App";
import { DeleteTokenMutation, GetTokensQuery } from "../../generated/graphql";
import { client } from "../../utils/apollo";

export type Unpacked<T> = T extends (infer U)[] ? U : T;

const DeleteToken = gql`
  mutation DeleteToken($id: String!) {
    deleteToken(id: $id)
  }
`;

export function SessionRow({ id, created }: Unpacked<GetTokensQuery['getTokens']['data']>) {
  const toast = useToast();

  const [remove, { loading }] = useMutation<DeleteTokenMutation>(DeleteToken);

  async function deleteToken(id: string) {
    const currentToken = localStorage.getItem('token');

    const isCurrentSession = currentToken === id;

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
      <Td>{id}</Td>
      <Td>{created}</Td>
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