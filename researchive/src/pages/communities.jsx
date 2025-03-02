import React from 'react';
import { ArrowRight, Code, Cpu, Headset as VrHeadset, Smartphone, Layers, Atom, Database, Cloud, Braces, Sparkles, Globe } from 'lucide-react';

function Communities() {
  const communities = [
    {
      id: 1,
      name: "Artificial Intelligence",
      icon: <Sparkles className="w-8 h-8" />,
      description: "Join the AI revolution with cutting-edge machine learning, neural networks, and deep learning discussions.",
      members: "24.5K",
      topics: ["Machine Learning", "Neural Networks", "NLP", "Computer Vision"]
    },
    {
      id: 2,
      name: "Virtual Reality",
      icon: <VrHeadset className="w-8 h-8" />,
      description: "Explore immersive worlds and technologies shaping the future of human-computer interaction.",
      members: "18.2K",
      topics: ["Oculus", "Unity3D", "Immersive Design", "3D Modeling"]
    },
    {
      id: 3,
      name: "Augmented Reality",
      icon: <Smartphone className="w-8 h-8" />,
      description: "Discover how AR is transforming industries from retail to healthcare with innovative applications.",
      members: "15.7K",
      topics: ["ARKit", "ARCore", "Spatial Computing", "Mixed Reality"]
    },
    {
      id: 4,
      name: "Quantum Computing",
      icon: <Atom className="w-8 h-8" />,
      description: "Dive into the quantum realm with discussions on qubits, quantum algorithms, and future applications.",
      members: "9.3K",
      topics: ["Quantum Algorithms", "Qubits", "Quantum Supremacy", "Q#"]
    },
    {
      id: 5,
      name: "Blockchain",
      icon: <Layers className="w-8 h-8" />,
      description: "Explore decentralized technologies revolutionizing finance, supply chains, and digital ownership.",
      members: "21.8K",
      topics: ["Smart Contracts", "DeFi", "NFTs", "Web3"]
    },
    {
      id: 6,
      name: "Cloud Computing",
      icon: <Cloud className="w-8 h-8" />,
      description: "Connect with experts in cloud infrastructure, serverless computing, and distributed systems.",
      members: "27.1K",
      topics: ["AWS", "Azure", "GCP", "Serverless"]
    },
    {
      id: 7,
      name: "Robotics",
      icon: <Cpu className="w-8 h-8" />,
      description: "Build the future with discussions on autonomous systems, robot design, and industrial automation.",
      members: "12.4K",
      topics: ["ROS", "Computer Vision", "Automation", "Drones"]
    },
    {
      id: 8,
      name: "Web Development",
      icon: <Globe className="w-8 h-8" />,
      description: "Stay on the cutting edge of web technologies, frameworks, and design patterns.",
      members: "31.6K",
      topics: ["JavaScript", "React", "Node.js", "Web Performance"]
    },
    {
      id: 9,
      name: "Big Data",
      icon: <Database className="w-8 h-8" />,
      description: "Master the art of handling massive datasets with advanced analytics and processing techniques.",
      members: "19.2K",
      topics: ["Hadoop", "Spark", "Data Visualization", "ETL"]
    },
    {
      id: 10,
      name: "DevOps",
      icon: <Braces className="w-8 h-8" />,
      description: "Bridge the gap between development and operations with continuous integration and deployment.",
      members: "23.8K",
      topics: ["CI/CD", "Kubernetes", "Docker", "Infrastructure as Code"]
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

            {/* Hero Section */}x
            <section className="py-20 border-b border-gray-800 bg-black">
            <div className="container mx-auto px-4">
                <div className="max-w-3xl mx-auto text-center">
                <h1 className="text-5xl font-bold mb-6 text-white">
                    Connect with Tech Communities
                </h1>
                <p className="text-xl text-gray-400 mb-10">
                    Join thousands of developers, engineers, and tech enthusiasts across various technology stacks and domains.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="px-6 py-3 bg-white text-black rounded-md hover:bg-gray-200 transition-colors font-medium">
                    Explore Communities
                    </button>
                    <button className="px-6 py-3 border border-white rounded-md hover:bg-white hover:text-black transition-colors font-medium text-white">
                    Start Your Own
                    </button>
                </div>
                </div>
            </div>
            </section>


      {/* Communities Section */}
      <section className="py-16 bg-gray-100">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold mb-12 text-center text-black">Featured Tech Communities</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {communities.map((community) => (
        <div 
          key={community.id} 
          className="bg-gray-200 text-black rounded-lg p-6 border border-gray-300 hover:border-blue-500 transition-all duration-300 hover:shadow-lg"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              {community.icon}
            </div>
            <span className="text-gray-600">{community.members} members</span>
          </div>
          <h3 className="text-xl font-bold mb-2">{community.name}</h3>
          <p className="text-black-700 mb-4">{community.description}</p>
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {community.topics.map((topic, index) => (
                <span 
                  key={index} 
                  className="text-xs px-2 py-1 bg-gray-300 rounded-full text-gray-800"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
          <button className="w-full mt-2 flex items-center justify-center py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-500 hover:text-white transition-colors">
            <span>Join Community</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      ))}
    </div>
  </div>
</section>



          {/* CTA Section */}
          <section className="py-20 bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6 text-white">Ready to grow with like-minded tech enthusiasts?</h2>
            <p className="text-xl text-gray-400 mb-10">
              Join our global network of technology communities and accelerate your learning, career, and innovation potential.
            </p>
            <button className="px-8 py-4 bg-white text-black rounded-md hover:bg-gray-200 transition-colors font-medium text-lg">
              Get Started Today
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Communities;