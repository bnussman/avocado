import { CreatePostMutation, CreatePostMutationVariables } from "../generated/graphql";
import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useValidationErrors } from "../utils/useValidationErrors";
import { Error } from "../components/Error";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  FormControl,
  FormErrorMessage,
  Button,
  ModalFooter,
  Textarea
} from "@chakra-ui/react";

const Post = gql`
  mutation CreatePost($body: String!) {
    createPost(body: $body) {
      id
      body
      user {
        id
      }
    }
  }
`;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function NewPostModal({ isOpen, onClose }: Props) {
  const [post, { error }] = useMutation<CreatePostMutation>(Post);

  const validationErrors = useValidationErrors<CreatePostMutationVariables>(error);

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostMutationVariables>();

  const onSubmit = handleSubmit(async (variables) => {
    const { data } = await post({ variables });

    if (data) {
      onClose();
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <form onSubmit={onSubmit}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Post</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {error && !validationErrors ? <Error error={error} /> : null}
            <FormControl isInvalid={Boolean(errors.body) || Boolean(validationErrors?.body)}>
              <Textarea
                h={150}
                id='body'
                {...register('body', {
                  required: 'This is required',
                })}
              />
              <FormErrorMessage>
                {errors.body && errors.body.message}
                {validationErrors?.body && validationErrors?.body[0]}
              </FormErrorMessage>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              type="submit"
              colorScheme="purple"
              isLoading={isSubmitting}
            >
              Post
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
    </Modal>
 );
}
