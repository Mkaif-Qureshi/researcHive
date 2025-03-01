import React, { useContext, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { FiSearch } from 'react-icons/fi'; // Import search icon from react-icons
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';

const Home = () => {
  const {currentUser , logout} = useAuth();
  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="w-full p-8 space-y-6 , ml-20">
        {/* Search Bar at the top */}
        <div className="flex justify-center mb-4">
          <div className="relative w-full max-w-ld">
            <Input
              type="text"
              placeholder="Search Research Papers"
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-800"
            />
            <div className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400">
              <FiSearch />
            </div>
          </div>
        </div>
        <Button type='button' onClick={logout} />

        <h2 className="text-2xl font-bold text-gray-800">Research Papers</h2>

        {currentUser && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Research Paper Block */}
          <Card className="shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Paper Title 1</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Brief description of the research paper goes here. You can provide a short overview or abstract.
              </p>
              <Link to="#" className="text-blue-500 hover:text-blue-700">Read more</Link>
            </CardContent>
          </Card>

          {/* Research Paper Block */}
          <Card className="shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Paper Title 2</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Brief description of the research paper goes here. You can provide a short overview or abstract.
              </p>
              <Link to="#" className="text-blue-500 hover:text-blue-700">Read more</Link>
            </CardContent>
          </Card>

          {/* Research Paper Block */}
          <Card className="shadow-lg bg-white">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Paper Title 3</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600">
                Brief description of the research paper goes here. You can provide a short overview or abstract.
              </p>
              <Link to="#" className="text-blue-500 hover:text-blue-700">Read more</Link>
            </CardContent>
          </Card>
        </div>}
      </div>

      {/* Right Side - Top Research Experts */}
      {currentUser && <div className="w-1/3 bg-gray-200 p-8 , m-12 , mt-18 border-2">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Top Research Experts</h2>

        <div className="space-y-4">
          {/* Expert 1 */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
            <img className="w-12 h-12 rounded-full" src="https://via.placeholder.com/150" alt="Expert 1" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800">Dr. John Doe</span>
              <span className="text-sm text-gray-600">AI & Machine Learning Expert</span>
            </div>
          </div>

          {/* Expert 2 */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
            <img className="w-12 h-12 rounded-full" src="https://via.placeholder.com/150" alt="Expert 2" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800">Dr. Jane Smith</span>
              <span className="text-sm text-gray-600">Quantum Computing Expert</span>
            </div>
          </div>

          {/* Expert 3 */}
          <div className="flex items-center space-x-4 bg-white p-4 rounded-lg shadow-md">
            <img className="w-12 h-12 rounded-full" src="https://via.placeholder.com/150" alt="Expert 3" />
            <div className="flex flex-col">
              <span className="text-lg font-semibold text-gray-800">Dr. Alan Turing</span>
              <span className="text-sm text-gray-600">Mathematics & Cryptography Expert</span>
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};

export default Home;
