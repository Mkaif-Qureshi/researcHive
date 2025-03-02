import React from 'react';
import { Mail, Phone, BookOpen, Layers, EyeIcon, Calendar, Clock, Linkedin, Twitter, Github, Globe } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import themeConfig from '../../themeConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser , logout } = useAuth();
  const navigate = useNavigate();
  const [profileData, setProfileData] = React.useState({
    timeSpentData: [
      { name: "Project 1", hours: 40 },
      { name: "Project 2", hours: 30 },
      { name: "Project 3", hours: 10 },
      { name: "Project 4", hours: 50 },
      { name: "Project 5", hours: 20 },
    ],
  });

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get social icon based on URL
  const getSocialIcon = (url) => {
    if (!url) return null;
    
    if (url.includes("github")) {
      return <Github className="w-6 h-6" />;
    } else if (url.includes("linkedin")) {
      return <Linkedin className="w-6 h-6" />;
    } else if (url.includes("twitter") || url.includes("x.com")) {
      return <Twitter className="w-6 h-6" />;
    } else {
      return <Globe className="w-6 h-6" />;
    }
  };

  if (!currentUser) {
    return <div className="p-6">Loading profile...</div>;
  }

  const handlelogout = () => {
    logout();
      navigate('/login');
  }

  const handlegotoUpdate = () => {
    navigate('/update-profile');
  }

  return (
    <div className="mx-4 my-10 space-y-6">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center">
          {/* Profile Picture */}
          <div className="mb-4 md:mb-0 mr-6">
            <Avatar className="h-32 w-32">
              <AvatarImage src={currentUser.profile_pic} alt="Profile" />
              <AvatarFallback>{currentUser.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Details */}
          <div className="flex-grow w-full">
            {/* Name and Status */}
            <div className="mb-2">
              <h1 className="text-2xl font-bold text-gray-800">{currentUser.name || "No Name"}</h1>
              <div className="flex items-center mt-1">
                <EyeIcon className="w-4 h-4 mr-2 text-blue-500" />
                <span className="text-sm text-gray-600">
                  Account: {currentUser.visibility ? "Public" : "Private"}
                </span>
              </div>
            </div>

            {/* Two-column layout for user details */}
            <div className="flex flex-col md:flex-row md:space-x-8 w-full">
              {/* First Column */}
              <div className="flex-1 space-y-3 mb-4 md:mb-0">
                {currentUser.email && (
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                )}

                {currentUser.mobile_number && (
                  <div className="flex items-center text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{currentUser.mobile_number}</span>
                  </div>
                )}

                {(currentUser.gender || currentUser.age) && (
                  <div className="flex items-center text-gray-600">
                    <div className="flex items-center">
                      {currentUser.gender && <span className="text-sm mr-2">{currentUser.gender}</span>}
                      {currentUser.age && <span className="text-sm">{currentUser.age} years</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Second Column */}
              <div className="flex-1 space-y-3">
                {currentUser.role && (
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{currentUser.role}</span>
                  </div>
                )}

                {currentUser.institutions && currentUser.institutions.length > 0 && (
                  <div className="flex items-center text-gray-600">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      {Array.isArray(currentUser.institutions) 
                        ? currentUser.institutions.join(", ") 
                        : currentUser.institutions}
                    </span>
                  </div>
                )}

                {currentUser.expertise && currentUser.expertise.length > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Layers className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      {Array.isArray(currentUser.expertise) 
                        ? currentUser.expertise.join(", ") 
                        : currentUser.expertise}
                    </span>
                  </div>
                )}

                {currentUser.interests && currentUser.interests.length > 0 && (
                  <div className="flex items-center text-gray-600">
                    <Layers className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">
                      Interests: {Array.isArray(currentUser.interests) 
                        ? currentUser.interests.join(", ") 
                        : currentUser.interests}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Dates information row */}
            <div className="flex flex-col sm:flex-row sm:space-x-6 mt-4">
              {currentUser.createdAt && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">Created: {formatDate(currentUser.createdAt)}</span>
                </div>
              )}
              
              {currentUser.updatedAt && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-500" />
                  <span className="text-sm">Updated: {formatDate(currentUser.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-row justify-between space-x-4 mt-6 w-full">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            style={{ backgroundColor: themeConfig.colors.primary }}
            onClick={handlegotoUpdate}
          >
            Update Profile
          </Button>
          <Button
            type="button"
            variant="default"
            className="w-1/2"
            onClick={handlelogout}
            style={{ backgroundColor: themeConfig.colors.primary }}
          >
            Logout
          </Button>
        </div>

        {/* Social Links */}
        {currentUser.social_links && currentUser.social_links.length > 0 && (
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Social Links</h2>
            <div className="flex space-x-4">
              {currentUser.social_links.map((link, index) => (
                <a key={index} href={link} className="text-blue-500 hover:text-blue-700" target="_blank" rel="noopener noreferrer">
                  {getSocialIcon(link)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ongoing Projects Card */}
      {currentUser.ongoing_projects && currentUser.ongoing_projects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Ongoing Projects</h2>
          <div className="space-y-4">
            {currentUser.ongoing_projects.map((project, index) => (
              <div key={index} className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-md font-medium text-gray-800">
                  {typeof project === 'object' ? project.name : project}
                </h3>
                {typeof project === 'object' && project.description && (
                  <p className="text-sm text-gray-600">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications, Collaborators, and Graph in a Single Row */}
      <div className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0">
        {/* Publications Card */}
        {currentUser.publications && currentUser.publications.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Publications</h2>
            <div className="max-h-96 overflow-y-auto">
              {currentUser.publications.map((publication, index) => (
                <div key={index} className="w-full mb-4 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div>
                    <h3 className="text-md font-semibold text-gray-800">
                      {typeof publication === 'object' ? publication.description : publication}
                    </h3>
                    {typeof publication === 'object' && publication.name && (
                      <p className="text-sm text-gray-600">{publication.name}</p>
                    )}
                  </div>
                  <button className="bg-white text-black px-4 py-1 rounded-lg border border-black transition duration-300 hover:bg-black hover:text-white">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators Card */}
        {currentUser.collaborators && currentUser.collaborators.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 w-full md:w-1/3">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Collaborators</h2>
            <div className="max-h-96 overflow-y-auto scrollbar-custom">
              {currentUser.collaborators.map((collaborator, index) => (
                <div key={index} className="w-full mb-4 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                  <div className="flex items-center">
                    <img
                      src={typeof collaborator === 'object' && collaborator.avatar 
                        ? collaborator.avatar 
                        : "https://randomuser.me/api/portraits/men/1.jpg"}
                      alt="Collaborator Profile"
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="text-md font-semibold text-gray-800">
                        {typeof collaborator === 'object' ? collaborator.name : collaborator}
                      </h3>
                      {typeof collaborator === 'object' && collaborator.title && (
                        <p className="text-sm text-gray-600">{collaborator.title}</p>
                      )}
                    </div>
                  </div>
                  <button className="bg-white text-black px-4 py-1 rounded-lg border border-black transition duration-300 hover:bg-black hover:text-white">
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vertical Stack for Graph & Publications (w-1/3) */}
        <div className="w-full md:w-1/3 flex flex-col space-y-6">
          {/* Graph Card */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Time Spent (Hours)</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={profileData.timeSpentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="hours" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Total Publications Card */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-2 text-center">Total Publications</h2>
            <p className="text-3xl font-bold text-blue-500 text-center">
              {currentUser.publications ? currentUser.publications.length : 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;