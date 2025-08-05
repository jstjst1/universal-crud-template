package com.universalcrud.service;

import com.universalcrud.entity.Product;
import com.universalcrud.entity.Category;
import com.universalcrud.entity.User;
import com.universalcrud.repository.ProductRepository;
import com.universalcrud.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class ProductService {
    
    @Autowired
    private ProductRepository productRepository;
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }
    
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
    
    public Optional<Product> getProductWithDetails(Long id) {
        return productRepository.findByIdWithDetails(id);
    }
    
    public Optional<Product> getProductBySku(String sku) {
        return productRepository.findBySku(sku);
    }
    
    public Product createProduct(Product product) {
        // Generate SKU if not provided
        if (product.getSku() == null || product.getSku().isEmpty()) {
            product.setSku(generateSku());
        } else if (productRepository.existsBySku(product.getSku())) {
            throw new RuntimeException("Product with SKU '" + product.getSku() + "' already exists");
        }
        
        // Validate category if provided
        if (product.getCategory() != null && product.getCategory().getId() != null) {
            Category category = categoryRepository.findById(product.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + product.getCategory().getId()));
            product.setCategory(category);
        }
        
        return productRepository.save(product);
    }
    
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        // Check if SKU is being changed and if it's already taken
        if (productDetails.getSku() != null && 
            !product.getSku().equals(productDetails.getSku()) && 
            productRepository.existsBySku(productDetails.getSku())) {
            throw new RuntimeException("Product with SKU '" + productDetails.getSku() + "' already exists");
        }
        
        // Validate category if provided
        if (productDetails.getCategory() != null && productDetails.getCategory().getId() != null) {
            Category category = categoryRepository.findById(productDetails.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDetails.getCategory().getId()));
            product.setCategory(category);
        }
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setQuantity(productDetails.getQuantity());
        product.setImage(productDetails.getImage());
        product.setIsActive(productDetails.getIsActive());
        
        if (productDetails.getSku() != null) {
            product.setSku(productDetails.getSku());
        }
        
        return productRepository.save(product);
    }
    
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        productRepository.delete(product);
    }
    
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryId(categoryId);
    }
    
    public List<Product> getProductsByUser(User user) {
        return productRepository.findByCreatedBy(user);
    }
    
    public List<Product> getActiveProducts() {
        return productRepository.findByIsActive(true);
    }
    
    public List<Product> getActiveProductsWithCategory() {
        return productRepository.findActiveProductsWithCategory();
    }
    
    public List<Product> searchProductsByName(String name) {
        return productRepository.findByNameContaining(name);
    }
    
    public List<Product> getProductsByPriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        return productRepository.findByPriceBetween(minPrice, maxPrice);
    }
    
    public List<Product> getLowStockProducts(Integer threshold) {
        return productRepository.findLowStockProducts(threshold);
    }
    
    public List<Product> getOutOfStockProducts() {
        return productRepository.findOutOfStockProducts();
    }
    
    public Page<Product> getActiveProductsPaginated(Pageable pageable) {
        return productRepository.findByIsActiveOrderByCreatedAtDesc(true, pageable);
    }
    
    public Page<Product> getProductsByCategoryPaginated(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndIsActiveOrderByCreatedAtDesc(categoryId, true, pageable);
    }
    
    public Page<Product> searchProducts(String searchTerm, Pageable pageable) {
        return productRepository.searchActiveProducts(searchTerm, pageable);
    }
    
    public long getActiveProductCount() {
        return productRepository.countActiveProducts();
    }
    
    public BigDecimal getTotalInventoryValue() {
        BigDecimal total = productRepository.calculateTotalInventoryValue();
        return total != null ? total : BigDecimal.ZERO;
    }
    
    public Product updateStock(Long id, Integer quantity) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setQuantity(quantity);
        return productRepository.save(product);
    }
    
    public Product adjustStock(Long id, Integer adjustment) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        int newQuantity = product.getQuantity() + adjustment;
        if (newQuantity < 0) {
            throw new RuntimeException("Insufficient stock. Available: " + product.getQuantity());
        }
        
        product.setQuantity(newQuantity);
        return productRepository.save(product);
    }
    
    public Product toggleProductStatus(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found with id: " + id));
        
        product.setIsActive(!product.getIsActive());
        return productRepository.save(product);
    }
    
    private String generateSku() {
        String sku;
        do {
            sku = "SKU-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (productRepository.existsBySku(sku));
        return sku;
    }
    
    public boolean existsBySku(String sku) {
        return productRepository.existsBySku(sku);
    }
}
