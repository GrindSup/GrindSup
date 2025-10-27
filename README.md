# 📌 Hoja de Ruta de Sprints – GrindSup

Este documento detalla los sprints de desarrollo del proyecto **GrindSup**, desde la fase de organización (Sprint 0) hasta el despliegue del mismo.

## 🟦 Sprint 0 – Preparación y Organización (3 semana)

**Objetivo:** Alinear al equipo y sentar las bases conceptuales del proyecto.

* Armado de grupos de trabajo y definición de roles (Product Owner, Scrum Master, Backend, Frontend, Documentación).
* Redacción del **Estudio Inicial**.
* Elaboración del **Plan de Proyecto** (objetivos, alcance, metodología, roles).
* Revisión y ajustes de los documentos generados.
* Definir el producto a realizar (plataforma GrindSup).
* Exposición inicial del avance y entrega de documentación.
* Capacitarse en **Scrum, MySQL, Vercel, Testing, JWT, API de Whatsapp**, en este sprint.

---

## 🟦 Sprint 1 – Gestión de Usuarios y Alumnos (2 semanas)

**Objetivo:** Entregar un MVP que permita al entrenador iniciar sesión y administrar alumnos de manera básica.

* Implementar el **Backend** con conexión a la base de datos.
* Crear la **Base de datos en MySQL**.
* Realizar **Peticiones CRUD** desde el backend (Java).
* Comenzar el **Frontend** con vistas iniciales e integración básica (React).
* Actualizar y completar **Documentación**.
* Implementar HU-42 (Iniciar sesión) y HU-43 (Cerrar sesión) con usuarios precargados.
* Desarrollar funcionalidades de Gestión de Alumnos
* Implementar el backend en Spring Boot con conexión a MySQL y peticiones CRUD.

**Historias de Usuarios implementadas**
* HU-1: Registrar alumno.
* HU-4: Listar alumnos.
* HU-5: Editar alumno.
* HU-42: Iniciar sesion.
* HU-43: Cerrar sesion.

**Roles:**

* Product Owner: Azul Oyola.
* Scrum Master: Azul Oyola.
* Programación backend: Martín Gamboa, Agustina Silva, Azul Oyola.
* Programación frontend: Betina Yost, Dana Montesinos.


---

## 🟦 Sprint 2 –  (2 semanas)

**Objetivo:** Ampliar el MVP incorporando la gestión completa de turnos, el sistema de recuperación de contraseña y la mejora en la administración de alumnos.

* Implementar nuevas funcionalidades en el Backend (Spring Boot) y conectarlas con la base de datos MySQL.
* Crear y vincular las tablas necesarias para la gestión de turnos y el control de estado de los alumnos.
* Desarrollar el flujo completo de recuperación de contraseña mediante tokens y envío de correo electrónico.
* Integrar Google Calendar API para generar notificaciones automáticas de turnos.
* Agregar nuevas vistas en el Frontend (React) para la gestión de turnos y recuperación de contraseña.
* Actualizar y completar la documentación técnica y funcional.
* Probar e integrar las funcionalidades en un entorno unificado.

**Historias de Usuario implementadas:**
* HU-6: Dar de baja alumno.
* HU-3: Reactivar alumno.
* HU-45: Recuperar contraseña.
* HU-8: Registrar turno.
* HU-9: Modificar turno.
* HU-11: Visualizar turnos.
* HU-10: Notificación de turno (Google Calendar).

**Roles:**
* Product Owner: Dana Montesinos.
* Scrum Master: Azul Oyola.
* Programación backend: Martín Gamboa, Agustina Silva, Azul Oyola.
* Programación frontend: Betina Yost, Dana Montesinos.

---

## 🟦 Sprint 3 –  (2 semanas)
**Objetivo:**
Ampliar las funcionalidades del sistema incorporando la gestión completa de ejercicios y rutinas, permitiendo al entrenador crear, modificar, asignar y consultar rutinas personalizadas para cada alumno. Además, registrar nuevos entrenadores para la administración general de la plataforma.

