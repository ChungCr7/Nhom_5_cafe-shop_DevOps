package com.example.baochung_st22a.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@AllArgsConstructor
@NoArgsConstructor
@Data
@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 🔹 Tên sản phẩm
    @Column(length = 200, nullable = false)
    private String title;

    // 🔹 Mô tả chi tiết
    @Column(length = 2000)
    private String description;

    // 🔹 Thành phần
    @Column(length = 2000)
    private String ingredients;

    // 🔹 Danh mục (ví dụ: "Cà phê", "Trà sữa", ...)
    @Column(length = 100)
    private String category;

    // 🔹 Trạng thái sản phẩm (còn bán hay ẩn)
    private Boolean active = true;

    // 🔹 Hình ảnh sản phẩm
    @Column(length = 500)
    private String image;

    // 🔹 Giá theo từng size
    private Double priceSmall;
    private Double priceMedium;
    private Double priceLarge;

    // 🔹 Phần trăm giảm giá (áp dụng chung cho 3 size)
    private Integer discount = 0;

    // 🔹 Giá sau giảm cho từng size
    private Double discountPriceSmall;
    private Double discountPriceMedium;
    private Double discountPriceLarge;

    // 🔹 Số lượng tồn kho
    private Integer stock = 0;

    // ✅ Lấy giá theo size (ưu tiên giá sau giảm nếu có)
    public Double getPriceBySize(String size) {
        if (size == null) size = "medium";
        size = size.toLowerCase();

        switch (size) {
            case "small":
                return (discountPriceSmall != null) ? discountPriceSmall : priceSmall;
            case "large":
                return (discountPriceLarge != null) ? discountPriceLarge : priceLarge;
            default:
                return (discountPriceMedium != null) ? discountPriceMedium : priceMedium;
        }
    }

    // ✅ Tính giá sau giảm cho từng size
    public void calculateDiscountPrices() {
        double rate = (discount != null && discount > 0) ? (discount / 100.0) : 0.0;

        if (priceSmall != null)
            discountPriceSmall = priceSmall - (priceSmall * rate);
        if (priceMedium != null)
            discountPriceMedium = priceMedium - (priceMedium * rate);
        if (priceLarge != null)
            discountPriceLarge = priceLarge - (priceLarge * rate);
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIngredients() {
        return ingredients;
    }

    public void setIngredients(String ingredients) {
        this.ingredients = ingredients;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public Double getPriceSmall() {
        return priceSmall;
    }

    public void setPriceSmall(Double priceSmall) {
        this.priceSmall = priceSmall;
    }

    public Double getPriceMedium() {
        return priceMedium;
    }

    public void setPriceMedium(Double priceMedium) {
        this.priceMedium = priceMedium;
    }

    public Double getPriceLarge() {
        return priceLarge;
    }

    public void setPriceLarge(Double priceLarge) {
        this.priceLarge = priceLarge;
    }

    public Integer getDiscount() {
        return discount;
    }

    public void setDiscount(Integer discount) {
        this.discount = discount;
    }

    public Double getDiscountPriceSmall() {
        return discountPriceSmall;
    }

    public void setDiscountPriceSmall(Double discountPriceSmall) {
        this.discountPriceSmall = discountPriceSmall;
    }

    public Double getDiscountPriceMedium() {
        return discountPriceMedium;
    }

    public void setDiscountPriceMedium(Double discountPriceMedium) {
        this.discountPriceMedium = discountPriceMedium;
    }

    public Double getDiscountPriceLarge() {
        return discountPriceLarge;
    }

    public void setDiscountPriceLarge(Double discountPriceLarge) {
        this.discountPriceLarge = discountPriceLarge;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }
}
