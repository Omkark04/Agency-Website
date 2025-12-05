import React from 'react';

const Dashboard: React.FC = () => {
  const user = localStorage.getItem('user');
  return (
    <div className="max-w-2xl mx-auto mt-10 bg-white rounded shadow p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome to your Dashboard</h1>
      <p className="mb-2">Logged in as: <span className="font-mono">{user}</span></p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-6 gap-4">
        <a href="/orders" className="block bg-blue-50 border border-blue-200 rounded p-4 text-center hover:bg-blue-100">Orders</a>
        <a href="/services" className="block bg-green-50 border border-green-200 rounded p-4 text-center hover:bg-green-100">Services</a>
        <a href="/media" className="block bg-purple-50 border border-purple-200 rounded p-4 text-center hover:bg-purple-100">Media</a>
        <a href="/tasks" className="block bg-yellow-50 border border-yellow-200 rounded p-4 text-center hover:bg-yellow-100">Tasks</a>
        {localStorage.getItem('role') === 'admin' && (
          <>
            <a href="/users" className="block bg-red-50 border border-red-200 rounded p-4 text-center hover:bg-red-100">Users</a>
            <a href="/analytics" className="block bg-indigo-50 border border-indigo-200 rounded p-4 text-center hover:bg-indigo-100">Analytics</a>
          </>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">Profile</h2>
        <div className="space-y-2">
          <div><strong>Username/Email:</strong> {user}</div>
          {/* Add more profile details here when available */}
        </div>
      </div>
      <div className="mt-6">
        <button
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          onClick={() => {
            localStorage.removeItem('access');
            localStorage.removeItem('refresh');
            localStorage.removeItem('user');
            window.location.href = '/login';
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
