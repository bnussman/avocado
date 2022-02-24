import { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { GetTokensQuery } from "../../generated/graphql";
import { Pagination } from "../../components/Pagination";
import { Error } from "../../components/Error";
import { Loading } from "../../components/Loading";
import { Box, Flex, Heading, Spacer, Table, Tbody, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { SessionRow } from "./SessionRow";

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

  const toast = useToast();

  const tokens = data?.getTokens.data;
  const count = data?.getTokens.count;

  const [currentPage, setCurrentPage] = useState<number>(1);

  async function fetchBeeps(page: number) {
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
          onPageChange={fetchBeeps}
        />
      </Flex>
      <Table>
        <Thead>
          <Tr>
            <Th>Token</Th>
            <Th>Created</Th>
            <Th></Th>
          </Tr>
        </Thead>
        <Tbody>
          {tokens && tokens.map((token) => (
            <SessionRow {...token} />
          ))}
        </Tbody>
      </Table>
      {loading && <Loading />}
    </Box>
  );
}