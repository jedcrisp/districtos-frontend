import React from "react";
import { Link } from "react-router-dom";

const queues = [
  { name: "Technology", emoji: "💻", color: "bg-blue-100" },
  { name: "Operations", emoji: "🏗️", color: "bg-purple-100" },
  { name: "Finance", emoji: "💰", color: "bg-green-100" },
  { name: "Human Resources", emoji: "🧑‍💼", color: "bg-yellow-100" },
  { name: "PEIMS", emoji: "📊", color: "bg-pink-100" },
  { name: "CTE", emoji: "🛠️", color: "bg-orange-100" },
  { name: "SPED", emoji: "🎓", color: "bg-indigo-100" },
  { name: "Security", emoji: "🛡️", color: "bg-red-100" },
  { name: "Food Services", emoji: "🥗", color: "bg-lime-100" },
];

const TicketQueues = ({ queues }) => {
  return (
    <div className="px-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Ticket Queues</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {queues.map((queue) => (
          <Link
            to={`/tickets/${queue.name.toLowerCase()}`}
            key={queue.name}
            className={`p-4 rounded-lg shadow-sm transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer ${queue.color} block flex flex-col justify-center items-center text-center`}
          >
            <div className="text-2xl mb-1">{queue.emoji}</div>
            <h2 className="text-lg font-semibold text-gray-800">{queue.name}</h2>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default TicketQueues;
