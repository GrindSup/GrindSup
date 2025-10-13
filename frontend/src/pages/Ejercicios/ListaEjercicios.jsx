import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; 
import {
  Box, Button, Container, Heading, Flex,
  Alert, AlertIcon, Spinner, Text,
} from '@chakra-ui/react'; 
import { AddIcon } from '@chakra-ui/icons'; 
import axiosInstance from '../../config/axios.config';
import { useNavigate } from 'react-router-dom';
import BotonVolver from '../../components/BotonVolver.jsx';
import { HStack } from '@chakra-ui/react';

export default function ListaEjercicios() {
    const [testData, setTestData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const navigate = useNavigate();

    useEffect(() => {
        probarConexion();
    }, []);

    const probarConexion = async () => {
        try {
            setLoading(true);
            console.log('Intentando conectar con el backend...');
            const response = await axiosInstance.get('/');
            setTestData(response.data);
            setError(null);
            console.log('Respuesta del servidor:', response.data);
        } catch (err) {
            console.error('Error al conectar:', err);
            setError('Error al conectar con el backend: ' + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };
    
return (
        <Container maxW="7xl" py={10}>
            <Box>
                {/* --- CABECERA --- */}
                <Flex justifyContent="space-between" alignItems="center" mb={6}>
                    <HStack spacing={4} alignItems="center">
                        <BotonVolver />
                        <Heading as="h1" size="xl">
                            Lista de Ejercicios
                        </Heading>
                    </HStack>
                    
                    <HStack spacing={4}>
                        <Link to="/ejercicio/registrar">
                            <Button
                                leftIcon={<AddIcon />}
                                colorScheme="brand"
                                variant="solid"
                            >
                                Nuevo Ejercicio
                            </Button>
                        </Link>
                    </HStack>
                </Flex>

                {/* --- CONTENIDO PRINCIPAL --- */}
                {loading && (
                    <Flex justifyContent="center" py={10}>
                        <Spinner size="xl" />
                        <Text ml={4}>Probando conexión con el backend...</Text>
                    </Flex>
                )}

                {error && (
                    <Alert status="error">
                        <AlertIcon />
                        {error}
                    </Alert>
                )}

                {!loading && !error && (
                    <Box>
                        <Heading as="h2" size="lg" mb={4}>Prueba de Conexión</Heading>
                        {testData ? (
                            <Box p={4} borderWidth="1px" borderRadius="md">
                                <Text><strong>Mensaje:</strong> {testData.mensaje}</Text>
                                <Text><strong>Estado:</strong> {testData.estado}</Text>
                                <Text><strong>Timestamp:</strong> {new Date(testData.timestamp).toLocaleString()}</Text>
                            </Box>
                        ) : (
                            <Text>No hay datos disponibles</Text>
                        )}
                    </Box>
                )}
            </Box>
        </Container>
    );
}