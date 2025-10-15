import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';

/**
 * Botón para volver a la página anterior.
 * @param {React.ReactNode} children - Texto principal del botón. Default: "Volver".
 * @param {React.ReactElement | string} leftIcon - Ícono o texto a la izquierda. Default: <ArrowBackIcon />.
 */
export default function BotonVolver({ children, leftIcon = <ArrowBackIcon />, ...props }) {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Button
      onClick={handleGoBack}
      leftIcon={leftIcon} 
      bg="#0f4d11ff"
      color="white"
      borderRadius="md"
      {...props} 
    >
      {children || 'Volver'} 
    </Button>
  );
}