import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./firebase/config";
import { doc, getDoc } from "firebase/firestore";

import LoginPage from "./pages/LoginPage";
import SignInPage from "./pages/SignInPage";
import Dashboard from "./pages/Dashboard";
import SetRatesPage from "./pages/SetRatesPage";

function App() {
  const [user, setUser] = useState(null);
  const [hasSetRates, setHasSetRates] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        const ref = doc(db, "shopkeepers", firebaseUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists() && snap.data().hasSetRates) {
          setHasSetRates(true);
        } else {
          setHasSetRates(false);
        }
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <p className="p-10">🔄 Loading...</p>;

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              hasSetRates ? <Navigate to="/dashboard" /> : <Navigate to="/set-rates" />
            ) : (
              <SignInPage />
            )
          }
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/dashboard" /> : <LoginPage />}
        />
        <Route
          path="/dashboard"
          element={user ? <Dashboard user={user} /> : <Navigate to="/" />}
        />
        <Route
          path="/set-rates"
          element={user ? <SetRatesPage user={user} /> : <Navigate to="/" />}
        />
      </Routes>
    </Router>
  );
}

export default App;
