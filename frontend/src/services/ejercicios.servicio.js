import axiosInstance from '../config/axios.config';

export const ejerciciosService = {
    // Obtener todos los ejercicios
    getAll: async () => {
        try {
            const response = await axiosInstance.get('/api/ejercicios');
            return response.data;
        } catch (error) {
            console.error('Error al obtener ejercicios:', error);
            throw error;
        }
    },

    // Obtener un ejercicio por ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/api/ejercicios/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error al obtener ejercicio ${id}:`, error);
            throw error;
        }
    },

    // Crear un nuevo ejercicio
    create: async (ejercicio) => {
        try {
            const response = await axiosInstance.post('/api/ejercicios', ejercicio);
            return response.data;
        } catch (error) {
            console.error('Error al crear ejercicio:', error);
            throw error;
        }
    },

    // Actualizar un ejercicio
    update: async (id, ejercicio) => {
        try {
            const response = await axiosInstance.put(`/api/ejercicios/${id}`, ejercicio);
            return response.data;
        } catch (error) {
            console.error(`Error al actualizar ejercicio ${id}:`, error);
            throw error;
        }
    },

    // Eliminar un ejercicio
    delete: async (id) => {
        try {
            await axiosInstance.delete(`/api/ejercicios/${id}`);
        } catch (error) {
            console.error(`Error al eliminar ejercicio ${id}:`, error);
            throw error;
        }
    }
};
// Renombra las funciones del objeto para exportarlas individualmente
export const {
  getAll: listarEjercicios, // Exporta 'getAll' CON EL NOMBRE 'listarEjercicios'
  getById: obtenerEjercicioPorId, // (Exporta 'getById' como 'obtenerEjercicioPorId', por si lo necesitas)
  create: crearEjercicio, // (Exporta 'create' como 'crearEjercicio', por si lo necesitas)
  update: actualizarEjercicio, // (etc...)
  delete: eliminarEjercicio,
} = ejerciciosService;