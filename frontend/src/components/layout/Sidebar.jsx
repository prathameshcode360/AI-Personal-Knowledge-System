import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  LayoutDashboard,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();

  const menuItems = [
    { path: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/chat", icon: MessageSquare, label: "Chat" },
    { path: "/documents", icon: FileText, label: "Documents" },
    { path: "/settings", icon: Settings, label: "Settings" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-xl font-bold">AI Doc Chat</h1>
        <p className="text-sm text-gray-400 mt-1">Personal Knowledge OS</p>
      </div>

      <nav className="flex-1 px-4">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
              isActive(item.path)
                ? "bg-blue-600 text-white"
                : "text-gray-300 hover:bg-gray-800"
            }`}>
            <item.icon size={20} />
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="flex items-center space-x-3 px-4 py-3 w-full rounded-lg text-gray-300 hover:bg-gray-800 transition-colors">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
