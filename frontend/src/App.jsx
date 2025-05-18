import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/authProvider";
import router from "./routers";

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
