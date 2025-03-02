import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "@/pages/Signup";
import Layout from "@/layouts/Layout";
import { Toaster } from "sonner";
import Login from "./pages/Login";
import Home from "./pages/Home";
import { AuthProvider } from "./context/AuthContext";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ResearchGraph from "./pages/ResearchGraph";
import Chat from "./pages/Chat";
import Meet from "./pages/Meet";
import SavedPages from "./pages/SavedPages"; // Create this page
import UpdateProfile from "./pages/UpdateProfile";
import Collabrator from "./pages/Collaborator";
import Communities from "./pages/communities";



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
          <Route path="/chat" element={<Chat />} />
          <Route path="/research-graph" element={<ResearchGraph />} />
          <Route path="/meet" element={<Meet />} />
          <Route path="/update-profile" element={<UpdateProfile />} />
          <Route path="/savedpages" element={<SavedPages />} />
          <Route path="/collabrator" element={<Collabrator />} />
          <Route path="/communities" element={<Communities />} />


        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
