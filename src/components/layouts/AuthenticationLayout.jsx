// src/components/layouts/AuthenticationLayout.jsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function AuthenticationLayout({ children, title, subtitle, linkText, linkUrl }) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-elegant">
        <div>
          <h2 className="text-center font-display text-3xl font-bold text-primary">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-center font-body text-primary/70">{subtitle}</p>
          )}
        </div>
        {children}
        {linkText && (
          <div className="text-center mt-4">
            <Link to={linkUrl} className="font-body text-accent hover:text-accent-dark transition-colors">
              {linkText}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}