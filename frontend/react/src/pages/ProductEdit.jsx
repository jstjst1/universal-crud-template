import React, { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from 'react-query';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { productsAPI, categoriesAPI } from '../lib/api';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Save, X, Upload } from 'lucide-react';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [imagePreview, setImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  // Fetch product data
  const { data: productData, isLoading: productLoading, error: productError } = useQuery(
    ['product', id],
    () => productsAPI.getById(id),
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          const product = data.data.data.product;
          reset({
            name: product.name || '',
            description: product.description || '',
            price: product.price || '',
            quantity: product.quantity || '',
            category_id: product.category_id || '',
            status: product.status || 'active',
            image_url: product.image_url || ''
          });
          setImagePreview(product.image_url);
        }
      }
    }
  );

  // Fetch categories for dropdown
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery(
    'categories',
    categoriesAPI.getAll
  );

  const updateMutation = useMutation(
    (data) => productsAPI.update(id, data),
    {
      onSuccess: (data) => {
        if (data?.data?.success) {
          toast.success('Product updated successfully!');
          queryClient.invalidateQueries('products');
          queryClient.invalidateQueries(['product', id]);
          navigate(`/products/${id}`);
        } else {
          toast.error(data?.data?.message || 'Failed to update product');
        }
      },
      onError: (error) => {
        console.error('Update error:', error);
        toast.error(error.response?.data?.message || 'Failed to update product');
      }
    }
  );

  const onSubmit = (data) => {
    // Convert price and quantity to numbers
    const productData = {
      ...data,
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity),
      category_id: data.category_id ? parseInt(data.category_id) : null
    };

    updateMutation.mutate(productData);
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setValue('image_url', url);
    setImagePreview(url);
  };

  if (productLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (productError || !productData?.data?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product not found
          </h2>
          <Link to="/products" className="btn-primary">
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  const product = productData.data.data.product;
  const categories = categoriesData?.data?.success ? categoriesData.data.data.categories : [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to={`/products/${id}`} className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Product
        </Link>
        
        <h1 className="text-3xl font-bold text-gray-900">
          Edit Product
        </h1>
        <p className="mt-2 text-gray-600">
          Update {product.name}
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Basic Info */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Basic Information
                </h3>

                {/* Product Name */}
                <div>
                  <label className="form-label">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                    placeholder="Enter product name"
                    {...register('name', {
                      required: 'Product name is required',
                      minLength: {
                        value: 2,
                        message: 'Product name must be at least 2 characters'
                      }
                    })}
                  />
                  {errors.name && (
                    <p className="form-error">{errors.name.message}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="form-label">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    className="form-input"
                    placeholder="Enter product description"
                    {...register('description')}
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="form-label">
                    Category
                  </label>
                  {categoriesLoading ? (
                    <div className="flex items-center py-2">
                      <LoadingSpinner size="sm" />
                      <span className="ml-2 text-gray-600">Loading categories...</span>
                    </div>
                  ) : (
                    <select
                      className="form-input"
                      {...register('category_id')}
                    >
                      <option value="">Select a category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className="form-label">
                    Status
                  </label>
                  <select
                    className="form-input"
                    {...register('status')}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Right Column - Pricing & Image */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                  Pricing & Media
                </h3>

                {/* Price */}
                <div>
                  <label className="form-label">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className={`form-input ${errors.price ? 'border-red-500' : ''}`}
                    placeholder="0.00"
                    {...register('price', {
                      required: 'Price is required',
                      min: {
                        value: 0.01,
                        message: 'Price must be greater than 0'
                      }
                    })}
                  />
                  {errors.price && (
                    <p className="form-error">{errors.price.message}</p>
                  )}
                </div>

                {/* Quantity */}
                <div>
                  <label className="form-label">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    min="0"
                    className={`form-input ${errors.quantity ? 'border-red-500' : ''}`}
                    placeholder="0"
                    {...register('quantity', {
                      required: 'Quantity is required',
                      min: {
                        value: 0,
                        message: 'Quantity cannot be negative'
                      }
                    })}
                  />
                  {errors.quantity && (
                    <p className="form-error">{errors.quantity.message}</p>
                  )}
                </div>

                {/* Image URL */}
                <div>
                  <label className="form-label">
                    Image URL
                  </label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://example.com/image.jpg"
                    {...register('image_url')}
                    onChange={handleImageUrlChange}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Enter a valid URL for the product image
                  </p>
                </div>

                {/* Image Preview */}
                {imagePreview && (
                  <div>
                    <label className="form-label">
                      Image Preview
                    </label>
                    <div className="border border-gray-300 rounded-lg p-4">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300?text=Invalid+Image';
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Placeholder for future file upload */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    File upload coming soon
                  </p>
                  <p className="text-sm text-gray-400">
                    For now, use the image URL field above
                  </p>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link to={`/products/${id}`} className="btn-secondary">
                <X className="h-5 w-5 mr-2" />
                Cancel
              </Link>
              
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
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Product
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductEdit;
