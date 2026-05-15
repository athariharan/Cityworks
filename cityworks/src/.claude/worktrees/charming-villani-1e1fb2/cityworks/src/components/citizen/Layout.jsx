// components/citizen/Layout.jsx
import CitizenNavbar from "./Navbar";
import CitizenFooter from "./Footer";
import "./Layout.css";

function CitizenLayout({ children, user }) {
  return (
    <div className="citizen-layout">
      <CitizenNavbar user={user} />
      <main className="citizen-layout-main">
        {children}
      </main>
      <CitizenFooter />
    </div>
  );
}

export default CitizenLayout;