import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import WorkerDashboard from "./pages/Worker/WorkerDashboard";
import Login from "./components/Auth/Login";
import { useAuth } from "./hooks/useAuth";
import DisplayWorkersPage from "./pages/Admin/DisplayWorkers";
import Tasks from "./pages/Admin/Tasks";
import WorkerTasks from "./pages/Worker/WorkerTasks";

const App = () => {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            !user ? (
              <Login />
            ) : (
              <Navigate to={user.role === "admin" ? "/admin" : "/worker"} />
            )
          }
        />

        <Route element={<DashboardLayout />}>
          <Route
            path="/admin"
            element={
              user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/" />
            }
          />
          <Route
            path="/admin/tasks"
            element={user?.role === "admin" ? <Tasks /> : <Navigate to="/" />}
          />
          <Route
            path="/admin/team"
            element={
              user?.role === "admin" ? (
                <DisplayWorkersPage />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/worker"
            element={
              user?.role === "worker" ? (
                <WorkerDashboard />
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/worker/tasks"
            element={
              user?.role === "worker" ? (
                <WorkerTasks />
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
