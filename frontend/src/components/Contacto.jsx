// src/components/Contacto.jsx
import React from "react";
import { Box, Container, Card, CardBody, CardHeader, Heading, Text, Flex, Icon } from "@chakra-ui/react";
import { MdEmail } from "react-icons/md";

export default function Contacto() {
  return (
    <Box py={{ base: 8, md: 12 }} display="flex" justifyContent="center">
      <Container maxW="container.sm">
        <Card
          boxShadow="2xl"
          borderRadius="2xl"
          bg="white"
          border="none"
          overflow="hidden"
          minH="350px"
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          p={0}   
        >
          <CardHeader 
            bg="#007000" 
            color="white" 
            textAlign="center" 
            py={6} 
            w="100%" 
            borderRadius="2xl 2xl 0 0"
          >
            <Flex align="center" justify="center" mb={2}>
              <Icon as={MdEmail} boxSize={10} mr={2} />
              <Heading size="2xl">Contacto</Heading>
            </Flex>
          </CardHeader>

          <CardBody 
            pt={6} 
            px={6} 
            display="flex" 
            flexDirection="column" 
            justifyContent="center"
            alignItems="center" 
            textAlign="center"
            fontFamily="Arial, sans-serif"
          >
            <Text color="black" fontSize="md" fontWeight="normal" mb={4}>
              Si tienes sugerencias, consultas o problemas, escribinos a:
            </Text>
            <Text fontSize="xl" fontWeight="bold" mb={4} color="#258d19">
              grindsup.developers@gmail.com
            </Text>
            <Text fontSize="md" fontWeight="normal" mb={4}>
              Te responderemos a la brevedad.
            </Text>
            <Text fontSize="md" textAlign="center" fontWeight="bold">
                También puedes contactarnos por teléfono al{" "}
                <Text as="span" color="#258d19" fontSize="lg" fontWeight="bold">
                    +54 351 550 5705
                </Text>
            </Text>

          </CardBody>
        </Card>
      </Container>
    </Box>
  );
}