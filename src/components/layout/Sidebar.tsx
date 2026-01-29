import { Link, useLocation } from "react-router-dom";
import { 
  Car, 
  LayoutDashboard, 
  Users, 
  MapPin, 
  ArrowLeftRight, 
  FileText, 
  LogOut,
  Settings
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Kelola User", href: "/dashboard/users", icon: Users },
  { name: "Area Parkir", href: "/dashboard/areas", icon: MapPin },
  { name: "Transaksi", href: "/dashboard/transactions", icon: ArrowLeftRight },
  { name: "Laporan", href: "/dashboard/reports", icon: FileText },
  { name: "Pengaturan", href: "/dashboard/settings", icon: Settings },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-sidebar flex flex-col z-50">
      {/* Brand */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
            <Car className="w-5 h-5 text-accent-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-primary">E-PARKING</h1>
            <p className="text-xs text-sidebar-foreground opacity-70">Manajemen Parkir</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={`sidebar-link ${isActive ? "active" : ""}`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <Link
          to="/"
          className="flex items-center gap-3 px-5 py-3 text-destructive hover:bg-destructive/10 rounded-lg transition-colors font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Logout</span>
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;