* Implementar en el Backend (Spring Boot) las entidades y relaciones correspondientes a Ejercicios, Rutinas y Entrenadores.
* Desarrollar los endpoints CRUD para la administración de ejercicios y rutinas.
* Crear la vista en el Frontend (React) para la búsqueda, registro, modificación y visualización de ejercicios.
* Implementar la funcionalidad de asignar rutinas a los alumnos desde el panel del entrenador.
* Incorporar filtros para facilitar la búsqueda de rutinas según distintos criterios.
* Integrar validaciones y manejo de estados (activo/inactivo) para ejercicios y rutinas.
* Actualizar la base de datos MySQL con las nuevas tablas y relaciones.
* Completar la documentación técnica y actualizar el manual de usuario con las nuevas funcionalidades.

**Historias de Usuario implementadas:**
* HU-14: Buscar ejercicios.
* HU-13: Visualizar ejercicios.
* HU-16: Consultar ejercicios.
* HU-15: Registrar ejercicio.
* HU-17: Modificar ejercicio.
* HU-18: Desactivar ejercicio.
* HU-19: Eliminar ejercicio.
* HU-82: Registrar entrenador.
* HU-21: Registrar rutina.
* HU-22: Eliminar rutina.
* HU-23: Modificar rutina.
* HU-27: Filtrar rutina.
* HU-24: Visualizar rutinas.
* HU-26: Asignar rutina.

**Roles:**
* Product Owner: Betina Yost.
* Scrum Master: Azul Oyola.
* Programación backend: Martín Gamboa, Agustina Silva, Azul Oyola.
* Programación frontend: Betina Yost, Dana Montesinos.

---

## 🟦 Sprint 4 – Roles, Permisos y Administración Avanzada (2 semanas)

**Objetivo:**
Fortalecer la seguridad y administración del sistema mediante la implementación de permisos por roles, gestión de entrenadores y optimización del manejo de ejercicios.  
Este sprint busca consolidar la funcionalidad de los módulos existentes y mejorar la experiencia del usuario administrador.

- Implementar la gestión de **roles y permisos**, definiendo accesos diferenciados entre administradores, entrenadores y alumnos.  
- Incorporar el **estado de los entrenadores** (activo/inactivo) para facilitar su control dentro de la plataforma.  
- Desarrollar la funcionalidad para **listar y gestionar entrenadores** desde el panel administrativo.  
- Optimizar el módulo de **ejercicios**, permitiendo su búsqueda y eliminación controlada.  
- Actualizar la base de datos para reflejar las relaciones entre usuarios, roles y entrenadores.  
- Mejorar la documentación técnica y el manual de usuario, incluyendo la descripción de permisos y vistas correspondientes.  
- Realizar pruebas integradas para validar los nuevos flujos de acceso y administración.  

**Historias de Usuario implementadas**
- **HU-69:** Permiso de roles.  
- **HU-39:** Estado de entrenador.  
- **HU-82:** Registrar entrenador.  
- **HU-19:** Eliminar ejercicio.  
- **HU-38:** Listado de entrenadores.  
- **HU-14:** Buscar ejercicios.  

**Roles del equipo**
- **Product Owner:** Agustina Silva  
- **Scrum Master:** Azul Oyola  
- **Programación Backend:** Martín Gamboa, Agustina Silva, Azul Oyola  
- **Programación Frontend:** Betina Yost, Dana Montesinos  

---

## Dependencias
### Backend
* **Compilar y empaquetar:** `mvn clean package`
* **Ejecutar en desarrollo:** `mvn spring-boot:run`
* **Ejecutar jar generado:** `java -jar target/backend-0.0.1-SNAPSHOT.jar`

### Frontend
* **Instalar dependencias de UI y animaciones:** `npm install @chakra-ui/react @chakra-ui/icons @emotion/react @emotion/styled framer-motion`
* **Instalar enrutamiento de React:** `npm install react-router-dom`
