package com.example.baochung_st22a.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.web.multipart.MultipartFile;

import com.example.baochung_st22a.model.Product;

public interface ProductService {

    Product saveProduct(Product product);

    List<Product> getAllProducts();

    Boolean deleteProduct(Integer id);

    Product getProductById(Integer id);

    Product updateProduct(Product product, MultipartFile file);

    Product updateProductJson(Integer id, Product product);

    List<Product> getAllActiveProducts(String category);

    List<Product> searchProduct(String keyword);

    Page<Product> getAllActiveProductPagination(Integer pageNo, Integer pageSize, String category);

    Page<Product> searchProductPagination(Integer pageNo, Integer pageSize, String keyword);

    Page<Product> searchActiveProductPagination(Integer pageNo, Integer pageSize, String category, String keyword);

    Page<Product> getAllProductsPagination(Integer pageNo, Integer pageSize);

    long countProducts();
}
