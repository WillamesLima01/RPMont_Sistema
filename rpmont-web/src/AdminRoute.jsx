import React from "react";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  let userLogged = null;

  try {
    userLogged = JSON.parse(localStorage.getItem("userLogged"));
  } catch {
    userLogged = null;
  }

  const access = (userLogged?.AccessLevel || "").toString().toLowerCase();
  const isAdmin = access === "administrador";

  if (!userLogged) return <Navigate to="/" replace />;
  if (!isAdmin) return <Navigate to="/inicio" replace />;

  return children;
};

export default AdminRoute;
