import { Box, HStack, Link } from '@chakra-ui/react'
import { faReplyAll } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import { http } from '../utils'

export const Navbar = () => {
  const queryClient = useQueryClient()

  const { mutate } = useMutation({
    mutationFn: () =>
      http.post('/auth/logout', null, { withCredentials: true }),
    onSuccess: () => {
      localStorage.removeItem('token')
      queryClient.setQueryData(['auth'], null)
    },
  })

  return (
    <Box
      w="full"
      h={16}
      bgColor="gray.900"
      pl={6}
      pr={12}
      borderBottomWidth={1}
      borderBottomColor="gray.600"
    >
      <HStack w="full" h="full" justify="space-between">
        <Box>
          <Link as={RouterLink} to="/" _hover={{}}>
            <FontAwesomeIcon icon={faReplyAll} size="xl" />
            <Box as="span" ml={2} fontSize="2xl">
              chatter
            </Box>
            <Box as="span" fontSize="2xl" color="teal.300">
              box
            </Box>
          </Link>
        </Box>
        <HStack spacing="4">
          <Link as="button" onClick={() => mutate()} _hover={{}}>
            Logout
          </Link>
        </HStack>
      </HStack>
    </Box>
  )
}
