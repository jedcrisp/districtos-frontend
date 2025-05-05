import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import TicketQueues from "./pages/tickets/TicketQueues";
import SubcategorySelector from "./pages/tickets/SubcategorySelector";
import SubmitTicket from "./pages/tickets/SubmitTicket";
import AdminTicketOverview from "./pages/tickets/AdminTicketOverview";
import EditTicket from "./pages/tickets/EditTicket";
import Settings from "./components/Settings";
import TicketFlowBuilder from "./pages/TicketFlowBuilder";
import { auth } from "./firebaseConfig";
import { signInAnonymously, onAuthStateChanged } from "firebase/auth";

const initialQueues = [
  {
    name: "Technology",
    emoji: "💻",
    color: "bg-blue-100",
    subcategories: [
      { name: "Network", color: "bg-blue-50", subcategories: [{ name: "Wi-Fi", subcategories: [] }] },
      { name: "Phones", color: "bg-blue-50", subcategories: [{ name: "VoIP", subcategories: [] }] },
      { name: "Security", color: "bg-blue-50", subcategories: [] },
    ],
  },
  {
    name: "Operations",
    emoji: "🏗️",
    color: "bg-purple-100",
    subcategories: [],
  },
  {
    name: "Finance",
    emoji: "💰",
    color: "bg-green-100",
    subcategories: [],
  },
  {
    name: "Human Resources",
    emoji: "🧑‍💼",
    color: "bg-yellow-100",
    subcategories: [],
  },
  {
    name: "PEIMS",
    emoji: "📊",
    color: "bg-pink-100",
    subcategories: [],
  },
  {
    name: "CTE",
    emoji: "🛠️",
    color: "bg-orange-100",
    subcategories: [],
  },
  {
    name: "SPED",
    emoji: "🎓",
    color: "bg-indigo-100",
    subcategories: [],
  },
  {
    name: "Security",
    emoji: "🛡️",
    color: "bg-red-100",
    subcategories: [],
  },
  {
    name: "Food Services",
    emoji: "🥗",
    color: "bg-lime-100",
    subcategories: [],
  },
];

function App() {
  const [queues, setQueues] = useState(initialQueues);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        console.log("User signed in:", currentUser.uid);
      } else {
        signInAnonymously(auth)
          .then((result) => {
            setUser(result.user);
            console.log("Signed in anonymously:", result.user.uid);
          })
          .catch((error) => {
            console.error("Anonymous sign-in failed:", error);
          });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <Router>
      <AdminLayout isAdmin={true}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h1 className="text-2xl font-bold text-gray-800">Welcome, Admin</h1>
                <p className="mt-2 text-gray-600">
                  Manage tickets, inventory, and users from this dashboard.
                </p>
              </>
            }
          />
          <Route path="/tickets" element={<TicketQueues queues={queues} />} />
          <Route path="/tickets/submit" element={<SubmitTicket queues={queues} />} />
          <Route path="/tickets/admin-overview" element={<AdminTicketOverview queues={queues} />} />
          <Route path="/tickets/edit/:ticketId" element={<EditTicket />} />
          <Route
            path="/tickets/:queueName/*"
            element={<SubcategorySelector queues={queues} />}
          />
          <Route path="/settings" element={<Settings />} />
          <Route
            path="/settings/ticket-flow-builder/:queueName?/*"
            element={<TicketFlowBuilder queues={queues} setQueues={setQueues} />}
          />
          <Route path="/inventory" element={<div>Inventory Page</div>} />
          <Route path="/users" element={<div>Users Page</div>} />
        </Routes>
      </AdminLayout>
    </Router>
  );
}

export default App;
