// src/services/clienteApi.js

// 1. Importa la ÚNICA instancia de Axios que tiene la configuración correcta
//    (la que tiene el interceptor de 'Authorization: Bearer')
import axiosInstance from '../config/axios.config.js';

// 2. Exporta esa misma instancia bajo el nombre 'api'
//    para que el resto de tus servicios (usuarios.servicio.js, etc.)
//    puedan importarla y usarla.
export default axiosInstance;