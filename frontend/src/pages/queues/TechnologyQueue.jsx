import React, { useState } from "react";

const dummyTickets = [
  {
    id: 1,
    title: "Projector not working in Room 204",
    submittedBy: "Jane Smith",
    date: "2025-05-03",
    priority: "High",
    status: "Open",
  },
  {
    id: 2,
    title: "Chromebook won't charge",
    submittedBy: "Mike Johnson",
    date: "2025-05-01",
    priority: "Medium",
    status: "In Progress",
  },
];

const TechnologyQueue = () => {
  const [filter, setFilter] = useState("All");

  const filteredTickets =
    filter === "All"
      ? dummyTickets
      : dummyTickets.filter((t) => t.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">💻 Technology Tickets</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          + Create Ticket
        </button>
      </div>

      <div className="mb-4">
        <label className="mr-2 text-gray-700">Filter:</label>
        <select
          className="border border-gray-300 rounded p-1"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option>All</option>
          <option>Open</option>
          <option>In Progress</option>
          <option>Closed</option>
        </select>
      </div>

      <div className="bg-white shadow rounded overflow-x-auto">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase">
            <tr>
              <th className="p-3">Title</th>
              <th className="p-3">Submitted By</th>
              <th className="p-3">Date</th>
              <th className="p-3">Priority</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredTickets.map((ticket) => (
              <tr key={ticket.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{ticket.title}</td>
                <td className="p-3">{ticket.submittedBy}</td>
                <td className="p-3">{ticket.date}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.priority === "High"
                        ? "bg-red-100 text-red-600"
                        : ticket.priority === "Medium"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-green-100 text-green-700"
                    }`}
                  >
                    {ticket.priority}
                  </span>
                </td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ticket.status === "Open"
                        ? "bg-blue-100 text-blue-600"
                        : ticket.status === "In Progress"
                        ? "bg-orange-100 text-orange-600"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {ticket.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TechnologyQueue;
