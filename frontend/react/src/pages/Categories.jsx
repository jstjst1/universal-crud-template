import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { categoriesAPI } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import Modal from '../components/Modal';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Tag,
  Calendar,
  Package
} from 'lucide-react';

const Categories = () => {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm();

  // Fetch categories
  const { data, isLoading, error } = useQuery('categories', categoriesAPI.getAll);

  // Create mutation
  const createMutation = useMutation(categoriesAPI.create, {
    onSuccess: (data) => {
      if (data?.data?.success) {
        toast.success('Category created successfully!');
        queryClient.invalidateQueries('categories');
        setShowCreateModal(false);
        reset();
      } else {
        toast.error(data?.data?.message || 'Failed to create category');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  });

  // Update mutation
  const updateMutation = useMutation(
    ({ id, data }) => categoriesAPI.update(id, data),
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success('Category updated successfully!');
          queryClient.invalidateQueries('categories');
          setShowEditModal(false);
          setSelectedCategory(null);
          reset();
        } else {
          toast.error(data?.data?.message || 'Failed to update category');
        }
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update category');
      }
    }
  );

  // Delete mutation
  const deleteMutation = useMutation(categoriesAPI.delete, {
    onSuccess: (data) => {
      if (data?.data?.success) {
        toast.success('Category deleted successfully!');
        queryClient.invalidateQueries('categories');
        setShowDeleteModal(false);
        setSelectedCategory(null);
      } else {
        toast.error(data?.data?.message || 'Failed to delete category');
      }
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  });

  const onCreateSubmit = (data) => {
    createMutation.mutate(data);
  };

  const onEditSubmit = (data) => {
    updateMutation.mutate({ id: selectedCategory.id, data });
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    reset({
      name: category.name,
      description: category.description || ''
    });
    setShowEditModal(true);
  };

  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    deleteMutation.mutate(selectedCategory.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error loading categories
          </h2>
          <p className="text-gray-600">
            {error.response?.data?.message || 'Something went wrong'}
          </p>
        </div>
      </div>
    );
  }

  const categories = data?.data?.success ? data.data.data.categories : [];
  
  // Filter categories based on search term
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="mt-2 text-gray-600">
              Manage product categories
            </p>
          </div>
          
          {isAuthenticated && user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search categories..."
            className="form-input pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="card hover:shadow-lg transition-shadow">
              <div className="card-body">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="bg-primary-100 rounded-lg p-2 mr-3">
                      <Tag className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Package className="h-4 w-4 mr-1" />
                        {category.product_count || 0} products
                      </div>
                    </div>
                  </div>
                  
                  {isAuthenticated && user?.role === 'admin' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(category)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Edit category"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(category)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>

                {category.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center text-xs text-gray-400">
                  <Calendar className="h-4 w-4 mr-1" />
                  Created {new Date(category.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Tag className="h-24 w-24 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchTerm ? 'No categories found' : 'No categories yet'}
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm 
              ? `No categories match "${searchTerm}"`
              : 'Get started by creating your first category'
            }
          </p>
          {!searchTerm && isAuthenticated && user?.role === 'admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Category
            </button>
          )}
        </div>
      )}

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          reset();
        }}
        title="Create New Category"
      >
        <form onSubmit={handleSubmit(onCreateSubmit)} className="space-y-4">
          <div>
            <label className="form-label">
              Category Name *
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter category name"
              {...register('name', {
                required: 'Category name is required',
                minLength: {
                  value: 2,
                  message: 'Category name must be at least 2 characters'
                }
              })}
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              rows={3}
              className="form-input"
              placeholder="Enter category description"
              {...register('description')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                reset();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading}
              className="btn-primary"
            >
              {createMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Creating...
                </>
              ) : (
                'Create Category'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCategory(null);
          reset();
        }}
        title="Edit Category"
      >
        <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
          <div>
            <label className="form-label">
              Category Name *
            </label>
            <input
              type="text"
              className={`form-input ${errors.name ? 'border-red-500' : ''}`}
              placeholder="Enter category name"
              {...register('name', {
                required: 'Category name is required',
                minLength: {
                  value: 2,
                  message: 'Category name must be at least 2 characters'
                }
              })}
            />
            {errors.name && (
              <p className="form-error">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="form-label">
              Description
            </label>
            <textarea
              rows={3}
              className="form-input"
              placeholder="Enter category description"
              {...register('description')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedCategory(null);
                reset();
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isLoading}
              className="btn-primary"
            >
              {updateMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Updating...
                </>
              ) : (
                'Update Category'
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCategory(null);
        }}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete the category "{selectedCategory?.name}"? 
            This action cannot be undone.
          </p>
          
          {selectedCategory?.product_count > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ This category has {selectedCategory.product_count} products associated with it. 
                Deleting this category will remove the category association from those products.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedCategory(null);
              }}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={deleteMutation.isLoading}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              {deleteMutation.isLoading ? (
                <>
                  <LoadingSpinner size="sm" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Category
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Categories;
