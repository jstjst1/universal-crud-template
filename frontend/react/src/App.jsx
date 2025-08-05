import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import ProductCreate from './pages/ProductCreate';
import ProductEdit from './pages/ProductEdit';
import Categories from './pages/Categories';
import Users from './pages/Users';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes with layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        
        {/* Products routes */}
        <Route path="products" element={<Products />} />
        <Route path="products/:id" element={<ProductDetails />} />
        <Route 
          path="products/create" 
          element={
            <ProtectedRoute>
              <ProductCreate />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="products/:id/edit" 
          element={
            <ProtectedRoute>
              <ProductEdit />
            </ProtectedRoute>
          } 
        />
        
        {/* Categories routes */}
        <Route path="categories" element={<Categories />} />
        
        {/* User management routes */}
        <Route 
          path="users" 
          element={
            <ProtectedRoute adminOnly>
              <Users />
            </ProtectedRoute>
          } 
        />
        
        {/* Profile routes */}
        <Route 
          path="profile" 
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
