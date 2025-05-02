// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthenticationContext';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="relative bg-primary min-h-screen">
      <div className="max-w-7xl mx-auto lg:px-8">
        <div className="relative pt-22 pb-18">
          <div className="text-center px-4 sm:px-6">
            <h1 className="font-display text-display-lg md:text-display-xl font-bold">
              <span className="block text-secondary">Delicious food at your</span>
              <span className="block text-accent mt-4">college campus</span>
            </h1>
            <p className="mt-8 text-xl font-body text-secondary max-w-2xl mx-auto">
              Order fresh, tasty meals from your college canteen. Skip the lines and get notified when your food is ready.
            </p>
            <div className="mt-12 flex justify-center gap-6">
              <Link
                to="/menu"
                className="px-8 py-3 bg-accent text-primary font-body font-medium rounded-md hover:bg-accent-dark transition-colors shadow-elegant"
              >
                View Menu
              </Link>
              {!user && (
                <Link
                  to="/register"
                  className="px-8 py-3 border-2 border-accent text-accent font-body font-medium rounded-md hover:bg-accent hover:text-primary transition-colors"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}