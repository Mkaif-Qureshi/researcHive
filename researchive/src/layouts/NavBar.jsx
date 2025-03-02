import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import themeConfig from '../../themeConfig.js'; // Import the theme configuration
import { useAuth } from "../context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';

const Navbar = () => {
  const { currentUser, logout } = useAuth();


  return (
    <nav className="fixed top-0 left-0 w-full bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left side - Logo/Website Name */}
          <div className="flex-shrink-0 flex items-center space-x-2">
            <Link to="/" className="flex items-center space-x-2">
              <img
                src="/logo.png"  // Change this path to your actual logo location
                alt="researcHive Logo"
                className="h-12 w-12"  // Adjust size as needed
              />
              <span className={`text-2xl font-bold text-${themeConfig.colors.primary}`}>
                researcHive
              </span>
            </Link>
          </div>


          {/* Middle - Navigation Links */}
          {currentUser && <div className="hidden md:flex space-x-8">
            <Link to="/" className={`text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} px-3 py-2 rounded-md font-medium`}>
              Home
            </Link>
            <Link to="/dashboard" className={`text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} px-3 py-2 rounded-md font-medium`}>
              Dashboard
            </Link>
            <Link to="/communities" className={`text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} px-3 py-2 rounded-md font-medium`}>
              Communities
            </Link>
            <Link to="/Chat" className={`text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} px-3 py-2 rounded-md font-medium`}>
             Chat
            </Link>
            <Link to="/collabrator" className={`text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} px-3 py-2 rounded-md font-medium`}>
              Meet
            </Link>

          </div>}

          {/* Right side - Auth Section */}
          <div className="flex items-center space-x-4">
            {currentUser && <Link to="/profile" className={`text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover}rounded-md font-medium`}>
              {`${currentUser.name.split(" ")[0]}`}
            </Link>}
            {currentUser ?
              (
                <Link to="/profile">
                  <Avatar className="h-11 w-11">
                    <AvatarImage src={currentUser.profile_pic} alt="Profile" />
                    <AvatarFallback>{currentUser.name?.charAt(0) || "U"}</AvatarFallback>
                  </Avatar>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline2" size="sm" className={`text-${themeConfig.colors.primary} border-${themeConfig.colors.primary} hover:bg-blue-50`}>
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" variant="button" className={`bg-black text-white hover:bg-${themeConfig.colors.primaryHover}`}>
                      Sign up
                    </Button>
                  </Link>
                </>
              )}
          </div>
        </div>
      </div>

      {/* Mobile menu, toggle classes based on menu state */}
      <div className="md:hidden hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} hover:bg-gray-50`}>
            Home
          </Link>
          <Link to="/profile" className={`block px-3 py-2 rounded-md text-base font-medium text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} hover:bg-gray-50`}>
            Home
          </Link>
          <Link to="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} hover:bg-gray-50`}>
            Dashboard
          </Link>
          <Link to="/communities" className={`block px-3 py-2 rounded-md text-base font-medium text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} hover:bg-gray-50`}>
            Communities
          </Link>
          <Link to="/Chat" className={`block px-3 py-2 rounded-md text-base font-medium text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} hover:bg-gray-50`}>
            Chat
          </Link>
          <Link to="/meet" className={`block px-3 py-2 rounded-md text-base font-medium text-${themeConfig.colors.text} hover:text-${themeConfig.colors.textHover} hover:bg-gray-50`}>
            meet
          </Link>
        </div>
        <div className="pt-4 pb-3 border-t border-gray-200">
          <div className="flex items-center px-5 space-x-3">
            <Link to="/login" className={`block w-full text-center px-4 py-2 border border-${themeConfig.colors.primary} rounded-md shadow-sm text-sm font-medium text-${themeConfig.colors.primary} bg-white hover:bg-${themeConfig.colors.primaryHover}`}>
              Log in
            </Link>
            <Link to="/signup" className={`block w-full text-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${themeConfig.colors.primary} hover:bg-${themeConfig.colors.primaryHover}`}>
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
