import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Search, FileText, LogOut, Layers, Menu, X } from "lucide-react";
import { Button } from "./Button";

interface NavigationProps {
  onLogout: () => Promise<void> | void;
}

export const Navigation: React.FC<NavigationProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/", label: "Home", icon: Search },
    { to: "/my-content", label: "My Content", icon: Layers },
    { to: "/reports", label: "Reports", icon: FileText },
  ];

  const handleLogout = async () => {
    await onLogout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
{/* Logo */}
<div
  onClick={() => navigate("/")}
  className="flex items-center gap-3 cursor-pointer"
>
  <div className="w-11 h-9 rounded-xl bg-blue-500  shadow flex items-center justify-center">
    <img
      src="https://rjzfesfhyqvrzjlplqqp.supabase.co/storage/v1/object/public/VizContent/vius%20(1).png"
      alt="Logo"
      className="w-9 h-7 mt-[5px] ml-[2px]"
    />
  </div>
  <span className="font-bold text-lg">Dashboard</span>
</div>


        {/* Desktop Nav */}
        <div className="hidden md:flex gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg transition
                 ${
                   isActive
                     ? "bg-blue-50 text-blue-600 shadow-sm border-l-4 border-blue-500"
                     : "text-gray-600 hover:bg-gray-100"
                 }`
              }
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="hidden md:flex gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2 animate-in slide-in-from-top-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-lg
                 ${
                   isActive
                     ? "bg-blue-50 text-blue-600"
                     : "text-gray-600 hover:bg-gray-100"
                 }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}

          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      )}
    </nav>
  );
};
