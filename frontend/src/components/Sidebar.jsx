import React from "react";
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <div className="fixed w-64 h-full bg-gray-800 text-white top-0 left-0 z-50 overflow-y-auto">
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <Link to="/tickets/submit" className="text-white hover:underline">
              Submit a Ticket
            </Link>
          </li>
          <li className="mb-2">
            <Link to="/tickets/admin-overview" className="text-white hover:underline">
              Admin Tickets
            </Link>
          </li>
          {/* Add other sidebar links as needed */}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;