import { Car, ParkingCircle, Wallet, TrendingUp, Activity } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { useRealtimeTransactions } from "@/hooks/useRealtimeTransactions";
import StatCard from "@/components/dashboard/StatCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ParkingOverview from "@/components/dashboard/ParkingOverview";
import NotificationPanel from "@/components/dashboard/NotificationPanel";

const Dashboard = () => {
  const { isAdmin, isOwner, isPetugas, loading: roleLoading } = useUserRole();
  const { notifications, todayStats, clearNotifications } = useRealtimeTransactions();

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    }
    if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`;
    }
    return `Rp ${amount}`;
  };

  // Role-based greeting
  const getRoleTitle = () => {
    if (isAdmin) return "Admin";
    if (isOwner) return "Owner";
    if (isPetugas) return "Petugas";
    return "User";
  };

  // Owner view - focused on revenue and business metrics
  if (isOwner) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Owner</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, <span className="font-semibold text-foreground">{getRoleTitle()}</span>
          </p>
        </div>

        {/* Revenue focused stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            title="Pendapatan Hari Ini"
            value={formatCurrency(todayStats.todayRevenue)}
            icon={Wallet}
            variant="warning"
          />
          <StatCard
            title="Transaksi Selesai"
            value={todayStats.todayTransactions.toString()}
            icon={TrendingUp}
            variant="accent"
          />
          <StatCard
            title="Kendaraan Parkir"
            value={todayStats.currentlyParked.toString()}
            icon={Car}
            variant="primary"
          />
          <StatCard
            title="Total Aktivitas"
            value={todayStats.totalVehicles.toString()}
            icon={Activity}
            variant="success"
          />
        </div>

        {/* Revenue and Activity overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityTable />
          </div>
          <div>
            <NotificationPanel 
              notifications={notifications} 
              onClear={clearNotifications} 
            />
          </div>
        </div>
      </div>
    );
  }

  // Petugas view - focused on operations
  if (isPetugas) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard Petugas</h1>
          <p className="text-muted-foreground mt-1">
            Selamat datang kembali, <span className="font-semibold text-foreground">{getRoleTitle()}</span>
          </p>
        </div>

        {/* Operational stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6">
          <StatCard
            title="Kendaraan Parkir"
            value={todayStats.currentlyParked.toString()}
            icon={Car}
            variant="primary"
          />
          <StatCard
            title="Transaksi Hari Ini"
            value={todayStats.todayTransactions.toString()}
            icon={TrendingUp}
            variant="accent"
          />
          <StatCard
            title="Total Aktivitas"
            value={todayStats.totalVehicles.toString()}
            icon={Activity}
            variant="success"
          />
        </div>

        {/* Activity and Notifications */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ActivityTable />
          </div>
          <div className="space-y-6">
            <NotificationPanel 
              notifications={notifications} 
              onClear={clearNotifications} 
            />
            <ParkingOverview />
          </div>
        </div>
      </div>
    );
  }

  // Admin view - full access
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang kembali, <span className="font-semibold text-foreground">{getRoleTitle()}</span>
        </p>
      </div>

      {/* Full stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Kendaraan Parkir"
          value={todayStats.currentlyParked.toString()}
          icon={Car}
          variant="primary"
        />
        <StatCard
          title="Slot Tersedia"
          value="-"
          icon={ParkingCircle}
          variant="success"
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value={formatCurrency(todayStats.todayRevenue)}
          icon={Wallet}
          variant="warning"
        />
        <StatCard
          title="Transaksi Hari Ini"
          value={todayStats.todayTransactions.toString()}
          icon={TrendingUp}
          variant="accent"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ActivityTable />
        </div>

        <div className="space-y-6">
          <NotificationPanel 
            notifications={notifications} 
            onClear={clearNotifications} 
          />
          <ParkingOverview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
