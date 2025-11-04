package com.example.baochung_st22a.config;

import com.example.baochung_st22a.model.UserDtls;
import com.example.baochung_st22a.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        try {
            createRootUserIfNotExists();
        } catch (Exception e) {
            logger.error("Error during data initialization", e);
        }
    }

    private void createRootUserIfNotExists() {
        String rootEmail = "admin@coffeeshop.com";

        UserDtls existingUser = userService.getUserByEmail(rootEmail);
        
        if (existingUser == null) {
            logger.info("Creating root admin user...");

            UserDtls rootUser = new UserDtls();
            rootUser.setName("System Administrator");
            rootUser.setEmail(rootEmail);
            rootUser.setPassword("Admin@123"); // Will be encoded by saveAdmin method
            rootUser.setRole("ROLE_ADMIN");
            userService.saveAdmin(rootUser);

            logger.info("Root admin user created successfully");
        } else {
            logger.info("Root admin user already exists");
        }
    }
}