import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import loginImg from "@/assets/signup.jpg";
import { toast } from "sonner";
import themeConfig from "../../themeConfig"; 
import { backend_url } from '../../backendUrl';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('+91');
  const [loginMethod, setLoginMethod] = useState('email'); // Default to email login
  const navigate = useNavigate();

  const validateForm = () => {
    const errors = {};
    if (!password) errors.password = 'Password is required';
    if (loginMethod === 'email' && !email) errors.email = 'Email is required';
    if (loginMethod === 'mobile' && !mobileNumber) errors.mobile = 'Mobile number is required';
    return errors;
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      // Handle form validation errors (display them)
      toast.error(Object.values(errors).join(' '));
      return;
    }

    try {
      const loginData = loginMethod === 'email' ? { email, password } : { mobile_number: mobileNumber, password };
      let response;
      if(loginMethod === 'email'){
        response = await fetch(`${backend_url}/api/auth/login-by-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
          credentials : 'include'
        });
      }
      else{
        response = await fetch(`${backend_url}/api/auth/login-by-mobile`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(loginData),
          credentials : 'include'
        });
      }

      const data = await response.json();
      
      if (response.status === 200) {
        toast.success('Login successful!');
        navigate('/');

      } else {
        toast.error(data.message || 'Login failed!');
      }
    } catch (error) {
      console.error(error);
      toast.error('An error occurred during login!');
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
            {/* Radio Button Group for Login Method */}
            <div className="mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="emailLogin"
                    name="loginMethod"
                    checked={loginMethod === 'email'}
                    onChange={() => setLoginMethod('email')}
                    className="mr-2"
                  />
                  <Label htmlFor="emailLogin" className="text-sm">Login by Email</Label>
                </div>
                <div className="flex items-center">
                  <input
                    type="radio"
                    id="mobileLogin"
                    name="loginMethod"
                    checked={loginMethod === 'mobile'}
                    onChange={() => setLoginMethod('mobile')}
                    className="mr-2"
                  />
                  <Label htmlFor="mobileLogin" className="text-sm">Login by Mobile</Label>
                </div>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {loginMethod === 'email' ? (
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
              ) : (
                <div>
                  <Label htmlFor="mobile" style={{ color: themeConfig.colors.text }}>Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="Enter your mobile number"
                  />
                </div>
              )}

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

              <Button type="submit" className="w-full" style={{ backgroundColor: themeConfig.colors.primary }}>
                Login
              </Button>
              <div className="flex justify-center items-center mt-4">
                <p>Don't have an account? <a href="/signup" className="text-blue-500 hover:text-blue-700">Sign Up</a></p>
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
