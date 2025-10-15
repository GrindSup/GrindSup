import React, { useState, useEffect, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Box, Button, Container, Heading, Flex, Alert, AlertIcon, Spinner, Text,
  SimpleGrid, Card, CardHeader, CardBody, CardFooter, HStack, Tag, Spacer,
  InputGroup, InputLeftElement, Input, Center, Link } from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import axiosInstance from '../../config/axios.config';
import BotonVolver from '../../components/BotonVolver.jsx';

const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

export default function ListaEjercicios() {
    const [ejercicios, setEjercicios] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    
    const navigate = useNavigate();

    useEffect(() => {
        fetchEjercicios();
    }, []);

    const fetchEjercicios = async () => {
        try {
            setLoading(true);
            const response = await axiosInstance.get('/api/ejercicios'); 
            setEjercicios(response.data);
            setError(null);
        } catch (err) {
            setError('Error al cargar los ejercicios: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    const filteredEjercicios = useMemo(() => 
        ejercicios.filter(ej => 
            ej.nombre.toLowerCase().includes(search.toLowerCase())
        ), [ejercicios, search]);
    
    return (
        <Container maxW="7xl" py={10}>
            <Flex justifyContent="space-between" alignItems="center" mb={6} wrap="wrap" gap={4}>
                <HStack spacing={4} alignItems="center">
                    <BotonVolver />
                    <Heading as="h1" size="xl">
                        Lista de Ejercicios
                    </Heading>
                </HStack>
                <Spacer />
                <HStack spacing={4}>
                    <InputGroup w={{ base: "100%", md: "300px" }}>
                        <InputLeftElement pointerEvents="none">
                            <SearchIcon color="gray.500" />
                        </InputLeftElement>
                        <Input
                            placeholder="Buscar por nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            borderRadius="full"
                            bg="white"
                        />
                    </InputGroup>
                    <Button
                        leftIcon={<AddIcon />}
                        colorScheme="brand"
                        variant="solid"
                        onClick={() => navigate('/ejercicio/registrar')}
                        bg="#0f4d11ff"
                    >
                        Nuevo Ejercicio
                    </Button>
                </HStack>
            </Flex>

            {loading && (
                <Center py={10}><Spinner size="xl" /></Center>
            )}

            {error && (
                <Alert status="error"><AlertIcon />{error}</Alert>
            )}

            {!loading && !error && (
                <>
                    {filteredEjercicios.length === 0 ? (
                        <Center py={10}>
                            <Text fontSize="lg" color="gray.500">
                                {search ? 'No se encontraron ejercicios con ese nombre.' : 'Aún no hay ejercicios registrados.'}
                            </Text>
                        </Center>
                    ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                            {filteredEjercicios.map((ej) => (
                                <Card key={ej.id_ejercicio} direction="column" h="100%" display="flex">
                                    <Link as={RouterLink} to={`/ejercicio/detalle/${ej.id_ejercicio}`} flex="1" _hover={{ textDecoration: 'none' }}>
                                        <CardHeader>
                                            <Heading size='md'>{ej.nombre}</Heading>
                                        </CardHeader>
                                        <CardBody>
                                            <HStack spacing={2} wrap="wrap">
                                                <Tag colorScheme='teal'>{capitalize(ej.dificultad)}</Tag>
                                                {ej.grupoMuscularPrincipal?.map(musculo => (
                                                    <Tag key={musculo} colorScheme='purple'>{musculo}</Tag>
                                                ))}
                                            </HStack>
                                            <Text mt={4} noOfLines={3}>{ej.descripcion || "Sin descripción."}</Text>
                                        </CardBody>
                                    </Link>
                                    <Spacer />
                                    <CardFooter justify="flex-end">
                                        <HStack>
                                            <Button variant='solid' colorScheme='blue' size="sm" onClick={() => navigate(`/ejercicio/editar/${ej.id_ejercicio}`)} bg="#0f4d11ff">
                                                Editar
                                            </Button>
                                            <Button variant='ghost' colorScheme='red' size="sm">
                                                Eliminar
                                            </Button>
                                        </HStack>
                                    </CardFooter>
                                </Card>
                            ))}
                        </SimpleGrid>
                    )}
                </>
            )}
        </Container>
    );
}