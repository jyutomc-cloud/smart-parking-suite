import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Car, 
  Receipt, 
  BarChart3, 
  Users, 
  ParkingCircle,
  LogOut,
  ChevronRight
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";

const Sidebar = () => {
  const { signOut } = useAuth();
  const { isAdmin, isOwner, isPetugas } = useUserRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Define navigation items based on role
  const getNavItems = () => {
    const baseItems = [
      { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    ];

    // Petugas can only access transactions and parking areas (view only)
    if (isPetugas) {
      return [
        ...baseItems,
        { to: "/dashboard/transactions", icon: Receipt, label: "Transaksi" },
        { to: "/dashboard/parking-areas", icon: ParkingCircle, label: "Area Parkir" },
      ];
    }

    // Owner can see reports and parking areas
    if (isOwner) {
      return [
        ...baseItems,
        { to: "/dashboard/transactions", icon: Receipt, label: "Transaksi" },
        { to: "/dashboard/parking-areas", icon: ParkingCircle, label: "Area Parkir" },
        { to: "/dashboard/reports", icon: BarChart3, label: "Laporan" },
      ];
    }

    // Admin has full access
    return [
      ...baseItems,
      { to: "/dashboard/transactions", icon: Receipt, label: "Transaksi" },
      { to: "/dashboard/parking-areas", icon: ParkingCircle, label: "Area Parkir" },
      { to: "/dashboard/reports", icon: BarChart3, label: "Laporan" },
      { to: "/dashboard/users", icon: Users, label: "Kelola User" },
    ];
  };

  const navItems = getNavItems();

  return (
    <aside className="fixed left-0 top-0 h-full w-[260px] bg-sidebar-background z-50 flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">E-Parking</h1>
            <p className="text-xs text-sidebar-foreground">Management System</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6">
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="flex-1">{item.label}</span>
              <ChevronRight className="w-4 h-4 opacity-50" />
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-5 py-3 text-sidebar-foreground hover:text-white hover:bg-sidebar-accent rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Keluar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
