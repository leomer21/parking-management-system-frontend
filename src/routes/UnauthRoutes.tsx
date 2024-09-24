import { Navigate, Route, Routes } from "react-router-dom";
import UnauthLayout from "../layout/UnauthLayout";
import Login from "../pages/Login";
import LoginSuccess from "../pages/LoginSuccess";
import VerifyEmail from "../pages/VerifyEmail";

const UnauthRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<UnauthLayout />}>
        <Route
          index
          element={<Navigate to="/login" replace={true} />}
        />
        <Route path="success" element={<LoginSuccess />} />
        <Route path="please-verify-mail" element={<VerifyEmail />} />
        <Route path="login" element={<Login />} />
      </Route>
      <Route
        path="*"
        element={<Navigate to="/login" replace={true} />}
      />
    </Routes>
  );
};
export default UnauthRoutes;
