package com.example.baochung_st22a.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // ✅ Mapping thư mục upload thật (nằm ngoài JAR)
        registry.addResourceHandler("/product_img/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/product_img/");

        registry.addResourceHandler("/category_img/**")
                .addResourceLocations("file:" + System.getProperty("user.dir") + "/uploads/category_img/");
    }
}
