import { Alert as ChakraAlert, AlertIcon, CloseButton } from '@chakra-ui/react';
import { useState } from 'react';

export type AlertMessage = {
  status: 'success' | 'error' | 'warning' | 'info';
  text: string;
};

type AlertProps = {
  status: 'success' | 'error' | 'warning' | 'info';
  hideIcon?: boolean;
  hideClose?: boolean;
  children: string;
};

export const Alert = ({
  status,
  hideIcon = false,
  hideClose = false,
  children,
}: AlertProps) => {
  const [isClosed, setIsClosed] = useState(false);

  return !isClosed ? (
    <ChakraAlert status={status} variant="left-accent">
      {!hideIcon && <AlertIcon />}
      {children}
      {!hideClose && (
        <CloseButton
          onClick={() => setIsClosed(true)}
          pos="absolute"
          top={2}
          right={2}
        />
      )}
    </ChakraAlert>
  ) : null;
};
