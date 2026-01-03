import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNav = true }) => {
  return (
    <div className="min-h-screen bg-background">
      {showNav && <Navbar />}
      <main className={showNav ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
