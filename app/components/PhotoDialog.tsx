import React, { useState } from "react";
import { ImageURISource } from "react-native";
import {
  Flex,
  Image,
  Modal,
  Spinner,
} from "native-base";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  source: ImageURISource | undefined;
}

export function PhotoDialog(props: Props) {
  const { isOpen, onClose, source } = props;
  const [isLoading, setIsLoading] = useState(true);

  const onLoad = () => {
    setIsLoading(false);
  };

  if (!source || !source.uri) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Content>
        <Modal.CloseButton bg="white" _icon={{ color: "primary.400" }} />
        <Modal.Body p={0} _scrollview={{ scrollEnabled: false }}>
          {isLoading && (
            <Flex alignItems="center" justifyContent="center" h="299px">
              <Spinner size="lg" />
            </Flex>
          )}
            <Image
              alt={source.uri}
              source={source}
              w="100%"
              h={isLoading ? "1px" : "300px"}
              onLoadEnd={onLoad}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal>
  );
}