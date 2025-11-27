import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X, User, LogOut, Sparkles, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { logOut } from '../services/firebase';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white/80 dark:bg-prism-darker/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-prism-gradient rounded-lg blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
                <Sparkles className="h-8 w-8 text-prism-violet dark:text-prism-cyan relative z-10 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-2xl font-bold bg-prism-gradient bg-clip-text text-transparent">
                Prism
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/features" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium transition-colors">
              Features
            </Link>
            <Link to="/explore" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium transition-colors">
              Explore Careers
            </Link>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium transition-colors">
                  Dashboard
                </Link>
                <Link to="/journey" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium flex items-center transition-colors">
                  <Rocket className="h-4 w-4 mr-1" />
                  Career Journey
                </Link>
                <Link to="/assessment" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium transition-colors">
                  Assessment
                </Link>
                <Link to="/mentor" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium transition-colors">
                  AI Mentor
                </Link>
                <ThemeToggle />
                <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-700">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{currentUser.email?.split('@')[0]}</span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-prism-violet dark:hover:text-prism-cyan font-medium transition-colors">
                  Login
                </Link>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
                <ThemeToggle />
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-700">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 dark:bg-prism-darker/95 backdrop-blur-xl border-t border-gray-200 dark:border-gray-700">
          <div className="px-4 pt-2 pb-4 space-y-2">
            <Link
              to="/features"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Features
            </Link>
            <Link
              to="/explore"
              className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Explore Careers
            </Link>
            {currentUser ? (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/journey"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg flex items-center transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Career Journey
                </Link>
                <Link
                  to="/assessment"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Assessment
                </Link>
                <Link
                  to="/mentor"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  AI Mentor
                </Link>
                <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 dark:border-gray-700 mt-2">
                  <ThemeToggle />
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-1 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 bg-prism-gradient text-white rounded-lg text-center font-semibold hover:opacity-90 transition-opacity"
                  onClick={() => setIsOpen(false)}
                >
                  Get Started
                </Link>
                <div className="px-3 py-2">
                  <ThemeToggle />
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
