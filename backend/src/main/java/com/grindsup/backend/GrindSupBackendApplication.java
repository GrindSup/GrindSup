package com.grindsup.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class GrindSupBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(GrindSupBackendApplication.class, args);
		System.out.println("Backend de GrindSup corriendo...");
	}

}
