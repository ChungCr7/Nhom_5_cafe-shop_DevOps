package com.example.baochung_st22a.service.impl;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.util.ObjectUtils;
import org.springframework.web.multipart.MultipartFile;

import com.example.baochung_st22a.model.Product;
import com.example.baochung_st22a.repository.ProductRepository;
import com.example.baochung_st22a.service.ProductService;

@Service
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    // ✅ Lưu sản phẩm (tự động tính giá giảm)
    @Override
    public Product saveProduct(Product product) {
        product.calculateDiscountPrices();
        return productRepository.save(product);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Override
    public Page<Product> getAllProductsPagination(Integer pageNo, Integer pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return productRepository.findAll(pageable);
    }

    @Override
    public Boolean deleteProduct(Integer id) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            productRepository.delete(product);
            return true;
        }
        return false;
    }

    @Override
    public Product getProductById(Integer id) {
        return productRepository.findById(id).orElse(null);
    }

    // ✅ Cập nhật sản phẩm (form-data có ảnh)
    @Override
    public Product updateProduct(Product product, MultipartFile image) {
        Product dbProduct = getProductById(product.getId());
        if (dbProduct == null) return null;

        String imageName = (image != null && !image.isEmpty())
                ? image.getOriginalFilename()
                : dbProduct.getImage();

        dbProduct.setTitle(product.getTitle());
        dbProduct.setDescription(product.getDescription());
        dbProduct.setIngredients(product.getIngredients());
        dbProduct.setCategory(product.getCategory());
        dbProduct.setPriceSmall(product.getPriceSmall());
        dbProduct.setPriceMedium(product.getPriceMedium());
        dbProduct.setPriceLarge(product.getPriceLarge());
        dbProduct.setDiscount(product.getDiscount());
        dbProduct.setStock(product.getStock());
        dbProduct.setActive(product.getActive());
        dbProduct.setImage(imageName);

        dbProduct.calculateDiscountPrices();

        Product updated = productRepository.save(dbProduct);

        // ✅ Lưu ảnh nếu có upload mới
        if (updated != null && image != null && !image.isEmpty()) {
            try {
                File saveFile = new ClassPathResource("static/img").getFile();
                Path path = Paths.get(saveFile.getAbsolutePath(), "product_img", imageName);
                Files.copy(image.getInputStream(), path, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }

        return updated;
    }

    // ✅ Cập nhật bằng JSON (React PUT JSON)
    @Override
    public Product updateProductJson(Integer id, Product product) {
        Product dbProduct = getProductById(id);
        if (dbProduct == null) return null;

        dbProduct.setTitle(product.getTitle());
        dbProduct.setDescription(product.getDescription());
        dbProduct.setIngredients(product.getIngredients());
        dbProduct.setCategory(product.getCategory());
        dbProduct.setPriceSmall(product.getPriceSmall());
        dbProduct.setPriceMedium(product.getPriceMedium());
        dbProduct.setPriceLarge(product.getPriceLarge());
        dbProduct.setDiscount(product.getDiscount());
        dbProduct.setStock(product.getStock());
        dbProduct.setImage(product.getImage());
        dbProduct.setActive(product.getActive());

        dbProduct.calculateDiscountPrices();

        return productRepository.save(dbProduct);
    }

    @Override
    public List<Product> getAllActiveProducts(String category) {
        if (ObjectUtils.isEmpty(category)) {
            return productRepository.findByActiveTrue();
        }
        return productRepository.findByCategory(category);
    }

    @Override
    public List<Product> searchProduct(String keyword) {
        return productRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(keyword, keyword);
    }

    @Override
    public Page<Product> searchProductPagination(Integer pageNo, Integer pageSize, String keyword) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return productRepository.findByTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(keyword, keyword, pageable);
    }

    @Override
    public Page<Product> getAllActiveProductPagination(Integer pageNo, Integer pageSize, String category) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        if (ObjectUtils.isEmpty(category)) {
            return productRepository.findByActiveTrue(pageable);
        }
        return productRepository.findByCategory(pageable, category);
    }

    @Override
    public Page<Product> searchActiveProductPagination(Integer pageNo, Integer pageSize, String category, String keyword) {
        Pageable pageable = PageRequest.of(pageNo, pageSize);
        return productRepository.findByActiveTrueAndTitleContainingIgnoreCaseOrCategoryContainingIgnoreCase(keyword, keyword, pageable);
    }

    @Override
    public long countProducts() {
        return productRepository.count();
    }
}
