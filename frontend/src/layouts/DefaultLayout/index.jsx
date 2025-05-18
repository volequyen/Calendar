import { Outlet } from "react-router-dom";
import CalendarHeader from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar";

function DefaultLayout() {
  return (
    <div className="">
      <div className="flex min-h-screen">
        <Sidebar/>
        <div className="flex-1 flex flex-col transition-all duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default DefaultLayout;
