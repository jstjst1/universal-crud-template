import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Tags, 
  Users, 
  BarChart3, 
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Code,
  Database,
  Smartphone
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Built with modern technologies for optimal performance'
    },
    {
      icon: Shield,
      title: 'Secure by Default',
      description: 'JWT authentication, input validation, and SQL injection protection'
    },
    {
      icon: Globe,
      title: 'Multiple Tech Stacks',
      description: 'React, Angular, Node.js, Python, PHP, Java - choose what fits'
    },
    {
      icon: Code,
      title: 'Clean Code',
      description: 'Well-structured, documented, and maintainable codebase'
    },
    {
      icon: Database,
      title: 'Database Flexibility',
      description: 'MySQL, PostgreSQL, SQLite, and MongoDB support'
    },
    {
      icon: Smartphone,
      title: 'Responsive Design',
      description: 'Mobile-first approach with beautiful UI components'
    }
  ];

  const quickStats = [
    { label: 'Technology Stacks', value: '8+', icon: Code },
    { label: 'Database Options', value: '4', icon: Database },
    { label: 'API Endpoints', value: '20+', icon: Globe },
    { label: 'Ready Components', value: '50+', icon: Package },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Universal CRUD Template
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8 max-w-3xl mx-auto">
              Your complete solution for rapid web development. Multiple tech stacks, 
              database options, and ready-to-use components for any Fiverr project.
            </p>
            
            {isAuthenticated ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/products" className="btn-secondary text-lg px-8 py-3">
                  View Products
                </Link>
                <Link to="/products/create" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Create Product
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Get Started Free
                </Link>
                <Link to="/login" className="btn-secondary text-lg px-8 py-3">
                  Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {quickStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-primary-100 rounded-full">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-600">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Start Fast
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A comprehensive template that saves you weeks of development time
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-primary-100 rounded-lg mr-4">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {isAuthenticated && (
        <div className="bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Welcome back, {user.first_name || user.username}!
              </h2>
              <p className="text-xl text-gray-600">
                What would you like to do today?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link 
                to="/products" 
                className="card p-6 hover:shadow-lg transition-all hover:scale-105 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <Package className="h-6 w-6 text-primary-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Manage Products
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      View, create, edit, and delete products
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>

              <Link 
                to="/categories" 
                className="card p-6 hover:shadow-lg transition-all hover:scale-105 group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center mb-2">
                      <Tags className="h-6 w-6 text-primary-600 mr-3" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        Categories
                      </h3>
                    </div>
                    <p className="text-gray-600">
                      Organize products with categories
                    </p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                </div>
              </Link>

              {user.role === 'admin' && (
                <Link 
                  to="/users" 
                  className="card p-6 hover:shadow-lg transition-all hover:scale-105 group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <Users className="h-6 w-6 text-primary-600 mr-3" />
                        <h3 className="text-lg font-semibold text-gray-900">
                          User Management
                        </h3>
                      </div>
                      <p className="text-gray-600">
                        Manage system users and permissions
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tech Stack Section */}
      <div className="bg-gray-900 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Choose Your Stack
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Multiple technology options to match your project requirements
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              'React', 'Angular', 'Node.js', 'Python',
              'PHP', 'Java', 'MySQL', 'PostgreSQL'
            ].map((tech, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-800 rounded-lg p-4 mb-2">
                  <div className="text-2xl font-bold text-white">
                    {tech}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Your Next Project?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Get started with our universal CRUD template and launch your application in minutes, not weeks.
          </p>
          
          {!isAuthenticated && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3">
                Start Building Now
              </Link>
              <Link to="/products" className="btn-secondary text-lg px-8 py-3">
                View Demo
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
