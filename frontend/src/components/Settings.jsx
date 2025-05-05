import React from "react";

const settingsModules = [
  { name: "Ticket Flow Builder", emoji: "🧩", color: "bg-blue-100", link: "/settings/ticket-flow-builder" },
  { name: "User Roles", emoji: "🛡️", color: "bg-green-100", link: "/settings/user-roles" },
  { name: "Notification Settings", emoji: "🔔", color: "bg-yellow-100", link: "/settings/notifications" },
  { name: "Audit Logs", emoji: "📜", color: "bg-purple-100", link: "/settings/audit-logs" },
];

import { Link } from "react-router-dom";

const Settings = () => {
  return (
    <div className="px-6 py-4">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {settingsModules.map((mod) => (
          <Link
            to={mod.link}
            key={mod.name}
            className={`p-6 rounded-xl shadow-sm hover:shadow-md transition cursor-pointer ${mod.color} block text-center`}
          >
            <div className="text-3xl mb-2">{mod.emoji}</div>
            <h2 className="text-lg font-semibold text-gray-800">{mod.name}</h2>
            <p className="text-sm text-gray-600">Configure {mod.name}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Settings;
