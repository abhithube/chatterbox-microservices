import {
  Box,
  Center,
  Heading,
  HStack,
  IconButton,
  Link,
  Menu,
  MenuButton,
  MenuList,
  Spinner,
  VStack,
} from '@chakra-ui/react'
import { faGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect } from 'react'
import { Link as RouterLink, useNavigate } from 'react-router-dom'
import { PartyDetails } from '../types'
import { InviteModal } from './InviteModal'
import { TopicModal } from './TopicModal'

type TopicsSidebarProps = {
  party: PartyDetails | undefined
  topicId: string | undefined
}

export const TopicsSidebar = ({ party, topicId }: TopicsSidebarProps) => {
  const navigate = useNavigate()

  useEffect(() => {
    if (!party) return

    if (!topicId) {
      navigate(`/${party._id}/${party.topics[0]._id}`)
    }
  }, [party, topicId])

  if (!party) return <Spinner />

  return (
    <VStack
      h="full"
      align="start"
      bgColor="gray.800"
      borderRightWidth={1}
      borderRightColor="gray.600"
      spacing={4}
      p={4}
    >
      {party ? (
        <>
          <HStack w="full" justify="space-between">
            <Heading fontSize="2xl">{party?.name}</Heading>
            <Box>
              <Menu>
                <MenuButton
                  as={IconButton}
                  icon={<FontAwesomeIcon icon={faGear} />}
                />
                <MenuList py={0}>
                  <TopicModal />
                  <InviteModal />
                </MenuList>
              </Menu>
            </Box>
          </HStack>
          <Box>
            {party.topics.map((topic) => (
              <Link
                key={topic._id}
                as={RouterLink}
                to={`/${party._id}/${topic._id}`}
                rounded="sm"
                _hover={{}}
              >
                <HStack>
                  <Box as="span" fontSize="xl" color="teal.300">
                    #
                  </Box>
                  <Box
                    as="span"
                    color="gray.400"
                    _hover={{ color: 'gray.100' }}
                  >
                    {topic.name}
                  </Box>
                </HStack>
              </Link>
            ))}
          </Box>
        </>
      ) : (
        <Center h="full" p={4}>
          Choose or create a new party
        </Center>
      )}
    </VStack>
  )
}
