import CalendarHeader from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar";

function DefaultLayout({children}) {
    return ( 
        <div>
            <CalendarHeader/>
            <div>
                <Sidebar/>
                <div>
                    {children}
                </div>
            </div>
        </div>
     );
}

export default DefaultLayout;