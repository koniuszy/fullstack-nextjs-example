import {
  Container,
  FormControl,
  FormLabel,
  Switch,
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
  IconButton,
  Spacer,
  Input,
  Heading,
  Button,
} from '@chakra-ui/react'
import { DeleteIcon } from '@chakra-ui/icons'
import { GetStaticProps } from 'next'
import Head from 'next/head'
import { FC, useState } from 'react'
import { Textarea } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'

import {
  usePostListQuery,
  PostListDocument,
  useDeletePostMutation,
  useCreatePostMutation,
  useLoginMutation,
  useLogoutMutation,
} from '../../generated/graphql'
import { addApolloState, initializeApollo } from '../lib/apollo'

const TableTitles: FC = () => (
  <>
    <Th>ID</Th>
    <Th>Title</Th>
    <Th>Text preview</Th>
    <Th>Author name</Th>
    <Th>Actions</Th>
  </>
)

const Home: FC = () => {
  const toast = useToast()
  const [form, setForm] = useState({ title: '', text: '' })

  const { data: posts } = usePostListQuery()
  const [deletePostMutation] = useDeletePostMutation({
    refetchQueries: [PostListDocument],
    onError() {
      toast({
        title: 'Log in as an admin first',
        description: 'Not authorized',
        status: 'error',
      })
    },
  })
  const [createPostMutation, { loading: isCreatingPost }] = useCreatePostMutation({
    refetchQueries: [PostListDocument],
  })

  const [loginMutation] = useLoginMutation()
  const [logoutMutation] = useLogoutMutation()

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Container w="5xl" maxW="none" marginY="10">
        <FormControl display="flex" alignItems="center">
          <FormLabel htmlFor="email-alerts" mb="0">
            Log in as an admin
          </FormLabel>
          <Switch
            onChange={(e) => {
              if (e.target.checked) {
                loginMutation()
                return
              }
              logoutMutation()
            }}
            id="email-alerts"
          />
        </FormControl>

        <Table w="full" size="lg" variant="simple">
          <TableCaption>Posts</TableCaption>
          <Thead>
            <Tr>
              <TableTitles />
            </Tr>
          </Thead>
          <Tbody>
            {posts?.postList.map((post) => (
              <Tr key={post.id}>
                <Td>{post.id}</Td>
                <Td>{post.title}</Td>
                <Td>{post.text}</Td>
                <Td>{post.author?.name}</Td>
                <Td>
                  <IconButton
                    onClick={() => deletePostMutation({ variables: { id: post.id } })}
                    variant="outline"
                    colorScheme="red"
                    aria-label="Send email"
                    icon={<DeleteIcon />}
                  />
                </Td>
              </Tr>
            ))}
          </Tbody>
          <Tfoot>
            <Tr>
              <TableTitles />
            </Tr>
          </Tfoot>
        </Table>

        <Spacer />

        <Heading as="h4" size="md" mb="4">
          Create a post
        </Heading>

        <form>
          <FormControl mb="4" isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Title"
            />
          </FormControl>

          <Textarea
            value={form.text}
            onChange={(e) => setForm({ ...form, text: e.target.value })}
            placeholder="Here is a sample placeholder"
            size="sm"
          />

          <Button
            mt={4}
            onClick={() =>
              createPostMutation({ variables: { title: form.title, text: form.text } })
            }
            isLoading={isCreatingPost}
            loadingText="Creating"
            colorScheme="teal"
            variant="outline"
            type="submit"
            spinnerPlacement="end"
          >
            Submit
          </Button>
        </form>
      </Container>
    </>
  )
}

export const getStaticProps: GetStaticProps = async (context) => {
  const apolloClient = initializeApollo()

  await apolloClient.query({
    query: PostListDocument,
  })

  return addApolloState(apolloClient, {
    props: {},
    revalidate: 2,
  })
}

export default Home
