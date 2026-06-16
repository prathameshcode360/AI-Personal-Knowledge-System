import React from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";
import { FileText, MessageSquare, Upload } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { label: "Documents", value: "0", icon: FileText, color: "bg-blue-500" },
    { label: "Chats", value: "0", icon: MessageSquare, color: "bg-green-500" },
  ];

  const quickActions = [
    {
      title: "Upload Document",
      description: "Upload PDF or DOCX files",
      icon: Upload,
      path: "/documents",
    },
    {
      title: "Start Chat",
      description: "Ask questions about your documents",
      icon: MessageSquare,
      path: "/chat",
    },
  ];

  return (
    <Layout>
      <div className="space-y-8">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Your personal AI knowledge assistant is ready
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <stat.icon className="text-white" size={24} />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.path}
                className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center">
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <action.icon className="text-gray-700" size={24} />
                  </div>
                  <div className="ml-4">
                    <h3 className="font-semibold text-gray-900">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {action.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
