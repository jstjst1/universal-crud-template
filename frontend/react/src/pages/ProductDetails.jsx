import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from 'react-query';
import { productsAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { ArrowLeft, Edit, Package, DollarSign, BarChart3, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ProductDetails = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const { data, isLoading, error } = useQuery(
    ['product', id],
    () => productsAPI.getById(id)
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !data?.data?.success) {
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

  const product = data.data.data.product;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/products" className="text-primary-600 hover:text-primary-700 flex items-center mb-4">
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Products
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          
          {isAuthenticated && (
            <Link to={`/products/${product.id}/edit`} className="btn-primary">
              <Edit className="h-5 w-5 mr-2" />
              Edit Product
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Product Image */}
        <div className="lg:col-span-1">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
              }}
            />
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <Package className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Product Information
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm text-gray-500">Price</span>
                        <div className="text-2xl font-bold text-primary-600">
                          ${parseFloat(product.price).toFixed(2)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <BarChart3 className="h-5 w-5 text-gray-400 mr-3" />
                      <div>
                        <span className="text-sm text-gray-500">Stock Quantity</span>
                        <div className="text-lg font-semibold text-gray-900">
                          {product.quantity} units
                        </div>
                      </div>
                    </div>
                    
                    {product.category_name && (
                      <div className="flex items-center">
                        <Tag className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm text-gray-500">Category</span>
                          <div className="text-lg font-semibold text-gray-900">
                            {product.category_name}
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <div className="mr-3">
                        <span className="text-sm text-gray-500">Status</span>
                        <div>
                          <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                            {product.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Description
                  </h3>
                  
                  {product.description ? (
                    <p className="text-gray-600 whitespace-pre-wrap">
                      {product.description}
                    </p>
                  ) : (
                    <p className="text-gray-400 italic">
                      No description available
                    </p>
                  )}
                </div>
              </div>

              {/* Timestamps */}
              <div className="mt-8 pt-8 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Created</span>
                    <div className="text-sm text-gray-900">
                      {new Date(product.created_at).toLocaleString()}
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Last Updated</span>
                    <div className="text-sm text-gray-900">
                      {new Date(product.updated_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
