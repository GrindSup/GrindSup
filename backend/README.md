## 🗂️ Estructura del proyecto
```.

backend/
│
├── .mvn/                           # Configuración interna de Maven Wrapper
├── .vscode/                        # Configuración de VSCode
├── target/                         # Archivos compilados (build)
│   ├── backend-0.0.1-SNAPSHOT/     
│   ├── backend-0.0.1-SNAPSHOT.jar  
│   ├── backend-0.0.1-SNAPSHOT.jar.original
│   ├── classes/                    
│   │   └── application.properties
│   ├── generated-sources/          
│   │   └── annotations/
│   ├── generated-test-sources/     
│   │   └── test-annotations/
│   ├── maven-archiver/             

│   │   └── pom.properties
│   ├── maven-status/               
│   │   └── maven-compiler-plugin/
│   │       ├── compile/
│   │       └── testCompile/
│   ├── surefire-reports/           
│   │   ├── com.grindsup.backend.BackendApplicationTest.txt
│   │   └── TEST-com.grindsup.backend.BackendApplicationTests.xml
│   └── test-classes/               
│       └── com/grindsup/backend/
│           └── BackendApplicationTests.class
│
├── src/                            
│   ├── main/
│   │   ├── java/com/grindsup/backend/
│   │   │   ├── GrindSupBackendApplication.java
│   │   │   ├── TestController.java   
│   │   │   ├── controller/         # Controladores REST
│   │   │   │   ├── GoogleCalendarController.java
│   │   │   │   ├── GoogleCalendarNotificationController.java
│   │   │   │   ├── AlumnoController.java
│   │   │   │   ├── AgendaController.java
│   │   │   │   ├── EntrenadorController.java
│   │   │   │   ├── EjercicioController.java
│   │   │   │   ├── PlanEntrenamientoController.java
│   │   │   │   ├── RutinaController.java
│   │   │   │   ├── RutinaEjercicioController.java
│   │   │   │   ├── EstadoController.java
│   │   │   │   ├── SesionController.java   
│   │   │   │   ├── TurnoController.java
│   │   │   │   ├── TurnoAlumnoController.java
│   │   │   │   ├── RolController.java                   
│   │   │   │   ├── TipoTurnoController.java            
│   │   │   │   └── UsuarioController.java              
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java
│   │   │   │   ├── GoogleCalendarConfig.java
|   |   |   |   └── SecurityConfig.java          
│   │   │   ├── service/
│   │   │   │   ├── GoogleCalendarService.java
│   │   │   │   ├── GoogleCalendarNotificationService.java
│   │   │   │   ├── GoogleCalendarCredentialService.java
│   │   │   │   ├── UserService.java
│   │   │   │   ├── TurnoService.java
|   |   |   |   └── RecuperarContrasenaService.java
│   │   │   ├── mail/
│   │   │   │   ├── ConsoleMailAdapter.java
│   │   │   │   ├── MailPort.java
│   │   │   │   ├── MailTemplate.java
|   |   |   |   └── SmtpMailAdapter.java      
│   │   │   ├── model/              
│   │   │   │   ├── Alumno.java
│   │   │   │   ├── Agenda.java
│   │   │   │   ├── Entrenador.java
│   │   │   │   ├── Ejercicio.java
│   │   │   │   ├── PlanEntrenamiento.java
│   │   │   │   ├── Rutina.java
│   │   │   │   ├── RutinaEjercicio.java
│   │   │   │   ├── RutinaEjercicioId.java
│   │   │   │   ├── Estado.java
│   │   │   │   ├── Turno.java
│   │   │   │   ├── Rol.java                             
│   │   │   │   ├── TipoTurno.java                       
│   │   │   │   ├── Usuario.java
│   │   │   │   ├── Sesion.java
│   │   │   │   ├── TurnoAlumno.java
│   │   │   │   ├── TurnoAlumnoId.java                           
|   |   |   |   └── TokenRecuperacionContrasena.java
│   │   │   ├── DTO/
│   │   │   │   ├── AlumnoMiniDTO.java
│   │   │   │   ├── LoginRequest.java
│   │   │   │   ├── LoginResponse.java
│   │   │   │   ├── LogoutResponse.java
│   │   │   │   ├── RecuperarContrasenaDTO.java
│   │   │   │   ├── TurnoRequestDTO.java
│   │   │   │   ├── TurnoResponseDTO.java
|   |   |   |   └── UsuarioDTO.java
│   │   │   ├── repository/         
│   │   │   |   ├── AlumnoRepository.java
│   │   │   |   ├── AgendaRepository.java
│   │   │   |   ├── EntrenadorRepository.java
│   │   │   |   ├── EjercicioRepository.java
│   │   │   |   ├── PlanEntrenamientoRepository.java
│   │   │   |   ├── RutinaRepository.java
│   │   │   |   ├── RutinaEjercicioRepository.java
│   │   │   |   ├── EstadoRepository.java
│   │   │   |   ├── SesionRepository.java                
│   │   │   |   ├── TurnoRepository.java
│   │   │   |   ├── TurnoAlumnoRepository.java
│   │   │   |   ├── RolRepository.java                   
│   │   │   |   ├── TipoTurnoRepository.java            
│   │   │   |   ├── UsuarioRepository.java           
|   |   |   |   └── TokenRecuperacionContrasenaRepository.java   
|   |   |   |
|   |   |   └── util/
|   |   |        └── TokenUtil.java                    
|   |   |
│   │   └── resources/              
│   │       ├── application.properties
│   │       ├── credentials.json  
│   │       └── static/             
│   │       └── templates/          
│   │
│   └── test/                       
│       └── java/com/grindsup/backend/
│           └── BackendApplicationTests.java
│
├── .gitignore                      
├── .gitattributes                  
├── mvnw                            
├── mvnw.cmd                        
└── pom.xml                         
