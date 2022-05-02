import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { GetTokensQuery } from "../../generated/graphql";
import { Pagination } from "../../components/Pagination";
import { Error } from "../../components/Error";
import { Loading } from "../../components/Loading";
import { Box, Flex, Heading, Spacer, Table, Tbody, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { SessionRow } from "./SessionRow";
import { Hidden } from "../../components/Hidden";

export const Tokens = gql`
  query GetTokens {
    getTokens {
      data {
        created
        id
      }
      count
    }
  }
`;

export function Sessions() {
  const { data, error, loading, refetch } = useQuery<GetTokensQuery>(Tokens);

  const tokens = data?.getTokens.data;
  const count = data?.getTokens.count;

  const [currentPage, setCurrentPage] = useState<number>(1);

  async function fetchTokens(page: number) {
    refetch({ offset: page })
  }

  if (error) return <Error error={error} />;

  return (
    <Box>
      <Flex direction="row">
        <Heading>Sessions</Heading>
        <Spacer />
        <Pagination
          resultCount={count}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onPageChange={fetchTokens}
        />
      </Flex>
      <Box overflowX="auto">
        <Table maxW="100%">
          <Thead>
            <Tr>
              <Th>Token</Th>
              <Hidden sm>
                <Th>Created</Th>
              </Hidden>
              <Hidden md>
                <Th>Created</Th>
              </Hidden>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {tokens && tokens.map((token) => (
              <SessionRow key={token.id} {...token} />
            ))}
          </Tbody>
        </Table>
      </Box>
      {loading && <Loading />}
    </Box>
  );
}