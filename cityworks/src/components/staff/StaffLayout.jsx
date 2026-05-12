// components/staff/StaffLayout.jsx
import { useState } from "react";
import StaffNavbar  from "./StaffNavbar";
import StaffSidebar from "./StaffSidebar";
import "../../styles/StaffLayout.css";

function StaffLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="slayout">

      {/* Sidebar */}
      <StaffSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content area */}
      <div className="slayout-main">

        {/* Top Navbar */}
        <StaffNavbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

        {/* Page content */}
        <main className="slayout-content">
          {children}
        </main>

      </div>
    </div>
  );
}

export default StaffLayout;
