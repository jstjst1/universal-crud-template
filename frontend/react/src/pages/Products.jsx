import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { Link } from 'react-router-dom';
import { productsAPI } from '../lib/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  Package, 
  Plus, 
  Search, 
  Filter,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Products = () => {
  const { isAuthenticated } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('active');

  const { data, isLoading, error } = useQuery(
    ['products', page, search, category, status],
    () => productsAPI.getAll({ 
      page, 
      limit: 12, 
      search: search || undefined,
      category_id: category || undefined,
      status 
    }),
    {
      keepPreviousData: true
    }
  );

  const products = data?.data?.data?.products || [];
  const pagination = data?.data?.data?.pagination || {};

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
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
            Failed to load products
          </h2>
          <p className="text-gray-600 mb-4">
            {error.response?.data?.message || error.message}
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Package className="h-8 w-8 mr-3 text-primary-600" />
              Products
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your product catalog
            </p>
          </div>
          
          {isAuthenticated && (
            <Link to="/products/create" className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="card-body">
          <form onSubmit={handleSearchSubmit} className="space-y-4 md:space-y-0 md:flex md:items-end md:space-x-4">
            <div className="flex-1">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input pl-10"
                  placeholder="Search by name or description..."
                />
                <Search className="h-5 w-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="input"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="">All</option>
              </select>
            </div>

            <button type="submit" className="btn-primary">
              <Filter className="h-5 w-5 mr-2" />
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {search ? 'Try adjusting your search criteria' : 'Get started by adding your first product'}
          </p>
          {isAuthenticated && (
            <Link to="/products/create" className="btn-primary">
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <div key={product.id} className="card hover:shadow-lg transition-shadow">
                {product.image_url && (
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="card-body">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <span className={`badge ${product.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                      {product.status}
                    </span>
                  </div>
                  
                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl font-bold text-primary-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Stock: {product.quantity}
                    </span>
                  </div>
                  
                  {product.category_name && (
                    <div className="mb-4">
                      <span className="badge badge-primary">
                        {product.category_name}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex space-x-2">
                    <Link
                      to={`/products/${product.id}`}
                      className="btn-outline flex-1 justify-center"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                    
                    {isAuthenticated && (
                      <Link
                        to={`/products/${product.id}/edit`}
                        className="btn-primary flex-1 justify-center"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((pagination.current_page - 1) * pagination.items_per_page) + 1} to{' '}
                {Math.min(pagination.current_page * pagination.items_per_page, pagination.total_items)} of{' '}
                {pagination.total_items} results
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={!pagination.has_prev}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                <span className="px-4 py-2 text-sm font-medium text-gray-700">
                  Page {pagination.current_page} of {pagination.total_pages}
                </span>
                
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={!pagination.has_next}
                  className="btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Products;
