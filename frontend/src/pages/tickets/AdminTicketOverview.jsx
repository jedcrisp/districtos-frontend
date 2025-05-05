import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, orderBy, doc, updateDoc } from "firebase/firestore";

const AdminTicketOverview = ({ queues }) => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [sortByStatus, setSortByStatus] = useState("All");
  const campuses = ["North Campus", "South Campus", "East Campus"];
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    ticketId: true,
    queue: true,
    categoryPath: true,
    description: true,
    assignedTech: true,
    campus: true,
    status: true,
    createdAt: true,
  });

  // Fetch tickets and technicians on load
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setFetchError(null);

        // Fetch tickets
        console.log("Fetching tickets from Firestore...");
        const ticketsRef = collection(db, "tickets");
        const q = sortByStatus === "All" ? ticketsRef : query(ticketsRef, orderBy("status"));
        const ticketSnapshot = await getDocs(q);
        const ticketList = ticketSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          editedQueue: doc.data().queue,
          editedCategoryPath: doc.data().categoryPath || [],
          editedTechnician: doc.data().technician || "",
          editedCampus: doc.data().campus || "",
          editedStatus: doc.data().status || "Open",
          saveStatus: null,
          saving: false,
        }));
        console.log("Fetched tickets:", ticketList);
        setTickets(ticketList);

        // Fetch technicians
        console.log("Fetching technicians from Firestore...");
        const techniciansRef = collection(db, "technicians");
        const techniciansSnap = await getDocs(techniciansRef);
        const technicianList = techniciansSnap.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        console.log("Fetched technicians:", technicianList);
        setTechnicians(technicianList);
      } catch (error) {
        console.error("Error fetching data:", error, {
          code: error.code,
          message: error.message,
          details: error.details,
        });
        if (error.code === "permission-denied") {
          setFetchError("Failed to fetch data: Insufficient permissions. Please check Firestore rules.");
        } else {
          setFetchError(`Failed to fetch data: ${error.message} (Code: ${error.code})`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [sortByStatus]);

  // Auto-save when a dropdown value changes
  const autoSave = async (ticketId) => {
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    try {
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === ticketId ? { ...t, saving: true, saveStatus: "Saving..." } : t
        )
      );

      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        queue: ticket.editedQueue,
        categoryPath: ticket.editedCategoryPath.length > 0 ? ticket.editedCategoryPath : ["General"],
        technician: ticket.editedTechnician || null,
        campus: ticket.editedCampus || null,
        status: ticket.editedStatus,
      });

      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === ticketId
            ? {
                ...t,
                queue: t.editedQueue,
                categoryPath: t.editedCategoryPath,
                technician: t.editedTechnician,
                campus: t.editedCampus,
                status: t.editedStatus,
                saveStatus: "Saved successfully!",
                saving: false,
              }
            : t
        )
      );

      setTimeout(() => {
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === ticketId ? { ...t, saveStatus: null } : t
          )
        );
      }, 2000);
    } catch (error) {
      console.error("Error saving ticket:", error, {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      const errorMessage =
        error.code === "permission-denied"
          ? "Failed to save: Insufficient permissions. Please check Firestore rules."
          : `Failed to save ticket: ${error.message} (Code: ${error.code})`;
      setTickets((prevTickets) =>
        prevTickets.map((t) =>
          t.id === ticketId
            ? { ...t, saveStatus: errorMessage, saving: false }
            : t
        )
      );
      setTimeout(() => {
        setTickets((prevTickets) =>
          prevTickets.map((t) =>
            t.id === ticketId ? { ...t, saveStatus: null } : t
          )
        );
      }, 5000);
    }
  };

  // Handle queue change
  const handleQueueChange = (ticketId, newQueue) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, editedQueue: newQueue, editedCategoryPath: [] }
          : ticket
      )
    );
    autoSave(ticketId);
  };

  // Flatten the category hierarchy for a given queue
  const getCategoryOptions = (queueName) => {
    const queue = queues.find((q) => q.name === queueName);
    if (!queue || !queue.subcategories) return [];

    const options = [];
    const traverse = (categories, currentPath = []) => {
      categories.forEach((category) => {
        const newPath = [...currentPath, category.name];
        options.push(newPath);
        if (category.subcategories && category.subcategories.length > 0) {
          traverse(category.subcategories, newPath);
        }
      });
    };

    traverse(queue.subcategories);
    return options;
  };

  // Handle category path change
  const handleCategoryPathChange = (ticketId, value) => {
    const path = value ? value.split(" > ") : [];
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, editedCategoryPath: path } : ticket
      )
    );
    autoSave(ticketId);
  };

  // Handle technician, campus, and status changes
  const handleFieldChange = (ticketId, field, value) => {
    setTickets((prevTickets) =>
      prevTickets.map((ticket) =>
        ticket.id === ticketId ? { ...ticket, [field]: value } : ticket
      )
    );
    autoSave(ticketId);
  };

  const handleSortChange = (e) => {
    setSortByStatus(e.target.value);
  };

  const toggleColumn = (column) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const columns = [
    { key: "ticketId", label: "Ticket ID" },
    { key: "queue", label: "Queue" },
    { key: "categoryPath", label: "Category Path" },
    { key: "description", label: "Description" },
    { key: "assignedTech", label: "Assigned Tech" },
    { key: "campus", label: "Campus" },
    { key: "status", label: "Status" },
    { key: "createdAt", label: "Created At" },
  ];

  return (
    <div className="w-full min-h-screen">
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-xl font-bold text-gray-800">Admin Ticket Overview</h1>
          <div className="flex space-x-2">
            <button
              onClick={() => setIsColumnModalOpen(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Column View
            </button>
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
            <button
              onClick={() => navigate("/tickets")}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back
            </button>
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <select
            value={sortByStatus}
            onChange={handleSortChange}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
        {loading ? (
          <p className="text-gray-600">Loading tickets...</p>
        ) : fetchError ? (
          <p className="text-red-600">{fetchError}</p>
        ) : tickets.length === 0 ? (
          <p className="text-gray-600">No tickets found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg shadow-sm">
              <thead>
                <tr className="text-gray-800 text-sm">
                  {columns.map((column) =>
                    visibleColumns[column.key] && (
                      <th key={column.key} className="p-3 text-left border-b">
                        {column.label}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="text-gray-600 text-sm hover:bg-gray-100">
                    {visibleColumns.ticketId && (
                      <td className="p-3 border-b">
                        <Link
                          to={`/tickets/edit/${ticket.id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {ticket.id}
                        </Link>
                      </td>
                    )}
                    {visibleColumns.queue && (
                      <td className="p-3 border-b">
                        <select
                          value={ticket.editedQueue}
                          onChange={(e) => handleQueueChange(ticket.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {queues.map((queue) => (
                            <option key={queue.name} value={queue.name}>
                              {queue.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {visibleColumns.categoryPath && (
                      <td className="p-3 border-b">
                        <select
                          value={ticket.editedCategoryPath.join(" > ")}
                          onChange={(e) => handleCategoryPathChange(ticket.id, e.target.value)}
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Category Path</option>
                          {getCategoryOptions(ticket.editedQueue).map((path) => (
                            <option key={path.join(" > ")} value={path.join(" > ")}>
                              {path.join(" > ")}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {visibleColumns.description && (
                      <td className="p-3 border-b">{ticket.description}</td>
                    )}
                    {visibleColumns.assignedTech && (
                      <td className="p-3 border-b">
                        <select
                          value={ticket.editedTechnician}
                          onChange={(e) =>
                            handleFieldChange(ticket.id, "editedTechnician", e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Unassigned</option>
                          {technicians.map((tech) => (
                            <option key={tech.id} value={tech.name}>
                              {tech.name}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {visibleColumns.campus && (
                      <td className="p-3 border-b">
                        <select
                          value={ticket.editedCampus}
                          onChange={(e) =>
                            handleFieldChange(ticket.id, "editedCampus", e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select Campus</option>
                          {campuses.map((campus) => (
                            <option key={campus} value={campus}>
                              {campus}
                            </option>
                          ))}
                        </select>
                      </td>
                    )}
                    {visibleColumns.status && (
                      <td className="p-3 border-b">
                        <select
                          value={ticket.editedStatus}
                          onChange={(e) =>
                            handleFieldChange(ticket.id, "editedStatus", e.target.value)
                          }
                          className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="Open">Open</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Closed">Closed</option>
                        </select>
                      </td>
                    )}
                    {visibleColumns.createdAt && (
                      <td className="p-3 border-b">
                        {ticket.createdAt
                          ? new Date(ticket.createdAt.toDate()).toLocaleString()
                          : "N/A"}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      {/* Column View Modal */}
      {isColumnModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Columns to Display</h3>
            <div className="space-y-2">
              {columns.map((column) => (
                <div key={column.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={visibleColumns[column.key]}
                    onChange={() => toggleColumn(column.key)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 text-sm text-gray-700">{column.label}</label>
                </div>
              ))}
            </div>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsColumnModalOpen(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTicketOverview;