import {
  Archive, BookOpen, Building2, Castle, ChevronRight, CircuitBoard, Clock3, Crown,
  Factory, GraduationCap, House, Languages, Landmark, Map, MapPin, Mountain, Shield, Users, X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { CURRENT_WORLD_YEAR } from "../lib/world";

const navigation = [
  { label: "Start", to: "/", icon: House },
  { label: "Postacie", to: "/postacie", icon: Users },
  { label: "Dynastia de la Cruz", to: "/dynastia", icon: Crown },
  { label: "Wielkie rody", to: "/katalog/HOUSE", icon: Castle },
  { label: "Prowincje", to: "/prowincje", icon: Map },
  { label: "Miasta", to: "/katalog/CITY", icon: Building2 },
  { label: "Języki", to: "/jezyki", icon: Languages },
  { label: "Historia", to: "/katalog/EVENT", icon: BookOpen },
  { label: "Wojsko", to: "/katalog/MILITARY", icon: Shield },
  { label: "Instytucje", to: "/katalog/INSTITUTION", icon: Landmark },
  { label: "Firmy", to: "/firmy", icon: Factory },
  { label: "Uczelnie", to: "/katalog/UNIVERSITY", icon: GraduationCap },
  { label: "Technologie", to: "/katalog/TECHNOLOGY", icon: CircuitBoard },
  { label: "Geografia", to: "/katalog/GEOGRAPHY", icon: Mountain },
  { label: "Chronologia", to: "/chronologia", icon: Clock3 },
];

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      {open && <button className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="Zamknij menu" />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[292px] flex-col border-r border-gold/15 bg-[#0b0d10]/[0.98] transition-transform duration-300 lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center border-b border-gold/15 px-5">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-gold/40 bg-gold/[0.07]">
            <Archive className="h-5 w-5 text-gold" />
          </div>
          <div className="ml-3 min-w-0">
            <p className="truncate font-serif text-[17px] text-cream">Archiwum Imperium</p>
            <p className="text-[10px] uppercase tracking-[0.23em] text-gold/60">Rejestr centralny</p>
          </div>
          <button onClick={onClose} className="ml-auto p-2 text-white/40 hover:text-cream lg:hidden" aria-label="Zamknij menu">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Główna nawigacja">
          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `group mb-0.5 flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${isActive ? "bg-gold/[0.11] text-[#f2dca9]" : "text-white/48 hover:bg-white/[0.035] hover:text-cream"}`}
            >
              <Icon className="h-[17px] w-[17px] shrink-0" />
              <span className="truncate">{label}</span>
              <ChevronRight className="ml-auto h-3.5 w-3.5 opacity-0 transition group-hover:opacity-60" />
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-gold/10 p-4">
          <div className="rounded-lg border border-gold/10 bg-gradient-to-br from-imperial/10 to-gold/[0.03] p-3">
            <div className="flex items-center gap-2 text-xs text-gold/75"><MapPin className="h-3.5 w-3.5" /> Rok {CURRENT_WORLD_YEAR}</div>
            <p className="mt-1 text-[11px] leading-4 text-white/30">Archiwum prywatne • dane kanoniczne</p>
          </div>
        </div>
      </aside>
    </>
  );
}
