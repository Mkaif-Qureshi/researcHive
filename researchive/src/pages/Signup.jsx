import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useNavigate } from "react-router-dom";
import signupImg from "@/assets/signup.jpg";
import { toast } from "sonner";
import themeConfig from "../../themeConfig";
import { backend_url } from "../../backendUrl";

const Signup = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [mobile, setMobile] = useState("+91");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = "Name is required";
    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";
    if (!role) newErrors.role = "role is required";
    if (!mobile) newErrors.mobile = "Mobile number is required";
    return newErrors;
  };

  // Handle input change and dynamically clear errors
  const handleInputChange = (e, setter, field) => {
    setter(e.target.value);
    if (e.target.value) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors[field]; // Remove the error message for this field
        return newErrors;
      });
    }
  };

  const handleRoleChange = (value) => {
    setRole(value);
    if (value) {
      setErrors((prevErrors) => {
        const newErrors = { ...prevErrors };
        delete newErrors.role; 
        return newErrors;
      });
    }
  };

  const [loading, setLoading] = useState(false);

const onSubmit = async (event) => {
  event.preventDefault();

  console.log('hi')

  // Validate form before sending data
  const formErrors = validateForm();
  setErrors(formErrors);

  console.log(Object.keys(formErrors).length)

  // Check if form has errors
  if (Object.keys(formErrors).length === 0) {
    setLoading(true); // Set loading to true
    try {
      // Prepare the data to be sent to the backend
      const userData = {
        name: name,
        email: email,
        password: password,
        mobile_number: mobile,
        role: role
      };

      // Send data to backend API
      const response = await fetch(`${backend_url}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      console.log(response)

      if (response.ok) {
        const result = await response.json();
        toast.success('Account created successfully!');
        navigate('/dashboard');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Signup failed. Try again!');
      }
    } catch (error) {
      toast.error('Signup failed. Try again!');
      console.error('Signup error:', error);
    } finally {
      setLoading(false); // Set loading to false after the request is done
    }
  }
};


  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="flex w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="w-1/2 p-8">
          <CardHeader className="px-0 pt-0 my-3">
            <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            <form onSubmit={onSubmit} className="space-y-4">
              
              <div>
                <Label htmlFor="name" style={{ color: themeConfig.colors.text }}>Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => handleInputChange(e, setName, "name")}
                  placeholder="Enter your name"
                />
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="email" style={{ color: themeConfig.colors.text }}>Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => handleInputChange(e, setEmail, "email")}
                  placeholder="Enter your email"
                />
                {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" style={{ color: themeConfig.colors.text }}>Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => handleInputChange(e, setPassword, "password")}
                  placeholder="Enter your password"
                />
                {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
              </div>

              <div>
                <Label className="mb-2" style={{ color: themeConfig.colors.text }}>Role</Label>
                <RadioGroup
                  value={role}
                  onValueChange={handleRoleChange}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Reviewer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Researcher</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other">Both</Label>
                  </div>
                </RadioGroup>
                {errors.role && <p className="text-red-500 text-sm">{errors.role}</p>}
              </div>

              <div>
                <Label htmlFor="mobile" style={{ color: themeConfig.colors.text }}>Mobile Number</Label>
                <Input
                  id="mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => handleInputChange(e, setMobile, "mobile")}
                  placeholder="Enter your mobile number"
                />
                {errors.mobile && <p className="text-red-500 text-sm">{errors.mobile}</p>}
              </div>

              <Button type="submit" className="w-full" style={{ backgroundColor: themeConfig.colors.primary }} disabled={loading}>
  {loading ? 'Signing Up...' : 'Sign Up'}
</Button>

              
              <div className="flex justify-center items-center mt-4">
                <p>Already have an account? <a href="/login" className="text-blue-500 hover:text-blue-700">Log In</a></p>
              </div>

            </form>
          </CardContent>
        </div>
        <div className="w-1/2 bg-blue-600 flex items-center justify-center">
          <img 
            src={signupImg} 
            alt="Signup illustration" 
            className="object-cover h-full"
          />
        </div>
      </div>
    </div>
  );
};

export default Signup;
