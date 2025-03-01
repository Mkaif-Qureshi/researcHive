import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import loginImg from "@/assets/signup.jpg";
import { toast } from "sonner";
import themeConfig from "../../themeConfig"; 

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault(); 
    try {
    } catch (error) {
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-1/2 p-8">
          <CardHeader className="px-0 pt-0 my-3">
            <CardTitle className="text-2xl font-bold">Login to Your Account</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" style={{ color: themeConfig.colors.text }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <Label htmlFor="password" style={{ color: themeConfig.colors.text }}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
              </div>

              <Button type="submit" className="w-full" style={{ backgroundColor: themeConfig.colors.primary }}>Login</Button>
              <div className="flex justify-center items-center mt-4">
                <div className="">
                  <p>Don't have an account? <a href="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</a></p>
                </div>
              </div>

            </form>
          </CardContent>
        </div>
        <div className="w-1/2 bg-blue-600 flex items-center justify-center">
          <img 
            src={loginImg} 
            alt="Login illustration" 
            className="object-cover h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;