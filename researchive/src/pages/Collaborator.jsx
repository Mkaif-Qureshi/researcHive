import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, Star, Bookmark, ExternalLink, Search, Filter, ChevronDown, Award, Clock, MessageSquare, Users } from 'lucide-react';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Categories for filtering
  const categories = ['All', 'Strategy', 'Project Management', 'Technical', 'Leadership', 'Innovation'];
  
  // Recommended collaborators data with enhanced information
  const allCollaborators = [
    {
      name: "Alex Johnson",
      role: "Senior Consultant",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      expertise: "Strategic Planning, Business Development",
      rating: 4.9,
      reviews: 127,
      availability: "Next available: Today",
      tags: ["Strategy", "Leadership", "Innovation"],
      bio: "Alex has helped over 50 companies transform their business strategies, with expertise in market expansion.",
      projects: 78,
      successRate: "96%"
    },
    {
      name: "Sarah Williams",
      role: "Project Manager",
      image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      expertise: "Project Management, Team Leadership",
      rating: 4.8,
      reviews: 93,
      availability: "Next available: Tomorrow",
      tags: ["Project Management", "Agile", "Team Building"],
      bio: "Sarah specializes in agile methodologies and has successfully delivered complex projects for Fortune 500 companies.",
      projects: 112,
      successRate: "94%"
    },
    {
      name: "Michael Chen",
      role: "Technical Advisor",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      expertise: "Technical Solutions, Innovation",
      rating: 4.7,
      reviews: 85,
      availability: "Next available: Today",
      tags: ["Technical", "Innovation", "Solutions"],
      bio: "Michael brings cutting-edge technical expertise to solve complex problems with innovative approaches.",
      projects: 64,
      successRate: "91%"
    },
    {
      name: "Emily Rodriguez",
      role: "Marketing Strategist",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      expertise: "Digital Marketing, Brand Strategy",
      rating: 4.9,
      reviews: 76,
      availability: "Next available: Friday",
      tags: ["Marketing", "Strategy", "Digital"],
      bio: "Emily has transformed brand presence for over 30 companies with innovative digital marketing strategies.",
      projects: 58,
      successRate: "97%"
    },
    {
      name: "David Kim",
      role: "Financial Advisor",
      image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      expertise: "Financial Planning, Investment Strategy",
      rating: 4.8,
      reviews: 102,
      availability: "Next available: Thursday",
      tags: ["Finance", "Investment", "Strategy"],
      bio: "David provides expert financial guidance with a focus on sustainable growth and risk management.",
      projects: 89,
      successRate: "95%"
    },
    {
      name: "Lisa Thompson",
      role: "UX/UI Designer",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&q=80",
      expertise: "User Experience, Interface Design",
      rating: 4.9,
      reviews: 68,
      availability: "Next available: Today",
      tags: ["Design", "UX", "Innovation"],
      bio: "Lisa creates intuitive, beautiful interfaces that drive engagement and improve user satisfaction.",
      projects: 74,
      successRate: "98%"
    }
  ];

  // Filter collaborators based on search and category
  const filteredCollaborators = allCollaborators.filter(collaborator => {
    const matchesSearch = searchQuery === '' || 
      collaborator.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collaborator.expertise.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collaborator.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'All' || 
      collaborator.tags.some(tag => tag === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  // Featured collaborators (top 3 by rating)
  const featuredCollaborators = [...allCollaborators]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  return (
    <div className="flex-1 min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero section with search */}
      <div className="bg-black text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Expert Collaborators Network</h1>
          <p className="text-xl max-w-3xl mx-auto mb-10 text-gray-300">
            Connect with industry-leading professionals to bring your projects to the next level
          </p>
          
          <div className="max-w-2xl mx-auto relative">
            <div className="flex items-center bg-white rounded-lg overflow-hidden">
              <div className="pl-4 text-gray-400">
                <Search size={20} />
              </div>
              <input
                type="text"
                placeholder="Search by name, expertise, or skill..."
                className="w-full py-4 px-3 text-black focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Category filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                    selectedCategory === category
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            

          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Featured collaborators section */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-black flex items-center">
              <Award className="mr-2 text-amber-500" />
              Featured Collaborators
            </h2>

          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredCollaborators.map((collaborator, index) => (
              <div key={index} className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl overflow-hidden shadow-xl text-white relative">
                <div className="absolute top-0 right-0 bg-amber-500 text-black font-bold px-4 py-1 rounded-bl-lg text-sm">
                  TOP RATED
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={collaborator.image} 
                      alt={collaborator.name} 
                      className="w-16 h-16 rounded-full object-cover border-2 border-amber-500"
                    />
                    <div className="ml-4">
                      <h3 className="text-xl font-bold">{collaborator.name}</h3>
                      <p className="text-gray-300">{collaborator.role}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mb-4">
                    <div className="flex items-center text-amber-500 mr-3">
                      <Star size={18} fill="currentColor" />
                      <span className="ml-1 font-bold text-white">{collaborator.rating}</span>
                    </div>
                    <span className="text-gray-300 text-sm">({collaborator.reviews} reviews)</span>
                  </div>
                  
                  <p className="text-gray-300 mb-4">{collaborator.bio}</p>
                  
                  <div className="flex justify-between text-sm mb-6">
                    <div className="flex items-center">
                      <Clock size={16} className="mr-1 text-gray-400" />
                      <span>{collaborator.availability}</span>
                    </div>
                    <div className="flex items-center">
                      <Award size={16} className="mr-1 text-amber-500" />
                      <span>{collaborator.successRate} success</span>
                    </div>
                  </div>
                  
                  <Link 
                    to="/meet" 
                    className="block w-full bg-amber-500 text-black text-center py-3 rounded-lg font-medium hover:bg-amber-400 transition-colors"
                  >
                    Schedule Priority Session
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Stats section */}
        <div className="bg-gray-100 rounded-2xl p-8 mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-black mb-2">Why Our Collaborators Stand Out</h2>
            <p className="text-gray-600">Industry-leading professionals with proven track records</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: "500+", label: "Successful Projects", icon: <Award className="text-amber-500" size={24} /> },
              { value: "98%", label: "Client Satisfaction", icon: <Star className="text-amber-500" size={24} /> },
              { value: "24h", label: "Average Response Time", icon: <Clock className="text-amber-500" size={24} /> },
              { value: "150+", label: "Active Collaborators", icon: <Users className="text-amber-500" size={24} /> }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-2">{stat.icon}</div>
                <div className="text-3xl font-bold text-black mb-1">{stat.value}</div>
                <div className="text-gray-600 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main collaborators grid */}
        <div>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-black">All Collaborators</h2>
            <p className="text-gray-600">Showing {filteredCollaborators.length} of {allCollaborators.length} collaborators</p>
          </div>

          {filteredCollaborators.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 rounded-lg">
              <Search className="mx-auto text-gray-400 mb-4" size={48} />
              <h3 className="text-xl font-medium text-gray-800 mb-2">No collaborators found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {filteredCollaborators.map((collaborator, index) => (
                <div key={index} className="bg-white rounded-xl overflow-hidden shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
                  <div className="relative">
                    <img 
                      src={collaborator.image} 
                      alt={collaborator.name} 
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 p-6 text-white">
                      <h3 className="text-2xl font-bold mb-1">{collaborator.name}</h3>
                      <p className="text-white/90 font-medium">{collaborator.role}</p>
                    </div>
                    <button className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full hover:bg-white/40 transition-colors">
                      <Bookmark className="text-white" size={20} />
                    </button>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-center mb-4">
                      <div className="flex items-center text-amber-500 mr-2">
                        <Star size={18} fill="currentColor" />
                        <span className="ml-1 font-bold text-black">{collaborator.rating}</span>
                      </div>
                      <span className="text-gray-500 text-sm">({collaborator.reviews} reviews)</span>
                      <span className="ml-auto text-green-600 text-sm font-medium">{collaborator.availability}</span>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-sm uppercase tracking-wider text-gray-500 mb-2">Expertise</h4>
                      <p className="text-gray-800">{collaborator.expertise}</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {collaborator.tags.map((tag, tagIndex) => (
                        <span key={tagIndex} className="bg-gray-100 text-gray-800 text-xs font-medium px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex gap-3">
                      <Link 
                        to="/meet" 
                        className="flex-1 inline-flex items-center justify-center bg-black text-white px-4 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                      >
                        <Calendar className="mr-2" size={18} />
                        Schedule
                      </Link>
                      <Link 
                        to={`/profile/${collaborator.name.toLowerCase().replace(' ', '-')}`}
                        className="inline-flex items-center justify-center border border-gray-300 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        <MessageSquare size={18} />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-16 text-center">

        </div>
      </div>
    </div>
  );
};

export default Home;