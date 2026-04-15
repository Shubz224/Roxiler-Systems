import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Home, User, Settings, Store } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          <div className="flex items-center space-x-2">
            <Store className="h-6 w-6 text-primary" />
            <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
              RateApp
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                {user.role === 'ADMIN' && (
                  <>
                    <Link to="/admin" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                      Dashboard
                    </Link>
                    <Link to="/admin/users" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                      Users
                    </Link>
                    <Link to="/admin/stores" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                      Stores
                    </Link>
                  </>
                )}
                {user.role === 'STORE_OWNER' && (
                  <Link to="/owner" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                    My Store
                  </Link>
                )}
                {user.role === 'USER' && (
                  <Link to="/stores" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors">
                    Stores
                  </Link>
                )}

                <div className="h-6 w-px bg-gray-200 mx-2"></div>
                
                <Link to="/change-password" className="text-gray-600 hover:text-gray-900 p-2 rounded-full hover:bg-gray-100 transition-colors" title="Settings">
                  <Settings className="h-5 w-5" />
                </Link>
                
                <button 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </>
            ) : (
              <div className="flex space-x-2">
                <Link to="/login" className="text-gray-700 hover:text-gray-900 font-medium px-4 py-2">
                  Login
                </Link>
                <Link to="/signup" className="bg-primary hover:bg-primary/90 text-white font-medium px-4 py-2 rounded-md transition-colors">
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
