import React from 'react';
import { PublicNavbar } from './PublicNavbar.js';
import { PublicFooter } from './PublicFooter.js';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div
      className="d-flex flex-column min-vh-100"
      style={{
        backgroundColor: '#F8FAFC',
        fontFamily: "'Inter', sans-serif"
      }}
    >
      <PublicNavbar />
      <main className="flex-grow-1">{children}</main>
      <PublicFooter />
    </div>
  );
};

