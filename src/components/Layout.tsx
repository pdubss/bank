import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <div className="flex h-screen flex-col">
      <Header />
      <main className="flex flex-1">
        <Outlet />
      </main>
      <footer className="bg-gray-800 p-4 text-center text-white">
        Copyright Perry Yeung 2025
      </footer>
    </div>
  );
}
