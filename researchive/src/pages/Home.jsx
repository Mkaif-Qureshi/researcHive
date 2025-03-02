import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FiSearch, FiBookOpen, FiUsers, FiFileText, FiAward } from 'react-icons/fi';
import { motion } from 'framer-motion';

const Home = () => {
  const { currentUser } = useAuth();
  const [showVideo, setShowVideo] = useState(true);
  
  useEffect(() => {
    // Hide video after 5 seconds
    const timer = setTimeout(() => {
      setShowVideo(false);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, []);

  // Animation variants for content fade-in
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {showVideo ? (
        <div className="relative w-full h-screen flex justify-center items-center bg-black">
          <video 
            className="w-full h-full object-cover opacity-80"
            autoPlay 
            muted
            src="/research.mp4"
          />
          <div className="absolute inset-0 flex flex-col justify-center items-center text-white">
            <h1 className="text-6xl font-bold mb-4 text-center tracking-tight">
              Welcome, {currentUser?.name || 'Researcher'}
            </h1>
            <p className="text-2xl font-light text-center max-w-2xl">
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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
              Welcome, {currentUser?.name || 'Researcher'}
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with leading researchers, discover groundbreaking papers, and accelerate your research journey
            </p>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - About Platform */}
            <div className="lg:col-span-2 space-y-8">
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <CardTitle className="text-2xl">About Our Research Platform</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-blue-100 rounded-full text-blue-600 mr-4">
                        <FiBookOpen size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Discover Research</h3>
                        <p className="text-gray-600">
                          Access thousands of peer-reviewed papers across multiple disciplines, with powerful search tools to find exactly what you're looking for.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-full text-indigo-600 mr-4">
                        <FiUsers size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Connect with Experts</h3>
                        <p className="text-gray-600">
                          Build your professional network with leading researchers and experts in your field. Collaborate on projects and share insights.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full text-purple-600 mr-4">
                        <FiFileText size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-1">Manage Publications</h3>
                        <p className="text-gray-600">
                          Track your publications, monitor citations, and increase the visibility of your research with our comprehensive publishing tools.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* User Publications Section */}
              {currentUser?.publications && currentUser.publications.length > 0 && (
                <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                    <CardTitle className="text-2xl">Your Publications</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {currentUser.publications.slice(0, 3).map((pub, index) => (
                        <div key={index} className="p-4 border border-gray-100 rounded-xl hover:shadow-md transition-shadow bg-white">
                          <h3 className="text-lg font-semibold text-gray-800 mb-1">
                            {typeof pub === 'object' ? pub.description : pub}
                          </h3>
                          {typeof pub === 'object' && pub.name && (
                            <p className="text-sm text-gray-600 mb-2">{pub.name}</p>
                          )}
                          <Button variant="outline" size="sm" className="mt-2 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                            View Details
                          </Button>
                        </div>
                      ))}
                      
                      {currentUser.publications.length > 3 && (
                        <div className="text-center mt-4">
                          <Button variant="link" className="text-indigo-600">
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
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <CardTitle className="text-2xl">Your Research Profile</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-purple-700 mb-1">
                        {currentUser?.publications?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Publications</div>
                    </div>
                    
                    <div className="bg-indigo-50 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-indigo-700 mb-1">
                        {currentUser?.collaborators?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Collaborators</div>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-blue-700 mb-1">
                        {currentUser?.ongoing_projects?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Projects</div>
                    </div>
                    
                    <div className="bg-pink-50 p-4 rounded-xl text-center">
                      <div className="text-3xl font-bold text-pink-700 mb-1">
                        {currentUser?.interests?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Research Areas</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Quick Actions Card */}
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                  <CardTitle className="text-2xl">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <Button className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-6 flex items-center justify-center rounded-xl shadow-md">
                      <FiSearch className="mr-2" size={18} />
                      Search Research Papers
                    </Button>
                    
                    <Button className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-6 flex items-center justify-center rounded-xl shadow-md">
                      <FiUsers className="mr-2" size={18} />
                      Find Collaborators
                    </Button>
                    
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 flex items-center justify-center rounded-xl shadow-md">
                      <FiFileText className="mr-2" size={18} />
                      Upload New Paper
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              {/* Expert Connection Section */}
              <Card className="overflow-hidden border-0 shadow-xl rounded-2xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-pink-600 to-red-600 text-white">
                  <CardTitle className="text-2xl">Recommended Experts</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Expert 1 */}
                    <div className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <img className="w-12 h-12 rounded-full border-2 border-pink-100" src="https://randomuser.me/api/portraits/women/32.jpg" alt="Expert" />
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800">Dr. Sarah Johnson</h3>
                        <p className="text-sm text-gray-600">AI & Neural Networks</p>
                      </div>
                    </div>
                    
                    {/* Expert 2 */}
                    <div className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <img className="w-12 h-12 rounded-full border-2 border-blue-100" src="https://randomuser.me/api/portraits/men/45.jpg" alt="Expert" />
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800">Prof. David Chen</h3>
                        <p className="text-sm text-gray-600">Quantum Computing</p>
                      </div>
                    </div>
                    
                    {/* Expert 3 */}
                    <div className="flex items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                      <img className="w-12 h-12 rounded-full border-2 border-purple-100" src="https://randomuser.me/api/portraits/women/68.jpg" alt="Expert" />
                      <div className="ml-4">
                        <h3 className="font-semibold text-gray-800">Dr. Maya Patel</h3>
                        <p className="text-sm text-gray-600">Computational Biology</p>
                      </div>
                    </div>
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