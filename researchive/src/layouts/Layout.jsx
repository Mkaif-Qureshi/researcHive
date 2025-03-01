import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <div className="pt-10"> {/* Adjust padding based on navbar height */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;
