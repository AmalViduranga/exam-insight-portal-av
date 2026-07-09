import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { TopNavbar } from '../components/TopNavbar';
import { Sidebar } from '../components/Sidebar';
import { AnalysisProvider } from '../contexts/AnalysisContext';

export function AuthLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AnalysisProvider>
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        {/* Mobile Sidebar Overlay */}
        <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

        {/* Main Content Area (padding left to accommodate fixed sidebar on desktop) */}
        <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
          <TopNavbar onMenuClick={() => setIsSidebarOpen(true)} />

          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>

          {/* We reuse the public footer, but limit its width or padding if needed. 
              The lg:pl-72 wrapper takes care of the offset automatically. */}
          <div className="px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200 mt-auto">
             <div className="mx-auto max-w-7xl py-6 text-center text-slate-500 text-sm font-medium">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <p>Exam Insight Portal © 2026 All rights reserved.</p>
                  <p>
                    Designed by{' '}
                    <a
                      href="https://www.linkedin.com/in/amal-viduranga-3a681b27b?utm_source=share_via&utm_content=profile&utm_medium=member_android"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-800 transition-colors font-semibold"
                    >
                      Amal Viduranga
                    </a>
                  </p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AnalysisProvider>
  );
}
