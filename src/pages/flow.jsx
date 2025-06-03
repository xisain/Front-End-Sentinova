import { Outlet } from "react-router-dom";
import DashboardLayout from "../components/dashboard-layout";

export default function Flow() {
  return (
    <DashboardLayout>
      <Outlet />
    </DashboardLayout>
  );
}
