import { Button, ThemeTypings } from '@chakra-ui/react';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useState } from 'react';

type SocialLoginButtonProps = {
  path: string;
  icon: IconProp;
  color: ThemeTypings['colorSchemes'];
  children: React.ReactNode;
};

export const SocialLoginButton = ({
  path,
  color,
  icon,
  children,
}: SocialLoginButtonProps) => {
  const [isLoading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);

    location.href = import.meta.env.VITE_BACKEND_URL + path;
  };

  return (
    <Button
      isLoading={isLoading}
      onClick={handleClick}
      leftIcon={<FontAwesomeIcon icon={icon} />}
      colorScheme={color}
    >
      {children}
    </Button>
  );
};
