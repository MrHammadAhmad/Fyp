import React from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

export default function PublicLayout() {
  const location = useLocation();
  const path = location.pathname;
  
  // Hide footer on dashboards and auth pages
  const hideFooter = 
    path.startsWith('/admin') ||
    path.startsWith('/business') ||
    path.startsWith('/dashboard') ||
    path.startsWith('/auth');

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-surface-950">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {!hideFooter && <Footer />}
    </div>
  )
}
