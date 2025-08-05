import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Heart, Code } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company info */}
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Universal CRUD Template
              </h3>
              <p className="text-gray-600 mb-4">
                A comprehensive template for CRUD operations supporting multiple technology stacks. 
                Perfect for quickly starting Fiverr projects or any web development work.
              </p>
              <div className="flex items-center space-x-4">
                <a
                  href="https://github.com"
                  className="text-gray-400 hover:text-gray-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="h-5 w-5" />
                </a>
                <a
                  href="https://github.com"
                  className="text-gray-400 hover:text-gray-500"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Code className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-gray-900">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/products" className="text-gray-600 hover:text-gray-900">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/categories" className="text-gray-600 hover:text-gray-900">
                    Categories
                  </Link>
                </li>
              </ul>
            </div>

            {/* Tech stack */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">
                Tech Stack
              </h3>
              <ul className="space-y-2">
                <li className="text-gray-600">React + Vite</li>
                <li className="text-gray-600">Node.js + Express</li>
                <li className="text-gray-600">MySQL / PostgreSQL</li>
                <li className="text-gray-600">Tailwind CSS</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-gray-500 text-sm">
                © {currentYear} Universal CRUD Template. Perfect for Fiverr projects.
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                Made with <Heart className="h-4 w-4 mx-1 text-red-500" /> for developers
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
