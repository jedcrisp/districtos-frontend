import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import { collection, doc, setDoc, addDoc } from "firebase/firestore";

const TicketFlowBuilder = ({ queues, setQueues }) => {
  const { queueName, "*": subcategoryPath } = useParams();
  const navigate = useNavigate();
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [saveStatus, setSaveStatus] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef(null);

  // Find the selected queue
  const queue = queueName
    ? queues.find((q) => q.name.toLowerCase() === queueName.toLowerCase())
    : null;

  if (!queue && queueName) {
    return <div className="p-6">Queue not found</div>;
  }

  // Navigate through subcategories based on path
  let currentLevel = queue ? queue.subcategories : queues;
  const pathSegments = subcategoryPath ? subcategoryPath.split("/") : [];
  const breadcrumb = queue ? [queue.name] : ["Ticket Flow Builder"];

  pathSegments.forEach((segment) => {
    const sub = currentLevel.find((s) => s.name.toLowerCase() === segment.toLowerCase());
    if (sub) {
      currentLevel = sub.subcategories;
      breadcrumb.push(sub.name);
    }
  });

  // Automatically focus the input field after navigation
  useEffect(() => {
    if (queue && inputRef.current) {
      inputRef.current.focus();
    }
  }, [queue, pathSegments]);

  // Add a subcategory
  const addSubcategory = (e) => {
    e.preventDefault();
    if (!newSubcategoryName.trim()) {
      alert(`${queue && pathSegments.length === 0 ? "Category" : "Subcategory"} name is required`);
      return;
    }
    const updatedQueues = [...queues];
    const targetQueue = updatedQueues.find((q) => q.name === queue.name);
    if (!targetQueue) return;

    let target = targetQueue.subcategories;
    pathSegments.forEach((segment) => {
      const sub = target.find((s) => s.name.toLowerCase() === segment.toLowerCase());
      if (sub) target = sub.subcategories;
    });

    target.push({ name: newSubcategoryName, subcategories: [] });
    setQueues(updatedQueues);
    setNewSubcategoryName("");
  };

  // Edit a category or subcategory
  const handleEditItem = (item, level) => {
    setEditingItem({ name: item.name, level });
    setEditName(item.name);
    setIsModalOpen(true);
  };

  const handleSaveItem = () => {
    if (!editName.trim()) {
      alert(`${editingItem.level === 0 ? "Category" : "Subcategory"} name is required`);
      return;
    }

    const updatedQueues = [...queues];
    const targetQueue = updatedQueues.find((q) => q.name === queue.name);
    if (!targetQueue) return;

    let target = targetQueue.subcategories;
    let currentPath = [];
    pathSegments.forEach((segment) => {
      const sub = target.find((s) => s.name.toLowerCase() === segment.toLowerCase());
      if (sub) {
        currentPath.push(sub);
        target = sub.subcategories;
      }
    });

    // Editing a category or subcategory at the current level
    const itemIndex = target.findIndex((item) => item.name === editingItem.name);
    target[itemIndex] = { ...target[itemIndex], name: editName };

    setQueues(updatedQueues);
    setEditingItem(null);
    setEditName("");
    setIsModalOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingItem(null);
    setEditName("");
    setIsModalOpen(false);
  };

  // Recursive function to save subcategories to Firestore
  const saveSubcategoriesToFirestore = async (subcategories, parentRef) => {
    for (const subcategory of subcategories) {
      const subDocRef = await addDoc(collection(parentRef, "subcategories"), {
        name: subcategory.name,
      });
      if (subcategory.subcategories && subcategory.subcategories.length > 0) {
        await saveSubcategoriesToFirestore(subcategory.subcategories, subDocRef);
      }
    }
  };

  // Save queues to Firestore
  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveStatus("Saving...");
      for (const queue of queues) {
        const queueRef = doc(db, "queues", queue.name.toLowerCase());
        await setDoc(queueRef, {
          name: queue.name,
          emoji: queue.emoji,
          color: queue.color,
        });
        if (queue.subcategories && queue.subcategories.length > 0) {
          await saveSubcategoriesToFirestore(queue.subcategories, queueRef);
        }
      }
      setSaveStatus("Flow saved successfully!");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      console.error("Error saving flow:", error);
      if (error.code === "permission-denied") {
        setSaveStatus("Failed to save: Insufficient permissions. Please sign in or check Firestore rules.");
      } else {
        setSaveStatus(`Failed to save flow: ${error.message}`);
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  // Render the main queue page (no editing allowed for queues)
  const renderMainQueuePage = () => (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">Queues</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {currentLevel.map((item) => (
            <Link
              to={`/settings/ticket-flow-builder/${item.name.toLowerCase()}`}
              key={item.name}
              className={`p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer ${
                item.color || "bg-gray-50"
              } block flex flex-col justify-center items-center text-center`}
            >
              {item.emoji && <div className="text-2xl mb-1">{item.emoji}</div>}
              <h3 className="text-lg font-semibold text-gray-800">{item.name}</h3>
            </Link>
          ))}
        </div>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => navigate("/settings")}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save Flow"}
        </button>
      </div>
      {saveStatus && (
        <p className={`mt-2 text-sm ${saveStatus.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
          {saveStatus}
        </p>
      )}
    </div>
  );

  // Render category/subcategory page with editing
  const renderCategorySubcategoryPage = () => (
    <div className="space-y-4">
      {/* Add Category/Subcategory */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          Add {pathSegments.length === 0 ? "Category" : "Subcategory"}{" "}
          {breadcrumb.length > 1 ? `for ${breadcrumb.slice(1).join(" > ")}` : ""}
        </h2>
        <form onSubmit={addSubcategory} className="flex items-center space-x-2">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {pathSegments.length === 0 ? "Category" : "Subcategory"} Name
            </label>
            <input
              ref={inputRef}
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder={`e.g., ${pathSegments.length === 0 ? "Network" : "Wi-Fi"}`}
            />
          </div>
          <button
            type="submit"
            className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add {pathSegments.length === 0 ? "Category" : "Subcategory"}
          </button>
        </form>
      </div>

      {/* Categories/Subcategories Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-800 mb-2">
          {pathSegments.length === 0 ? "Categories" : "Subcategories"}
        </h2>
        {currentLevel.length === 0 ? (
          <p className="text-gray-600 text-sm">
            No {pathSegments.length === 0 ? "categories" : "subcategories"} available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {currentLevel.map((item) => (
              <Link
                to={`/settings/ticket-flow-builder/${queueName.toLowerCase()}/${[
                  ...pathSegments,
                  item.name.toLowerCase(),
                ].join("/")}`}
                key={item.name}
                className={`p-4 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer bg-gray-50 block flex flex-col justify-center items-center text-center`}
              >
                <div className="flex justify-between items-center w-full mb-2">
                  <span className="text-lg font-semibold text-gray-800">{item.name}</span>
                  <button
                    onClick={(e) => {
                      e.preventDefault(); // Prevent navigation when clicking Edit
                      handleEditItem(item, pathSegments.length);
                    }}
                    className="text-blue-600 hover:underline text-sm"
                  >
                    Edit
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Save and Back Buttons */}
      <div className="flex space-x-2">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Back
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
            isSaving ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isSaving ? "Saving..." : "Save Flow"}
        </button>
      </div>
      {saveStatus && (
        <p className={`mt-2 text-sm ${saveStatus.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
          {saveStatus}
        </p>
      )}
    </div>
  );

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Ticket Flow Builder</h1>
      <div className="mb-2 text-gray-600">
        <nav className="flex text-sm">
          {breadcrumb.map((crumb, index) => (
            <span key={crumb}>
              {index > 0 && <span className="mx-1">{'>'}</span>}
              {index === breadcrumb.length - 1 ? (
                <span>{crumb}</span>
              ) : (
                <Link
                  to={
                    index === 0 && !queue
                      ? "/settings/ticket-flow-builder"
                      : `/settings/ticket-flow-builder/${queueName.toLowerCase()}/${pathSegments
                          .slice(0, index - 1)
                          .join("/")}`
                  }
                  className="text-blue-600 hover:underline"
                >
                  {crumb}
                </Link>
              )}
            </span>
          ))}
        </nav>
      </div>
      {queue ? renderCategorySubcategoryPage() : renderMainQueuePage()}
      {/* Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Edit {editingItem.level === 0 ? "Category" : "Subcategory"}
            </h3>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-4"
              placeholder={`Enter new ${editingItem.level === 0 ? "category" : "subcategory"} name`}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveItem}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TicketFlowBuilder;