package com.universalcrud.repository;

import com.universalcrud.entity.Product;
import com.universalcrud.entity.Category;
import com.universalcrud.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByCategory(Category category);
    
    List<Product> findByCategoryId(Long categoryId);
    
    List<Product> findByCreatedBy(User createdBy);
    
    List<Product> findByIsActive(Boolean isActive);
    
    Optional<Product> findBySku(String sku);
    
    boolean existsBySku(String sku);
    
    @Query("SELECT p FROM Product p WHERE p.name LIKE %:name%")
    List<Product> findByNameContaining(@Param("name") String name);
    
    @Query("SELECT p FROM Product p WHERE p.price BETWEEN :minPrice AND :maxPrice")
    List<Product> findByPriceBetween(@Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice);
    
    @Query("SELECT p FROM Product p WHERE p.quantity < :threshold")
    List<Product> findLowStockProducts(@Param("threshold") Integer threshold);
    
    @Query("SELECT p FROM Product p WHERE p.quantity = 0")
    List<Product> findOutOfStockProducts();
    
    @Query("SELECT p FROM Product p JOIN FETCH p.category WHERE p.isActive = true")
    List<Product> findActiveProductsWithCategory();
    
    @Query("SELECT p FROM Product p LEFT JOIN FETCH p.category LEFT JOIN FETCH p.createdBy WHERE p.id = :id")
    Optional<Product> findByIdWithDetails(@Param("id") Long id);
    
    Page<Product> findByIsActiveOrderByCreatedAtDesc(Boolean isActive, Pageable pageable);
    
    Page<Product> findByCategoryIdAndIsActiveOrderByCreatedAtDesc(Long categoryId, Boolean isActive, Pageable pageable);
    
    @Query("SELECT p FROM Product p WHERE p.isActive = true AND " +
           "(p.name LIKE %:searchTerm% OR p.description LIKE %:searchTerm% OR p.sku LIKE %:searchTerm%)")
    Page<Product> searchActiveProducts(@Param("searchTerm") String searchTerm, Pageable pageable);
    
    @Query("SELECT COUNT(p) FROM Product p WHERE p.isActive = true")
    long countActiveProducts();
    
    @Query("SELECT SUM(p.quantity * p.price) FROM Product p WHERE p.isActive = true")
    BigDecimal calculateTotalInventoryValue();
}
