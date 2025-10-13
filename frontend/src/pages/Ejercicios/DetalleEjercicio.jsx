import React from "react"; 
import {
  Box, Button, Card, CardBody, CardHeader, Container,
  Heading, Text, Stack, Badge, Divider, HStack, Tag,
  OrderedList, ListItem, AspectRatio
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom"; 


//Datos de ejemplo para mostrar la ficha (mientras no haya backend)
const mockEjercicioData = {
  id: "1",
  nombre: "Nombre del ejercicio",
  dificultad: "dificultad 1",
  descripcion: "Esto es una descripción del ejercicio.",
  grupoMuscularPrincipal: "Musculo principal",
  musculosSecundarios: [
    "Musculo secundario 1",
    "Musculo secundario 2",
  ],
  equipamiento: "equipamiento1, equipamiento2",
  instrucciones: [
    "Instruccion 1.",
    "Instruccion 2.",
    "Instruccion 3.",
    "Instruccion 4.",
    "Instruccion 5."
  ],
};

export default function FichaEjercicio() {
  const navigate = useNavigate();
  const ejercicio = mockEjercicioData;

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'dificultad 1': return 'green';
      case 'dificultad 2': return 'orange';
      case 'dificultad 3': return 'red';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardHeader>
          <Heading size="lg" mb={2}>{ejercicio.nombre}</Heading>
          <HStack spacing={4}>
            <Badge px={3} py={1} borderRadius="full" colorScheme={getDifficultyColor(ejercicio.dificultad)}>
              {ejercicio.dificultad}
            </Badge>
            <Tag size="md" variant="subtle" colorScheme="cyan">
              {ejercicio.equipamiento}
            </Tag>
          </HStack>
        </CardHeader>

        <CardBody>
          <Stack spacing={6}>
            <Box>
              <Text fontSize="lg" color="gray.700">{ejercicio.descripcion}</Text>
            </Box>

            <Divider />

            <Box>
              <Heading size="sm" mb={3} textTransform="uppercase" color="gray.500">
                Músculos Trabajados
              </Heading>
              <HStack spacing={2} wrap="wrap">
                <Tag size="lg" colorScheme="blue" variant="solid">{ejercicio.grupoMuscularPrincipal}</Tag>
                {ejercicio.musculosSecundarios?.map((musculo, index) => (
                  <Tag key={index} size="lg" colorScheme="blue" variant="outline">
                    {musculo}
                  </Tag>
                ))}
              </HStack>
            </Box>
            
            {ejercicio.instrucciones && ejercicio.instrucciones.length > 0 && (
              <Box>
                <Heading size="sm" mb={3} textTransform="uppercase" color="gray.500">
                  Instrucciones
                </Heading>
                <OrderedList spacing={2} pl={2}>
                  {ejercicio.instrucciones.map((paso, index) => (
                    <ListItem key={index}>{paso}</ListItem>
                  ))}
                </OrderedList>
              </Box>
            )}


            <Divider />

            <Stack direction="row" spacing={4} justify="flex-end" mt={4}>
              <Button onClick={() => navigate(`/admin/ejercicio/editar/${ejercicio.id}`)} colorScheme="teal">
                Editar
              </Button>
              <Button variant="ghost" onClick={() => navigate("/catalogo")}>
                Volver
              </Button>
            </Stack>
          </Stack>
        </CardBody>
      </Card>
    </Container>
  );
}