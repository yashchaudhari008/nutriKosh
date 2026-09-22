import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddFood from "./pages/AddFood";
import WeightLog from "./pages/WeightLog";
import FoodHistory from "./pages/FoodHistory";
import WeightInsights from "./pages/WeightInsights";
import AdminFoods from "./pages/AdminFoods";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/food/add"
        element={
          <ProtectedRoute>
            <AddFood />
          </ProtectedRoute>
        }
      />
      <Route
        path="/weight"
        element={
          <ProtectedRoute>
            <WeightLog />
          </ProtectedRoute>
        }
      />
      <Route
        path="/history/food"
        element={
          <ProtectedRoute>
            <FoodHistory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/insights/weight"
        element={
          <ProtectedRoute>
            <WeightInsights />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/foods"
        element={
          <ProtectedRoute>
            <AdminFoods />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
