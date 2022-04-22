import { CreatePostMutation, CreatePostMutationVariables } from "../generated/graphql";
import { AttachmentIcon } from "@chakra-ui/icons";
import { gql, useMutation } from "@apollo/client";
import { useForm } from "react-hook-form";
import { useValidationErrors } from "../utils/useValidationErrors";
import { Error } from "../components/Error";
import { useMemo } from "react";
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
  Textarea,
  FormLabel,
  Input,
  HStack,
  Image
} from "@chakra-ui/react";

const Post = gql`
  mutation CreatePost($body: String!, $pictures: [Upload!]) {
    createPost(body: $body, pictures: $pictures) {
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
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostMutationVariables>();

  const pictures = watch('pictures');

  const onSubmit = handleSubmit(async (variables) => {
    const { data } = await post({ variables });

    if (data) {
      onClose();
      reset();
    }
  });

  const onDeleteItem = (idx: number) => {
    const fileList = { ...pictures };
    delete fileList[idx];
    setValue('pictures', fileList)
  };

  const Pictures = useMemo(() => {
    const items = pictures ? Array.from<File>(pictures) : [];
    if (items.length === 0) return null;
    return (
      <HStack spacing={4} flexWrap="wrap" mt={4}>
        {items?.map((picture, idx) => (
          <Image
            key={`${picture.name}`}
            src={picture ? URL.createObjectURL(picture) : undefined}
            _hover={{ shadow: "xl" }}
            rounded="xl"
            w="40px"
          />
        ))}
      </HStack>
    );
  }, [pictures]);

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
            {Pictures}
          </ModalBody>
          <ModalFooter mt="-2">
            <FormControl isInvalid={Boolean(errors.pictures) || Boolean(validationErrors?.pictures)}>
              <Button
                as={FormLabel}
                htmlFor='picture'
                justifySelf="flex-start"
                colorScheme="purple"
                variant="outline"
                rightIcon={<AttachmentIcon />}
              >
                Attach Photos
              </Button>
              <Input
                hidden
                variant="unstyled"
                id='picture'
                type='file'
                multiple
                {...register('pictures')}
              />
            </FormControl>
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
