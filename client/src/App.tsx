import { Box, Center, Flex, Spinner } from '@chakra-ui/react'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import {
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { Navbar } from './components'
import { InvitePage, LoginPage, PartyPage } from './pages'
import { User } from './types'
import { http } from './utils'

export const App = () => {
  const [isReady, setReady] = useState(false)

  const { pathname, hash } = useLocation()
  const navigate = useNavigate()

  const { data, isLoading } = useQuery<User>({
    queryKey: ['auth'],
    queryFn: () => http.get('/users/@me'),
    enabled: isReady,
  })

  useEffect(() => {
    if (pathname === '/redirect') {
      localStorage.setItem('token', hash.slice(1))
      navigate('/')
    }

    setReady(true)
  }, [])

  if (isLoading)
    return (
      <Center boxSize="full">
        <Spinner />
      </Center>
    )

  return data ? (
    <Flex flexDir="column" boxSize="full">
      <Navbar />
      <Box flexGrow={1}>
        <Routes>
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/invite" element={<InvitePage />} />
          <Route path="/:partyId?/:topicId?" element={<PartyPage />} />
        </Routes>
      </Box>
    </Flex>
  ) : (
    <Box boxSize="full">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Box>
  )
}
