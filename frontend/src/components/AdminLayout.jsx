import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

const AdminLayout = ({ isAdmin, children }) => {
  const location = useLocation();
  const [ticketsOpen, setTicketsOpen] = useState(
    location.pathname.startsWith("/tickets")
  );

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed w-64 h-full bg-white shadow-md top-0 left-0 z-50 overflow-y-auto">
        <div className="p-4">
          <h1 className="text-2xl font-bold text-blue-600">DistrictOS</h1>
          <nav className="mt-6">
            <ul>
              {/* Tickets */}
              <li className="mb-2">
                <button
                  onClick={() => setTicketsOpen(!ticketsOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-full transition ${
                    location.pathname.startsWith("/tickets")
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="flex items-center">
                    <span className="mr-2">🎫</span> Tickets
                  </span>
                </button>

                {ticketsOpen && (
                  <ul className="pl-6 mt-2 space-y-1">
                    <li>
                      <Link
                        to="/tickets/submit"
                        className={`block text-sm px-3 py-1 rounded ${
                          isActive("/tickets/submit")
                            ? "text-blue-600 font-semibold"
                            : "text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        📥 Submit Ticket
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/tickets/admin-overview"
                        className={`block text-sm px-3 py-1 rounded ${
                          isActive("/tickets/admin-overview")
                            ? "text-blue-600 font-semibold"
                            : "text-gray-600 hover:text-blue-600"
                        }`}
                      >
                        📊 Admin Overview
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              {/* Inventory */}
              <li className="mb-2">
                <Link
                  to="/inventory"
                  className={`flex items-center px-4 py-2 rounded-full ${
                    isActive("/inventory")
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">📦</span> Inventory
                </Link>
              </li>

              {/* Users */}
              <li className="mb-2">
                <Link
                  to="/users"
                  className={`flex items-center px-4 py-2 rounded-full ${
                    isActive("/users")
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">👥</span> Users
                </Link>
              </li>

              {/* Campuses */}
              <li className="mb-2">
                <Link
                  to="/campuses"
                  className={`flex items-center px-4 py-2 rounded-full ${
                    isActive("/campuses")
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">🏫</span> Campuses
                </Link>
              </li>

              {/* Settings */}
              <li className="mb-2">
                <Link
                  to="/settings"
                  className={`flex items-center px-4 py-2 rounded-full ${
                    isActive("/settings")
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span className="mr-2">⚙️</span> Settings
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1">{children}</div>
    </div>
  );
};

export default AdminLayout;
