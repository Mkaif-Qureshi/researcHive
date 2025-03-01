import { toast } from "sonner";
import { backend_url } from "../../backendUrl.js";
import { createContext, useState, useEffect, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch(`${backend_url}/api/auth/check`, {
          credentials: "include", 
        });
        if (response.ok) {
          const data = await response.json();
          setCurrentUser(data);
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error checking auth:", error);
        setCurrentUser(null);
      }
    };

    checkUser();
  }, []);

  const logout = async () => {
    try {
      const response = await fetch(`${backend_url}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (response.ok) {
        setCurrentUser(null);
        toast.success("Logout successful")
        
      } else {
        toast.error("Logout failed");
      }
    } catch (error) {
        toast.error(error || "Logout failed");
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
