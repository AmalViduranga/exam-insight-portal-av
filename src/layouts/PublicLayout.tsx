import { Outlet } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { PublicNavbar } from '../components/PublicNavbar';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <PublicNavbar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
