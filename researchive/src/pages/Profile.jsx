import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, BookOpen, Layers, Edit, Save, X, EyeIcon, Calendar, Clock, Globe } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import themeConfig from '../../themeConfig';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState('');
  
  const [profileData, setProfileData] = useState({
    address: "Stanford, CA, USA",
    social_links: {
      linkedin: "https://linkedin.com/in/kaifahmed",
      twitter: "https://twitter.com/kaifahmed",
      github: "https://github.com/kaifahmed",
    },
    ongoing_projects: [
      { name: "AI-Powered Research Collaboration Platform", description: "An AI-driven platform integrating knowledge graphs, expert matching, and real-time searching agents to enhance research collaboration." },
      { name: "Blockchain-Based Research Integrity & Verification", description: "A decentralized system ensuring research transparency, authorship verification, and data integrity using blockchain technology." },
    ],
    timeSpentData: [
      { name: "Project 1", hours: 40 },
      { name: "Project 2", hours: 30 },
      { name: "Project 3", hours: 10 },
      { name: "Project 4", hours: 50 },
      { name: "Project 5", hours: 20 },
    ],
    totalPublications: 15,
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

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Get social icon based on URL
  const getSocialIcon = (url) => {
    if (!url) return null;
    
    if (url.includes("github")) {
      return <Github className="w-5 h-5" />;
    } else if (url.includes("linkedin")) {
      return <Linkedin className="w-5 h-5" />;
    } else if (url.includes("twitter") || url.includes("x.com")) {
      return <Twitter className="w-5 h-5" />;
    } else {
      return <Globe className="w-5 h-5" />;
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    setEditField('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditField('');
  };

  const handlelogout = () => {
    logout();
    navigate('/login');
  };

  const handlegotoUpdate = () => {
    navigate('/update-profile');
  };

  const handlegotoSavedpapers = () => {
    navigate('/savedpages');
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-lg font-medium text-gray-600">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto my-12 px-4 sm:px-6 space-y-8">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-8">
          {/* Profile Picture */}
          <div className="relative">
            <Avatar className="h-36 w-36 ring-4 ring-blue-50">
              <AvatarImage src={currentUser.profile_pic} alt="Profile" />
              <AvatarFallback className="bg-blue-100 text-blue-600 text-4xl font-bold">
                {currentUser.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Details */}
          <div className="flex-grow w-full">
            {/* Name and Status */}
            <div className="mb-4">
              <h1 className="text-3xl font-bold text-gray-800 mb-1">{currentUser.name || "No Name"}</h1>
              <div className="flex items-center">
                <EyeIcon className="w-4 h-4 mr-2 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">
                  Account: {currentUser.visibility ? "Public" : "Private"}
                </span>
              </div>
            </div>

            {/* Two-column layout for user details */}
            <div className="flex flex-col md:flex-row md:gap-12 w-full">
              {/* First Column */}
              <div className="flex-1 space-y-3 mb-4 md:mb-0">
                {currentUser.email && (
                  <div className="flex items-center text-gray-700 group hover:text-blue-600 transition-colors">
                    <Mail className="w-4 h-4 mr-3 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
                )}

                {currentUser.mobile_number && (
                  <div className="flex items-center text-gray-700 group hover:text-blue-600 transition-colors">
                    <Phone className="w-4 h-4 mr-3 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-sm">{currentUser.mobile_number}</span>
                  </div>
                )}

                {(currentUser.gender || currentUser.age) && (
                  <div className="flex items-center text-gray-700">
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
                  <div className="flex items-center text-gray-700 group hover:text-blue-600 transition-colors">
                    <BookOpen className="w-4 h-4 mr-3 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-sm">{currentUser.role}</span>
                  </div>
                )}

                {currentUser.institutions && currentUser.institutions.length > 0 && (
                  <div className="flex items-center text-gray-700 group hover:text-blue-600 transition-colors">
                    <BookOpen className="w-4 h-4 mr-3 text-blue-600 group-hover:text-blue-700" />
                    <span className="text-sm">
                      {Array.isArray(currentUser.institutions) 
                        ? currentUser.institutions.join(", ") 
                        : currentUser.institutions}
                    </span>
                  </div>
                )}

                {currentUser.interests && currentUser.interests.length > 0 && (
                  <div className="flex items-center text-gray-700 group hover:text-blue-600 transition-colors">
                    <Layers className="w-4 h-4 mr-3 text-blue-600 group-hover:text-blue-700" />
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
            <div className="flex flex-col sm:flex-row sm:space-x-8 mt-5 pt-4 border-t border-gray-100">
              {currentUser.createdAt && (
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm">Created: {formatDate(currentUser.createdAt)}</span>
                </div>
              )}
              
              {currentUser.updatedAt && (
                <div className="flex items-center text-gray-600">
                  <Clock className="w-4 h-4 mr-2 text-blue-600" />
                  <span className="text-sm">Updated: {formatDate(currentUser.updatedAt)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-1/3 py-2 px-4 rounded-lg border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors"
            onClick={handlegotoUpdate}
          >
            Update Profile
          </Button>
          
          <Button
            type="button"
            variant="default"
            className="w-full sm:w-1/3 py-2 px-4 rounded-lg"
            onClick={handlegotoSavedpapers}
            style={{ backgroundColor: themeConfig.colors.primary }}
          >
            Saved Papers
          </Button>
          
          <Button
            type="button"
            variant="default"
            className="w-full sm:w-1/3 py-2 px-4 rounded-lg bg-red-50 text-red-600 border-2 border-red-100 hover:bg-red-100 hover:border-red-200"
            onClick={handlelogout}
          >
            Logout
          </Button>
        </div>

        {/* Social Links */}
        {currentUser.social_links && currentUser.social_links.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Social Links</h2>
            <div className="flex space-x-4">
              {currentUser.social_links.map((link, index) => (
                <a 
                  key={index} 
                  href={link} 
                  className="p-3 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  {getSocialIcon(link)}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ongoing Projects Card */}
      {currentUser.ongoing_projects && currentUser.ongoing_projects.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Ongoing Projects</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {currentUser.ongoing_projects.map((project, index) => (
              <div key={index} className="bg-blue-50 p-6 rounded-xl border border-blue-100 hover:shadow-md transition-shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  {typeof project === 'object' ? project.name : project}
                </h3>
                {typeof project === 'object' && project.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Publications, Collaborators, and Graph in a Single Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Publications Card */}
        {currentUser.publications && currentUser.publications.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Publications</h2>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
              {currentUser.publications.map((publication, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="mb-3">
                    <h3 className="text-md font-semibold text-gray-800 mb-1">
                      {typeof publication === 'object' ? publication.description : publication}
                    </h3>
                    {typeof publication === 'object' && publication.name && (
                      <p className="text-sm text-gray-600">{publication.name}</p>
                    )}
                  </div>
                  <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 transition duration-300 hover:bg-blue-50">
                    View Publication
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Collaborators Card */}
        {currentUser.collaborators && currentUser.collaborators.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-2 border-b border-gray-100">Collaborators</h2>
            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
              {currentUser.collaborators.map((collaborator, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-xl hover:shadow-md transition-shadow">
                  <div className="flex items-center mb-3">
                    <div className="flex-shrink-0">
                      <img
                        src={typeof collaborator === 'object' && collaborator.avatar 
                          ? collaborator.avatar 
                          : "https://randomuser.me/api/portraits/men/1.jpg"}
                        alt="Collaborator Profile"
                        className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-md font-semibold text-gray-800">
                        {typeof collaborator === 'object' ? collaborator.name : collaborator}
                      </h3>
                      {typeof collaborator === 'object' && collaborator.title && (
                        <p className="text-sm text-gray-600">{collaborator.title}</p>
                      )}
                    </div>
                  </div>
                  <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg border border-blue-200 transition duration-300 hover:bg-blue-50">
                    View Profile
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vertical Stack for Graph & Publications Count */}
        <div className="flex flex-col gap-8">
          {/* Graph Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">Time Spent (Hours)</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={profileData.timeSpentData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                    border: '1px solid #eee'
                  }} 
                />
                <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Total Publications Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">Total Publications</h2>
            <div className="flex items-center justify-center py-6">
              <div className="w-32 h-32 rounded-full bg-blue-50 border-4 border-blue-100 flex items-center justify-center">
                <p className="text-4xl font-bold text-blue-600">
                  {currentUser.publications ? currentUser.publications.length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;