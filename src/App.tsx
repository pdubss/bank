import CreateUser from "./pages/CreateUser";
import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import AboutUs from "./pages/AboutUs";
import ResetPassword from "./pages/ResetPassword";
import Transfer from "./pages/Transfer";
import TransactionDetails from "./pages/TransactionDetails";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<CreateUser />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/reset" element={<ResetPassword />} />
        <Route path="/transfer" element={<Transfer />} />
        <Route
          path="transactions/:transactionID"
          element={<TransactionDetails />}
        />
      </Route>
    </Routes>
  );
}

export default App;
