// components/citizen/Layout.jsx
import CitizenNavbar   from "./Navbar";
import CitizenFooter   from "./Footer";
import CitizenChatBot  from "./CitizenChatBot";
import "../../styles/Layout.css";

function CitizenLayout({ children, user }) {
  return (
    <div className="citizen-layout">
      <CitizenNavbar user={user} />
      <main className="citizen-layout-main">
        {children}
      </main>
      <CitizenFooter />

      {/* Floating chat assistant — visible on all citizen pages */}
      <CitizenChatBot />
    </div>
  );
}

export default CitizenLayout;