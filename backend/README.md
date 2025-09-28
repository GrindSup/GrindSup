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
│   │   │   ├── controller/         # Controladores REST
│   │   │   │   ├── GoogleCalendarController.java
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
│   │   │   │   ├── RolController.java                   # agregado
│   │   │   │   ├── TipoTurnoController.java            # agregado
│   │   │   │   └── UsuarioController.java              # agregado
│   │   │   ├── config/
│   │   │   │   ├── CorsConfig.java
│   │   │   │   └── GoogleCalendarConfig.java
│   │   │   ├── service/
│   │   │   │   ├── GoogleCalendarService.java
│   │   │   │   ├── GoogleCalendarCredentialService.java
│   │   │   │   └── UserService.java
│   │   │   ├── model/              # Entidades JPA (tablas)
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
│   │   │   │   ├── Rol.java                             # agregado
│   │   │   │   ├── TipoTurno.java                       # agregado
│   │   │   │   └── Usuario.java                         # agregado
│   │   │   └── repository/         # Interfaces de acceso a datos
│   │   │       ├── AlumnoRepository.java
│   │   │       ├── AgendaRepository.java
│   │   │       ├── EntrenadorRepository.java
│   │   │       ├── EjercicioRepository.java
│   │   │       ├── PlanEntrenamientoRepository.java
│   │   │       ├── RutinaRepository.java
│   │   │       ├── RutinaEjercicioRepository.java
│   │   │       ├── EstadoRepository.java
│   │   │       ├── SesionRepository.java                
│   │   │       ├── TurnoRepository.java
│   │   │       ├── RolRepository.java                   # agregado
│   │   │       ├── TipoTurnoRepository.java             # agregado
│   │   │       └── UsuarioRepository.java               # agregado
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
