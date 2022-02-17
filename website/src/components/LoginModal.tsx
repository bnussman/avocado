import { Button, Input, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from "@chakra-ui/react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: Props) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Login</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input />
            <Input />
          </ModalBody>
          <ModalFooter>
            <Button  mr={3} onClick={onClose}>
              Close
            </Button>
            <Button colorScheme='blue'>Login</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
  );
}