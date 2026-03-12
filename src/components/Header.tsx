import { useState } from 'react';
import { ChefHat, User, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Auth from './Auth';

export default function Header() {
  const [showAuth, setShowAuth] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <ChefHat className="text-orange-500" size={32} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">
                Nomigo
              </h1>
            </div>

            <nav className="flex items-center space-x-4">
              {user ? (
                <>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50">
                    <Heart size={20} />
                    <span className="hidden sm:inline">Favorites</span>
                  </button>
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors px-3 py-2 rounded-lg hover:bg-orange-50">
                    <User size={20} />
                    <span className="hidden sm:inline">Profile</span>
                  </button>
                  <button
                    onClick={() => signOut()}
                    className="flex items-center space-x-2 text-gray-700 hover:text-red-500 transition-colors px-3 py-2 rounded-lg hover:bg-red-50"
                  >
                    <LogOut size={20} />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAuth(true)}
                  className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-2 rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-lg"
                >
                  Sign In
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>

      {showAuth && <Auth onClose={() => setShowAuth(false)} />}
    </>
  );
}
