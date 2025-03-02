import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiSearch, FiBookOpen, FiUsers, FiFileText, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Home = () => {
  const { currentUser } = useAuth();
  const [showVideo, setShowVideo] = useState(false);
  
  useEffect(() => {
    // Check if this is initial load or refresh
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      // This is first visit or a refresh - show video
      setShowVideo(true);
      
      // Hide video after 5 seconds
      const timer = setTimeout(() => {
        setShowVideo(false);
        // Mark that user has seen welcome in this session
        localStorage.setItem('hasSeenWelcome', 'true');
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Listen for page refresh or login event
  useEffect(() => {
    // Function to handle page refresh (executed on component mount)
    const handlePageRefresh = () => {
      // Clear the "hasSeenWelcome" flag when page is being refreshed
      window.addEventListener('beforeunload', () => {
        localStorage.removeItem('hasSeenWelcome');
      });
    };
    
    handlePageRefresh();
    
    // Clean up the event listener when component unmounts
    return () => {
      window.removeEventListener('beforeunload', () => {
        localStorage.removeItem('hasSeenWelcome');
      });
    };
  }, []);

  // Add an effect to reset welcome video on login
  useEffect(() => {
    // If user just logged in (currentUser just appeared)
    if (currentUser) {
      // Check if this is a new login rather than just a component re-render
      const userLoginTime = localStorage.getItem('userLoginTime');
      const currentTime = new Date().getTime();
      
      if (!userLoginTime || (currentTime - parseInt(userLoginTime)) > 60000) { // 1 minute threshold
        // Reset welcome screen for new login
        localStorage.removeItem('hasSeenWelcome');
        setShowVideo(true);
        
        // Store current login time
        localStorage.setItem('userLoginTime', currentTime.toString());
        
        // Hide video after 5 seconds
        const timer = setTimeout(() => {
          setShowVideo(false);
          // Mark that user has seen welcome in this session
          localStorage.setItem('hasSeenWelcome', 'true');
        }, 2000);
        
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser]);

  // Animation variants for content fade-in
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-white text-black">
      {showVideo ? (
        <div className="relative w-full h-screen flex justify-center items-center bg-gray-100">
          <video 
            className="w-full h-full object-cover opacity-80"
            autoPlay 
            muted
            src="/research.mp4"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center">
            <h1 className="text-6xl font-bold mb-4 text-center tracking-tight text-black">
              Welcome, {currentUser?.name || 'Researcher'}
            </h1>
            <p className="text-2xl font-light text-center max-w-2xl text-black">
              Your gateway to collaborative research & innovation
            </p>
          </div>
        </div>
      ) : (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="container mx-auto px-6 py-12"
        >
          {/* Welcome Header */}
          <div className="text-center mb-16 mt-0">
            <h1 className="text-4xl md:text-5xl font-bold text-black mb-4">
              Welcome, {currentUser?.name || 'Researcher'}
            </h1>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Connect with leading researchers, discover groundbreaking papers, and accelerate your research journey
            </p>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - About Platform */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90">
                <CardHeader className="bg-white text-black">
                  <CardTitle className="text-2xl">About Our Research Platform</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-gray-200 rounded-full text-black mr-4">
                        <FiBookOpen size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Discover Research</h3>
                        <p className="text-gray-700">
                          Access thousands of peer-reviewed papers across multiple disciplines, with powerful search tools to find exactly what you're looking for.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-gray-200 rounded-full text-black mr-4">
                        <FiUsers size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Connect with Experts</h3>
                        <p className="text-gray-700">
                          Build your professional network with leading researchers and experts in your field. Collaborate on projects and share insights.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-gray-200 rounded-full text-black mr-4">
                        <FiFileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Manage Publications</h3>
                        <p className="text-gray-700">
                          Track your publications, monitor citations, and increase the visibility of your research with our comprehensive publishing tools.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Publications Section */}
              {currentUser?.publications && currentUser.publications.length > 0 && (
                <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90">
                  <CardHeader className="bg-white text-black">
                    <CardTitle className="text-2xl">Your Publications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {currentUser.publications.slice(0, 3).map((pub, index) => (
                        <div key={index} className="p-4 border border-gray-300 rounded-xl hover:shadow-md transition-shadow bg-white/70">
                          <h3 className="text-lg font-semibold text-black mb-1">
                            {typeof pub === 'object' ? pub.description : pub}
                          </h3>
                          {typeof pub === 'object' && pub.name && (
                            <p className="text-sm text-gray-700 mb-2">{pub.name}</p>
                          )}
                          <Button variant="outline" size="sm" className="mt-2 text-gray-700 border-gray-500 hover:bg-gray-200">
                            View Details
                          </Button>
                        </div>
                      ))}
                      
                      {currentUser.publications.length > 3 && (
                        <div className="text-center mt-4">
                          <Button variant="link" className="text-gray-700">
                            View All Publications ({currentUser.publications.length})
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - User Stats and Quick Actions */}
            <div className="space-y-8">
              {/* User Stats Card */}
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90">
                <CardHeader className="bg-white text-black">
                  <CardTitle className="text-2xl">Your Research Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-200 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-black mb-1">
                        {currentUser?.publications?.length || 0}
                      </div>
                      <div className="text-sm text-gray-700">Publications</div>
                    </div>
                    
                    <div className="bg-gray-200 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-black mb-1">
                        {currentUser?.collaborators?.length || 0}
                      </div>
                      <div className="text-sm text-gray-700">Collaborators</div>
                    </div>
                    
                    <div className="bg-gray-200 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-black mb-1">
                        {currentUser?.ongoing_projects?.length || 0}
                      </div>
                      <div className="text-sm text-gray-700">Projects</div>
                    </div>
                    
                    <div className="bg-gray-200 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-black mb-1">
                        {currentUser?.interests?.length || 0}
                      </div>
                      <div className="text-sm text-gray-700">Research Areas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions Card */}
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90">
                <CardHeader className="bg-white text-black">
                  <CardTitle className="text-2xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button className="w-full bg-gray-800 text-white py-6 flex items-center justify-center rounded-xl shadow-md">
                      <FiSearch className="mr-2" size={18} />
                      Search Research Papers
                    </Button>
                    
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6 flex items-center justify-center rounded-xl shadow-md">
                      <FiUsers className="mr-2" size={18} />
                      Find Collaborators
                    </Button>
                    
                    <Button className="w-full bg-gray-800 hover:bg-gray-700 text-white py-6 flex items-center justify-center rounded-xl shadow-md">
                      <FiFileText className="mr-2" size={18} />
                      Upload New Paper
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Home;
