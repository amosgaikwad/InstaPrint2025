// src/App.js
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase/config";

// Pages
import LoginPage from "./pages/LoginPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/Dashboard"; 
import SetRatesPage from "./pages/SetRatesPage";
import SetMaterialPage from "./pages/SetMaterialPage";
import NewRequests from "./pages/NewRequests";
import RequestDetails from "./pages/RequestDetails";
import PaymentCollectionPage from "./pages/PaymentCollectionPage";

// Wrapper to safely provide shopId to NewRequests
function NewRequestsWrapper() {
  const { shopId } = useOutletContext();
  if (!shopId) return <p className="p-10 text-xl font-semibold text-blue-600">🔄 Loading shop data...</p>;
  return <NewRequests shopId={shopId} />;
}

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="p-10 text-xl font-semibold text-blue-600">🔄 Loading authentication status...</p>;
  }

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    return user ? children : <Navigate to="/" replace />;
  };

  return (
    <Router>
      <Routes>
        {/* Root path */}
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <SignInPage />}
        />

        {/* Registration */}
        <Route path="/register" element={<LoginPage />} />

        {/* Dashboard with nested routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        >
          {/* Nested routes */}
          <Route index element={<Navigate to="new-requests" replace />} />

          {/* New Requests */}
          <Route path="new-requests" element={<NewRequestsWrapper />} />

          {/* Request Details */}
          <Route path="request/:shopId/:reqId" element={<RequestDetails />} />

          {/* Other Dashboard pages */}
          <Route path="set-material" element={<SetMaterialPage />} />
          <Route path="set-rates" element={<SetRatesPage />} />
          <Route path="payment" element={<PaymentCollectionPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
