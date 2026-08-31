package com.example.demo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import javax.sql.DataSource;
import java.sql.Connection;

@SpringBootApplication
public class DemoApplication {

    public static void main(String[] args) {
        SpringApplication.run(DemoApplication.class, args);
    }

  // Test code that runs immediately after the server starts
    @Bean
    public CommandLineRunner testDatabaseConnection(DataSource dataSource) {
        return args -> {
            try (Connection connection = dataSource.getConnection()) {
                System.out.println("=========================================");
                System.out.println(" Database connection successful! MySQL is ready.");
                System.out.println("=========================================");
            } catch (Exception e) {
                System.out.println("=========================================");
                System.out.println(" Error: MySQL connection failed! Verify your credentials.");
                System.out.println("Error details: " + e.getMessage());
                System.out.println("=========================================");
            }
        };
    }
}