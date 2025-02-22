import React from 'react';
import { NavLink } from 'react-router-dom';

export default function AdminNav() {
  return (
    <nav className="bg-gray-800 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/menu"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Menu
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Orders
          </NavLink>
          <NavLink
            to="/admin/analytics"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Analytics
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md text-sm font-medium ${
                isActive ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            Settings
          </NavLink>
        </div>
      </div>
    </nav>
  );
}