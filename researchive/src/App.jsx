import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "@/pages/Signup";
import Layout from "@/layouts/Layout"; 
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";

const App = () => {
  return (
    <AuthProvider>
    <Router>
      <Toaster /> 
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
