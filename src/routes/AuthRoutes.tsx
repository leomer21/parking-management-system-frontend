import { Navigate, Route, Routes } from "react-router-dom";
import AuthLayout from "../layout/AuthLayout";
import Logout from "../pages/Logout";
import Dashboard from "../pages/Dashboard";
import MyLots from "../pages/MyLots";
import ParkingSessions from "../pages/ParkingSessions";
import Permits from "../pages/Permits";
import UnenforcableDates from "../pages/UnenforcableDates";
import UserManagement from "../pages/UserManagement";
import Inbox from "../pages/Inbox";

const AuthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<AuthLayout />}>
        <Route index element={<Navigate to="/dashboard" replace={true} />} />
        <Route path="logout" element={<Logout />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="manage-user" element={<UserManagement />} />
        <Route path="my-lots" element={<MyLots />} />
        <Route path="parking-sessions" element={<ParkingSessions />} />
        <Route path="permits" element={<Permits />} />
        <Route path="unenforcable-dates" element={<UnenforcableDates />} />
        <Route path="inbox" element={<Inbox />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace={true} />} />
    </Routes>
  );
};
export default AuthRoutes;
