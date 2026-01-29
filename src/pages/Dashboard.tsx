import { Car, ParkingCircle, Wallet, TrendingUp } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ActivityTable from "@/components/dashboard/ActivityTable";
import ParkingOverview from "@/components/dashboard/ParkingOverview";

const Dashboard = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Selamat datang kembali, <span className="font-semibold text-foreground">Admin</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          title="Kendaraan Parkir"
          value="167"
          icon={Car}
          variant="primary"
          trend={{ value: "12%", positive: true }}
        />
        <StatCard
          title="Slot Tersedia"
          value="43"
          icon={ParkingCircle}
          variant="success"
        />
        <StatCard
          title="Pendapatan Hari Ini"
          value="Rp 2.4jt"
          icon={Wallet}
          variant="warning"
          trend={{ value: "8%", positive: true }}
        />
        <StatCard
          title="Transaksi Hari Ini"
          value="234"
          icon={TrendingUp}
          variant="accent"
          trend={{ value: "5%", positive: true }}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Table - Takes 2 columns */}
        <div className="lg:col-span-2">
          <ActivityTable />
        </div>

        {/* Parking Overview - Takes 1 column */}
        <div>
          <ParkingOverview />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
