import React from "react";
import Layout from "../components/layout/Layout";
import { useAuth } from "../contexts/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={user?.name || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Created
              </label>
              <input
                type="text"
                value={
                  user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "N/A"
                }
                disabled
                className="w-full px-3 py-2 border rounded-lg bg-gray-50"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mt-6">
          <h2 className="text-lg font-semibold mb-4">About</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>AI Document Chat Assistant v1.0.0</p>
            <p>Powered by Google Gemini AI & MongoDB Vector Search</p>
            <p>Upload PDF/DOCX documents and chat with your knowledge base</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
