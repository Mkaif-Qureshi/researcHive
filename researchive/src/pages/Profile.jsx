import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, BookOpen, Layers, Edit, Save, X } from 'lucide-react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from "react-router-dom";


const Profile = () => {
  const {currentUser} = useAuth();
  const navigate = useNavigate(); // Ensure navigate is initialized here
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState('');
  const [profileData, setProfileData] = useState({
    name: "Kaif Ahmed",
    email: "kaif.ahmed@example.com",    
    phone: "+91 1234567890",
    address: "Stanford, CA, USA",
    avatar: "https://randomuser.me/api/portraits/men/1.jpg",
    role: "Research Scientist",
    expertise: ["Artificial Intelligence", "Machine Learning", "Data Science"],
    social_links: {
      linkedin: "https://linkedin.com/in/kaifahmed",
      twitter: "https://twitter.com/kaifahmed",
      github: "https://github.com/kaifahmed",
    },
    ongoing_projects: [
      { name: "AI-Powered Research Collaboration Platform", description: "An AI-driven platform integrating knowledge graphs, expert matching, and real-time searching agents to enhance research collaboration." },
      { name: "Blockchain-Based Research Integrity & Verification", description: "A decentralized system ensuring research transparency, authorship verification, and data integrity using blockchain technology." },
    ],
    collaborators: [
      { name: "John Doe", title: "Researcher", avatar: "https://randomuser.me/api/portraits/men/2.jpg" },
      { name: "Jane Smith", title: "Data Scientist", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
      { name: "Jane Smith", title: "Data Scientist", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
      { name: "Jane Smith", title: "Data Scientist", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
      { name: "Jane Smith", title: "Data Scientist", avatar: "https://randomuser.me/api/portraits/women/1.jpg" },
    ],
    publications: [
        { name: "John Doe", description: "AI in todays world" },
        { name: "John Doe", description: "Blockchain in todays era" },
        { name: "John Doe", description: "Blockchain in todays era" },
        { name: "John Doe", description: "Blockchain in todays era" },
        { name: "John Doe", description: "Blockchain in todays era" },
        { name: "John Doe", description: "Blockchain in todays era" },
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

  const handleChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsEditing(false);
    setEditField('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditField('');
  };

  if(currentUser){
    return (
      <div className="mx-4 my-10 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            {/* Editable Profile Picture */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-blue-100 mr-6 flex-shrink-0 mr-10">
                <img
                  src={currentUser.profile_pic}
                  alt={currentUser.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="avatarUpload"
              />
              <label
                htmlFor="avatarUpload"
                className="absolute bottom-0 right-12 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 ml-60"
              >
                <Edit size={18} />
              </label>
            </div>
  
            {/* Profile Details */}
            <div className="flex-grow">
              <div className="flex items-center space-x-2">
                {editField === 'name' ? (
                  <input
                    type="text"
                    value={currentUser.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    className="border-b-2 border-blue-200 focus:outline-none text-2xl font-bold text-gray-800"
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-gray-800">{currentUser.name}</h1>
                )}
  
                <Edit
                  size={18}
                  className="text-gray-400 cursor-pointer hover:text-blue-500"
                  onClick={() => { setIsEditing(true); setEditField('name'); }}
                />
              </div>
  
              <div className="flex">
                {/* First Column */}
                <div className="flex-grow space-y-2">
                  <div className="flex items-center text-gray-600">
                    <Mail className="w-4 h-4 mr-2 text-blue-500" />
                    <span className="text-sm">{currentUser.email}</span>
                  </div>
  
                  {/* Editable Phone */}
                  <div className="flex items-center text-gray-600 group relative">
                    <Phone className="w-4 h-4 mr-2 text-blue-500" />
                    {editField === 'phone' ? (
                      <input
                        type="tel"
                        value={currentUser.mobile_number}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className="border-b-2 border-blue-200 focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm">{currentUser.mobile_number}</span>
                    )}
                    <Edit
                      size={14}
                      className="ml-2 text-gray-400 cursor-pointer hover:text-blue-500 absolute right-0 opacity-0 group-hover:opacity-100"
                      onClick={() => { setIsEditing(true); setEditField('phone'); }}
                    />
                  </div>
  
                  {/* Editable Address */}
                  <div className="flex items-center text-gray-600 group relative">
                    <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                    {editField === 'address' ? (
                      <input
                        value={profileData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="border-b-2 border-blue-200 focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm">{profileData.address}</span>
                    )}
                    <Edit
                      size={14}
                      className="ml-2 text-gray-400 cursor-pointer hover:text-blue-500 absolute right-0 opacity-0 group-hover:opacity-100"
                      onClick={() => { setIsEditing(true); setEditField('address'); }}
                    />
                  </div>
                </div>
  
                {/* Second Column */}
                <div className="flex-grow space-y-2">
                  {/* Editable Role */}
                  <div className="flex items-center text-gray-600 group relative">
                    <BookOpen className="w-4 h-4 mr-2 text-blue-500" />
                    {editField === 'role' ? (
                      <input
                        value={currentUser.role}
                        onChange={(e) => handleChange('role', e.target.value)}
                        className="border-b-2 border-blue-200 focus:outline-none"
                      />
                    ) : (
                      <span className="text-sm">{currentUser.role}</span>
                    )}
                    <Edit
                      size={14}
                      className="ml-2 text-gray-400 cursor-pointer hover:text-blue-500 absolute right-0 opacity-0 group-hover:opacity-100"
                      onClick={() => { setIsEditing(true); setEditField('role'); }}
                    />
                  </div>
  
                  {/* Editable Expertise */}
                  <div className="flex items-center text-gray-600 group relative">
                    <Layers className="w-4 h-4 mr-2 text-blue-500" />
                    {editField === 'expertise' ? (
                    <input
                      value={Array.isArray(currentUser.expertise) ? currentUser.expertise.join(", ") : currentUser.expertise || ""}
                      onChange={(e) => handleChange('expertise', e.target.value.split(', '))}
                      className="border-b-2 border-blue-200 focus:outline-none"
                    />
                  ) : (
                    <span className="text-sm">
                      {Array.isArray(currentUser.expertise) ? currentUser.expertise.join(", ") : currentUser.expertise}
                    </span>
                  )}

                    <Edit
                      size={14}
                      className="ml-2 text-gray-400 cursor-pointer hover:text-blue-500 absolute right-0 opacity-0 group-hover:opacity-100"
                      onClick={() => { setIsEditing(true); setEditField('expertise'); }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Save/Cancel Buttons */}
          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-600"
              >
                <Save className="mr-2 bg-black" /> Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600"
              >
                <X className="mr-2" /> Cancel
              </button>
            </div>
          )}
  
          {/* Social Links */}
          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Social Links</h2>
            <div className="flex space-x-4">
              <a href={profileData.social_links.linkedin} className="text-blue-500 hover:text-blue-700">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href={profileData.social_links.twitter} className="text-blue-500 hover:text-blue-700">
                <Twitter className="w-6 h-6" />
              </a>
              <a href={profileData.social_links.github} className="text-blue-500 hover:text-blue-700">
                <Github className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
  
          {/* Ongoing Projects Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Ongoing Projects</h2>
            <div className="space-y-4">
              {profileData.ongoing_projects.map((project, index) => (
                <div key={index} className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="text-md font-medium text-gray-800">{project.name}</h3>
                  <p className="text-sm text-gray-600">{project.description}</p>
                </div>
              ))}
            </div>

            const navigate = useNavigate();


            {/* Button container to keep it below content */}
            <div className="mt-6 flex justify-end">
            <button
              className="bg-white text-black border border-black px-4 py-2 rounded-lg hover:bg-gray-100 transition"
              onClick={() => navigate("/savedpages")} // Ensure this navigates correctly
            >
              View Saved Pages
            </button>
            </div>
          </div>

        {/* Publications, Collaborators, and Graph in a Single Row */}
        <div className="flex space-x-6">
          {/* Publications Card */}
          <div className="bg-white rounded-lg shadow-md p-6 w-1/3 h-110">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Publications</h2>
              <div className="h-75 overflow-y-auto"> {/* Fixed height and scrollbar */}
                  {profileData.publications.map((project, index) => (
                  <div key={index} className="w-full mb-4 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div>
                      <h3 className="text-md font-semibold text-gray-800">{project.description}</h3>
                      <p className="text-sm text-gray-600">{project.name}</p>
                      </div>
                      <button className="bg-white text-black px-4 py-1 rounded-lg border border-black transition duration-300 hover:bg-black hover:text-white">
                      View
                      </button>
                  </div>
                  ))}
              </div>
              </div>
  
              {/* Collaborators Card */}
              <div className="bg-white rounded-lg shadow-md p-6 w-1/3 h-110">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Collaborators</h2>
              <div className="max-h-75 overflow-y-auto scrollbar-custom">{/* Add max height and scrollbar */}
                  {profileData.collaborators.map((collaborator, index) => (
                  <div key={index} className="w-full mb-4 p-4 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center">
                      <img
                          src={collaborator.avatar}
                          alt="Collaborator Profile"
                          className="w-10 h-10 rounded-full mr-4"
                      />
                      <div>
                          <h3 className="text-md font-semibold text-gray-800">{collaborator.name}</h3>
                          <p className="text-sm text-gray-600">{collaborator.title}</p>
                      </div>
                      </div>
                      <button className="bg-white text-black px-4 py-1 rounded-lg border border-black transition duration-300 hover:bg-black hover:text-white">
                      View
                      </button>
                  </div>
                  ))}
              </div>
              </div>
  
          {/* Vertical Stack for Graph & Publications (w-1/3) */}
          <div className="w-1/3 flex flex-col space-y-6">
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
              <p className="text-3xl font-bold text-blue-500 text-center">{profileData.totalPublications}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default Profile;