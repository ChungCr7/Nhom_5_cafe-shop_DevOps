package com.example.baochung_st22a.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Ảnh sản phẩm
        registry.addResourceHandler("/product_img/**")
                .addResourceLocations("file:uploads/product_img/");

        // Ảnh hồ sơ người dùng
        registry.addResourceHandler("/profile_img/**")
                .addResourceLocations("file:uploads/profile_img/");
    }
}
