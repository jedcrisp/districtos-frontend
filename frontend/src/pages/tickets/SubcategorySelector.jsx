import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SubcategorySelector = ({ queues }) => {
  const { queueName, "*": subcategoryPath } = useParams();
  const navigate = useNavigate();
  const [ticketDescription, setTicketDescription] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const queue = queues.find((q) => q.name.toLowerCase() === queueName?.toLowerCase());
  if (!queue) return <div className="p-4">Queue not found</div>;

  let currentLevel = queue.subcategories;
  const pathSegments = subcategoryPath ? subcategoryPath.split("/") : [];
  const breadcrumb = [queue.name];

  pathSegments.forEach((segment) => {
    const sub = currentLevel.find((s) => s.name.toLowerCase() === segment.toLowerCase());
    if (sub) {
      currentLevel = sub.subcategories;
      breadcrumb.push(sub.name);
    }
  });

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketDescription.trim()) {
      setSubmitStatus("Please enter a ticket description.");
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus("Submitting ticket...");

      await addDoc(collection(db, "tickets"), {
        queue: queue.name,
        categoryPath: pathSegments.length > 0 ? pathSegments : ["General"],
        description: ticketDescription,
        createdAt: serverTimestamp(),
        userId: auth.currentUser ? auth.currentUser.uid : "anonymous",
        status: "Open",
      });

      setSubmitStatus("Ticket submitted successfully!");
      setTimeout(() => {
        setSubmitStatus(null);
        setTicketDescription("");
        navigate(`/tickets/${queueName.toLowerCase()}`);
      }, 2000);
    } catch (error) {
      console.error("Error submitting ticket:", error);
      if (error.code === "permission-denied") {
        setSubmitStatus("Insufficient permissions. Please sign in or check access.");
      } else {
        setSubmitStatus(`Failed to submit ticket: ${error.message}`);
      }
      setTimeout(() => setSubmitStatus(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">{queue.name} Ticket Queue</h1>
      <div className="mb-4 text-sm text-gray-600">
        <nav className="flex flex-wrap items-center">
          {breadcrumb.map((crumb, index) => (
            <span key={crumb} className="flex items-center">
              {index > 0 && <span className="mx-1">›</span>}
              {index === breadcrumb.length - 1 ? (
                <span>{crumb}</span>
              ) : (
                <Link
                  to={`/tickets/${queueName.toLowerCase()}/${pathSegments.slice(0, index).join("/")}`}
                  className="text-blue-600 hover:underline"
                >
                  {crumb}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>

      {currentLevel.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Select a Subcategory</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentLevel.map((sub) => (
              <Link
                to={`/tickets/${queueName.toLowerCase()}/${[...pathSegments, sub.name.toLowerCase()].join("/")}`}
                key={sub.name}
              className={`p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer ${sub.color || 'bg-gray-50'} block flex flex-col justify-center items-center text-center`}
              >
                {queue.emoji && <div className="text-2xl mb-1">{queue.emoji}</div>}
                <h3 className="text-lg font-semibold text-gray-800">{sub.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Submit a Ticket</h2>
          <form onSubmit={handleSubmitTicket} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ticket Description
              </label>
              <textarea
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Describe your issue..."
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
            {submitStatus && (
              <p
                className={`text-sm mt-2 ${
                  submitStatus.includes("Failed") ? "text-red-600" : "text-green-600"
                }`}
              >
                {submitStatus}
              </p>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default SubcategorySelector;