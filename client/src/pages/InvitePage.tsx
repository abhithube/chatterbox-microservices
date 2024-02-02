import {
  Avatar,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Center,
  Heading,
  HStack,
  Spinner,
  Text,
  useToast,
  VStack,
} from '@chakra-ui/react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PartyDetails } from '../types';
import { http } from '../utils';

type JoinPartyArgs = {
  partyId: string;
  token: string;
};

export const InvitePage = () => {
  const [params] = useSearchParams();
  const toast = useToast();
  const navigate = useNavigate();

  const [partyId, setPartyId] = useState<string>();
  const [token, setToken] = useState<string>();

  const { data, isLoading } = useQuery<PartyDetails>({
    queryKey: ['parties', partyId],
    queryFn: () => http.get(`/parties/${partyId}`),
    enabled: !!partyId,
  });

  const { mutateAsync, isPending } = useMutation<void, unknown, JoinPartyArgs>({
    mutationFn: ({ partyId, token }) =>
      http.post(`/parties/${partyId}/members?token=${token}`),
  });

  useEffect(() => {
    const partyId = params.get('party');
    const token = params.get('token');
    if (!partyId || !token) return;

    setPartyId(partyId);
    setToken(token);
  }, []);

  const joinParty = async () => {
    if (!partyId || !token) return;

    const args: JoinPartyArgs = { partyId, token };
    await mutateAsync(args);

    toast({
      status: 'success',
      isClosable: true,
      description: 'Joined party successfully',
    });

    navigate(`/${args.partyId}`);
  };

  if (isLoading)
    return (
      <Center boxSize="full">
        <Spinner />
      </Center>
    );

  return (
    <Center boxSize="full">
      <Card>
        <CardHeader>
          <Heading size="md" color="gray.50">
            ACCEPT PARTY INVITE?
          </Heading>
        </CardHeader>
        <CardBody>
          <VStack>
            <HStack spacing={4}>
              <Avatar name={data?.name} size="lg" />
              <VStack alignItems="flex-start" spacing={0}>
                <Text fontSize="lg">{data?.name}</Text>
                <Text fontSize="sm" color="gray.400">
                  {data?.members.length ?? 0} members
                </Text>
              </VStack>
            </HStack>
          </VStack>
        </CardBody>
        <CardFooter justifyContent="flex-end">
          <ButtonGroup>
            <Button
              colorScheme="teal"
              isLoading={isPending}
              isDisabled={isPending}
              onClick={joinParty}
            >
              Join
            </Button>
            <Button isDisabled={isPending} onClick={() => navigate('/')}>
              Home
            </Button>
          </ButtonGroup>
        </CardFooter>
      </Card>
    </Center>
  );
};
