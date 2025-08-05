package com.universalcrud.service;

import com.universalcrud.entity.Category;
import com.universalcrud.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {
    
    @Autowired
    private CategoryRepository categoryRepository;
    
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }
    
    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }
    
    public Optional<Category> getCategoryByName(String name) {
        return categoryRepository.findByName(name);
    }
    
    public Category createCategory(Category category) {
        if (categoryRepository.existsByName(category.getName())) {
            throw new RuntimeException("Category with name '" + category.getName() + "' already exists");
        }
        return categoryRepository.save(category);
    }
    
    public Category updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        // Check if name is being changed and if it's already taken
        if (!category.getName().equals(categoryDetails.getName()) && 
            categoryRepository.existsByName(categoryDetails.getName())) {
            throw new RuntimeException("Category with name '" + categoryDetails.getName() + "' already exists");
        }
        
        category.setName(categoryDetails.getName());
        category.setDescription(categoryDetails.getDescription());
        
        return categoryRepository.save(category);
    }
    
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found with id: " + id));
        
        // Check if category has products
        long productCount = categoryRepository.countProductsByCategoryId(id);
        if (productCount > 0) {
            throw new RuntimeException("Cannot delete category with " + productCount + " products. Please remove products first.");
        }
        
        categoryRepository.delete(category);
    }
    
    public List<Category> searchCategoriesByName(String name) {
        return categoryRepository.findByNameContaining(name);
    }
    
    public List<Category> getAllCategoriesWithProducts() {
        return categoryRepository.findAllWithProducts();
    }
    
    public Optional<Category> getCategoryWithProducts(Long id) {
        return categoryRepository.findByIdWithProducts(id);
    }
    
    public long getProductCountByCategory(Long categoryId) {
        return categoryRepository.countProductsByCategoryId(categoryId);
    }
    
    public boolean existsByName(String name) {
        return categoryRepository.existsByName(name);
    }
    
    public boolean canDeleteCategory(Long id) {
        return categoryRepository.countProductsByCategoryId(id) == 0;
    }
}
