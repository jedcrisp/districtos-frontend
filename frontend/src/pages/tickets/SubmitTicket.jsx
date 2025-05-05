import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const SubmitTicket = ({ queues }) => {
  const navigate = useNavigate();
  const [selectedQueue, setSelectedQueue] = useState("");
  const [categoryPath, setCategoryPath] = useState([]);
  const [description, setDescription] = useState("");
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleQueueSelect = (queueName) => {
    setSelectedQueue(queueName);
    setCategoryPath([]);
  };

  const handleCategorySelect = (categoryName) => {
    setCategoryPath([...categoryPath, categoryName]);
  };

  const handleBack = () => {
    setCategoryPath(categoryPath.slice(0, -1));
  };

  const getCategoriesForLevel = () => {
    if (!selectedQueue) return [];
    const queue = queues.find((q) => q.name === selectedQueue);
    if (!queue) return [];

    let currentLevel = queue.subcategories;
    for (let i = 0; i < categoryPath.length; i++) {
      if (!categoryPath[i] || !currentLevel) return [];
      const sub = currentLevel.find((s) => s.name === categoryPath[i]);
      currentLevel = sub ? sub.subcategories : [];
    }
    return currentLevel || [];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQueue) {
      setSubmitStatus("Please select a queue.");
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }
    if (!description.trim()) {
      setSubmitStatus("Please enter a ticket description.");
      setTimeout(() => setSubmitStatus(null), 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitStatus("Submitting ticket...");

      const ticketData = {
        queue: selectedQueue,
        categoryPath: categoryPath.length > 0 ? categoryPath : ["General"],
        description,
        createdAt: serverTimestamp(),
        userId: auth && auth.currentUser ? auth.currentUser.uid : "anonymous",
        status: "Open",
      };

      console.log("Attempting to save ticket:", ticketData);

      const docRef = await addDoc(collection(db, "tickets"), ticketData);

      console.log("Ticket saved successfully with ID:", docRef.id);

      setSubmitStatus("Ticket submitted successfully!");
      setTimeout(() => {
        setSubmitStatus(null);
        setSelectedQueue("");
        setCategoryPath([]);
        setDescription("");
        navigate("/tickets");
      }, 2000);
    } catch (error) {
      console.error("Error submitting ticket:", error, {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      if (error.code === "permission-denied") {
        setSubmitStatus("Failed to submit: Insufficient permissions. Please check Firestore rules.");
      } else {
        setSubmitStatus(`Failed to submit ticket: ${error.message} (Code: ${error.code})`);
      }
      setTimeout(() => setSubmitStatus(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentCategories = getCategoriesForLevel();

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Submit a Ticket</h1>
      <div className="mb-2 text-gray-600">
        <nav className="flex text-sm">
          {selectedQueue ? (
            <>
              <span
                onClick={() => {
                  setSelectedQueue("");
                  setCategoryPath([]);
                }}
                className="text-blue-600 hover:underline cursor-pointer"
              >
                Queue
              </span>
              <span className="mx-1">{'>'}</span>
              <span>{selectedQueue}</span>
              {categoryPath.map((category, index) => (
                <React.Fragment key={index}>
                  <span className="mx-1">{'>'}</span>
                  {index === categoryPath.length - 1 ? (
                    <span>{category}</span>
                  ) : (
                    <span
                      onClick={() => setCategoryPath(categoryPath.slice(0, index + 1))}
                      className="text-blue-600 hover:underline cursor-pointer"
                    >
                      {category}
                    </span>
                  )}
                </React.Fragment>
              ))}
            </>
          ) : (
            <span>Queue</span>
          )}
        </nav>
      </div>
      {!selectedQueue ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Select a Queue</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {queues.map((queue) => (
              <div
                key={queue.name}
                onClick={() => handleQueueSelect(queue.name)}
                className={`p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer ${queue.color || "bg-gray-50"} block`}
              >
                <div className="text-2xl mb-1">{queue.emoji}</div>
                <h3 className="text-base font-semibold text-gray-800">{queue.name}</h3>
                <p className="text-xs text-gray-600">Submit a ticket for {queue.name}</p>
              </div>
            ))}
          </div>
        </div>
      ) : currentCategories.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Select a {categoryPath.length === 0 ? "Category" : "Subcategory"}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentCategories.map((category) => (
              <div
                key={category.name}
                onClick={() => handleCategorySelect(category.name)}
                className="p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-gray-50 block"
              >
                <h3 className="text-base font-semibold text-gray-800">{category.name}</h3>
                <p className="text-xs text-gray-600">
                  Select {category.name} {categoryPath.length === 0 ? "category" : "subcategory"}
                </p>
              </div>
            ))}
          </div>
          <button
            onClick={handleBack}
            className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ticket Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows="4"
              placeholder="Describe your issue..."
            />
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
          {submitStatus && (
            <p className={`mt-2 text-sm ${submitStatus.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
              {submitStatus}
            </p>
          )}
        </form>
      )}
    </div>
  );
};

export default SubmitTicket;