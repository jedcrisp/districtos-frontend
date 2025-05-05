import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, auth } from "../../firebaseConfig";
import { doc, getDoc, updateDoc, collection, getDocs } from "firebase/firestore";

// Static list of campuses (same as AdminTicketOverview.jsx)
const campuses = ["North Campus", "South Campus", "East Campus"];

// Static list of queues (copied from App.jsx for simplicity; ideally, this should be passed as a prop)
const queues = [
  { name: "Technology", subcategories: [{ name: "Network", subcategories: [{ name: "Wi-Fi", subcategories: [] }] }, { name: "Phones", subcategories: [{ name: "VoIP", subcategories: [] }] }, { name: "Security", subcategories: [] }] },
  { name: "Operations", subcategories: [] },
  { name: "Finance", subcategories: [] },
  { name: "Human Resources", subcategories: [] },
  { name: "PEIMS", subcategories: [] },
  { name: "CTE", subcategories: [] },
  { name: "SPED", subcategories: [] },
  { name: "Security", subcategories: [] },
  { name: "Food Services", subcategories: [] },
];

const EditTicket = () => {
  const { ticketId } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [userDetails, setUserDetails] = useState({ name: "", email: "" });
  const [editedQueue, setEditedQueue] = useState("");
  const [editedCategoryPath, setEditedCategoryPath] = useState([]);
  const [editedTechnician, setEditedTechnician] = useState("");
  const [editedCampus, setEditedCampus] = useState("");
  const [editedStatus, setEditedStatus] = useState("");
  const [editedUserName, setEditedUserName] = useState("");
  const [editedUserEmail, setEditedUserEmail] = useState("");
  const [editedUserCampus, setEditedUserCampus] = useState("");
  const [editedRoomNumber, setEditedRoomNumber] = useState("");
  const [editedClosureNotes, setEditedClosureNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);
  const [techniciansError, setTechniciansError] = useState(null);

  useEffect(() => {
    const fetchTicketAndData = async () => {
      try {
        setLoading(true);

        // Fetch ticket data
        const ticketRef = doc(db, "tickets", ticketId);
        const ticketSnap = await getDoc(ticketRef);
        if (ticketSnap.exists()) {
          const ticketData = { id: ticketSnap.id, ...ticketSnap.data() };
          setTicket(ticketData);
          setEditedQueue(ticketData.queue || "");
          setEditedCategoryPath(ticketData.categoryPath || []);
          setEditedTechnician(ticketData.technician || "");
          setEditedCampus(ticketData.campus || "");
          setEditedStatus(ticketData.status || "Open");
          setEditedUserName(ticketData.userName || "");
          setEditedUserEmail(ticketData.userEmail || "");
          setEditedUserCampus(ticketData.userCampus || "");
          setEditedRoomNumber(ticketData.roomNumber || "");
          setEditedClosureNotes(ticketData.closureNotes || "");
        } else {
          setSaveStatus("Ticket not found.");
          setTimeout(() => setSaveStatus(null), 3000);
        }

        // Fetch user details (assuming a users collection with userId)
        if (ticketSnap.exists() && ticketSnap.data().userId) {
          const userRef = doc(db, "users", ticketSnap.data().userId);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setUserDetails({
              name: userData.name || "Unknown User",
              email: userData.email || "N/A",
            });
            setEditedUserName(userData.name || "");
            setEditedUserEmail(userData.email || "");
            setEditedUserCampus(userData.campus || "");
          } else {
            setUserDetails({ name: "User Not Found", email: "N/A" });
          }
        }

        // Fetch technicians
        try {
          const techniciansRef = collection(db, "technicians");
          const techniciansSnap = await getDocs(techniciansRef);
          const technicianList = techniciansSnap.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }));
          setTechnicians(technicianList);
          if (technicianList.length === 0) {
            setTechniciansError("No technicians available. Please contact an administrator.");
          }
        } catch (error) {
          console.error("Error fetching technicians:", error);
          setTechniciansError("Failed to load technicians: " + error.message);
        }
      } catch (error) {
        console.error("Error fetching ticket:", error);
        setSaveStatus(`Failed to load ticket: ${error.message}`);
        setTimeout(() => setSaveStatus(null), 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketAndData();
  }, [ticketId]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setSaveStatus("Saving...");

      const ticketRef = doc(db, "tickets", ticketId);
      await updateDoc(ticketRef, {
        queue: editedQueue,
        categoryPath: editedCategoryPath.length > 0 ? editedCategoryPath : ["General"],
        technician: editedTechnician || null,
        campus: editedCampus || null,
        status: editedStatus,
        userName: editedUserName,
        userEmail: editedUserEmail,
        userCampus: editedUserCampus,
        roomNumber: editedRoomNumber,
        closureNotes: editedClosureNotes,
      });

      setSaveStatus("Ticket updated successfully!");
      setTimeout(() => {
        setSaveStatus(null);
        navigate("/tickets/admin-overview");
      }, 2000);
    } catch (error) {
      console.error("Error updating ticket:", error);
      if (error.code === "permission-denied") {
        setSaveStatus("Failed to save: Insufficient permissions. Please check Firestore rules.");
      } else {
        setSaveStatus(`Failed to save ticket: ${error.message}`);
      }
      setTimeout(() => setSaveStatus(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="p-4 text-gray-600">Loading ticket...</p>;
  }

  if (!ticket) {
    return <p className="p-4 text-gray-600">Ticket not found.</p>;
  }

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold text-gray-800 mb-2">Edit Ticket: {ticket.id}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="border border-gray-200 bg-gray-50 p-4 rounded-lg">
          <div className="flex items-start space-x-8">
            <div className="space-y-4 flex-1">
              <h2 className="text-md font-semibold text-gray-800">Ticket Details</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Queue</label>
                <select
                  value={editedQueue}
                  onChange={(e) => {
                    setEditedQueue(e.target.value);
                    setEditedCategoryPath([]);
                  }}
                  className="w-52 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {queues.map((queue) => (
                    <option key={queue.name} value={queue.name}>
                      {queue.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Path</label>
                <select
                  value={editedCategoryPath.join(" > ")}
                  onChange={(e) => {
                    const path = e.target.value ? e.target.value.split(" > ") : [];
                    setEditedCategoryPath(path);
                  }}
                  className="w-52 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Category Path</option>
                  {getCategoryOptions(editedQueue).map((path) => (
                    <option key={path.join(" > ")} value={path.join(" > ")}>
                      {path.join(" > ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-gray-600">{ticket.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-gray-600">
                  {ticket.createdAt
                    ? new Date(ticket.createdAt.toDate()).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <h3 className="text-md font-semibold text-gray-800">Closure Details</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editedStatus}
                  onChange={(e) => setEditedStatus(e.target.value)}
                  className="w-52 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closure Notes</label>
                <textarea
                  value={editedClosureNotes}
                  onChange={(e) => setEditedClosureNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows="5"
                  placeholder="Enter closure notes..."
                />
              </div>
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
          <input
            type="text"
            value={editedUserName}
            onChange={(e) => setEditedUserName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter user name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User Email</label>
          <input
            type="email"
            value={editedUserEmail}
            onChange={(e) => setEditedUserEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter user email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">User Campus</label>
          <select
            value={editedUserCampus}
            onChange={(e) => setEditedUserCampus(e.target.value)}
            className="w-52 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Campus</option>
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
          <input
            type="text"
            value={editedRoomNumber}
            onChange={(e) => setEditedRoomNumber(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter room number"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assign Technician</label>
          {techniciansError ? (
            <p className="text-red-600 text-sm">{techniciansError}</p>
          ) : (
            <select
              value={editedTechnician}
              onChange={(e) => setEditedTechnician(e.target.value)}
              className="w-52 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Unassigned</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.name}>
                  {tech.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Campus</label>
          <select
            value={editedCampus}
            onChange={(e) => setEditedCampus(e.target.value)}
            className="w-52 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Campus</option>
            {campuses.map((campus) => (
              <option key={campus} value={campus}>
                {campus}
              </option>
            ))}
          </select>
        </div>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => navigate("/tickets/admin-overview")}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={saving}
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
              saving ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
        {saveStatus && (
          <p className={`mt-2 text-sm ${saveStatus.includes("Failed") ? "text-red-600" : "text-green-600"}`}>
            {saveStatus}
          </p>
        )}
      </form>
    </div>
  );
};

export default EditTicket;