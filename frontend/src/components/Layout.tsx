import { Menu, Plus } from "lucide-react";
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { SearchBox } from "./SearchBox";
import { Sidebar } from "./Sidebar";

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:pl-[292px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center gap-3 border-b border-gold/10 bg-ink/90 px-4 backdrop-blur-xl md:px-7">
          <button className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 text-white/60 lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Otwórz menu">
            <Menu className="h-5 w-5" />
          </button>
          <SearchBox />
          <Link to="/admin/nowy" className="button-primary ml-auto shrink-0">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Dodaj wpis</span>
          </Link>
        </header>
        <main className="mx-auto max-w-[1500px] px-4 py-7 md:px-7 md:py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
