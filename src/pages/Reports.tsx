import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Calendar, Wallet, Car, Download, FileSpreadsheet, FileText } from "lucide-react";
import { format, subDays } from "date-fns";
import { id } from "date-fns/locale";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { exportToExcel, exportToPDF } from "@/utils/exportUtils";
import { toast } from "sonner";

interface Transaction {
  id: string;
  plate_number: string;
  vehicle_type: string;
  entry_time: string;
  exit_time: string | null;
  duration_hours: number | null;
  amount: number;
  status: string;
  created_at: string;
}

const Reports = () => {
  const { isAdmin, isOwner, isPetugas } = useUserRole();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("weekly");

  const canViewFullReports = isAdmin || isOwner;
  const canExport = isAdmin || isOwner;

  useEffect(() => {
    fetchTransactions();
  }, [period]);

  const fetchTransactions = async () => {
    setLoading(true);
    
    let startDate: Date;
    const endDate = new Date();
    
    switch (period) {
      case "daily":
        startDate = subDays(endDate, 7);
        break;
      case "weekly":
        startDate = subDays(endDate, 30);
        break;
      case "monthly":
        startDate = subDays(endDate, 365);
        break;
      default:
        startDate = subDays(endDate, 30);
    }

    const { data, error } = await supabase
      .from("transactions")
      .select("id, plate_number, vehicle_type, entry_time, exit_time, duration_hours, amount, status, created_at")
      .gte("created_at", startDate.toISOString())
      .eq("status", "completed")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching transactions:", error);
    } else {
      setTransactions(data || []);
    }
    setLoading(false);
  };

  // Calculate daily revenue data
  const getDailyRevenueData = () => {
    const days = period === "daily" ? 7 : period === "weekly" ? 30 : 12;
    const data: { name: string; revenue: number; transactions: number }[] = [];
    
    if (period === "monthly") {
      const monthlyData: { [key: string]: { revenue: number; transactions: number } } = {};
      transactions.forEach(tx => {
        const monthKey = format(new Date(tx.created_at), "MMM yyyy", { locale: id });
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, transactions: 0 };
        }
        monthlyData[monthKey].revenue += tx.amount || 0;
        monthlyData[monthKey].transactions += 1;
      });
      
      Object.entries(monthlyData).forEach(([name, values]) => {
        data.push({ name, ...values });
      });
    } else {
      const dailyData: { [key: string]: { revenue: number; transactions: number } } = {};
      
      for (let i = 0; i <= days; i++) {
        const date = subDays(new Date(), days - i);
        const dateKey = format(date, "dd MMM", { locale: id });
        dailyData[dateKey] = { revenue: 0, transactions: 0 };
      }
      
      transactions.forEach(tx => {
        const dateKey = format(new Date(tx.created_at), "dd MMM", { locale: id });
        if (dailyData[dateKey]) {
          dailyData[dateKey].revenue += tx.amount || 0;
          dailyData[dateKey].transactions += 1;
        }
      });
      
      Object.entries(dailyData).forEach(([name, values]) => {
        data.push({ name, ...values });
      });
    }
    
    return data;
  };

  const getVehicleDistribution = () => {
    const distribution: { [key: string]: number } = { motor: 0, mobil: 0 };
    transactions.forEach(tx => {
      if (tx.vehicle_type === "motor") distribution.motor += 1;
      else distribution.mobil += 1;
    });
    
    return [
      { name: "Motor", value: distribution.motor, color: "hsl(var(--primary))" },
      { name: "Mobil", value: distribution.mobil, color: "hsl(var(--accent))" }
    ];
  };

  const totalRevenue = transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0);
  const totalTransactions = transactions.length;
  const avgRevenue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `Rp ${(amount / 1000000).toFixed(1)}jt`;
    }
    if (amount >= 1000) {
      return `Rp ${(amount / 1000).toFixed(0)}rb`;
    }
    return `Rp ${amount}`;
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "daily": return "7 Hari Terakhir";
      case "weekly": return "30 Hari Terakhir";
      case "monthly": return "12 Bulan Terakhir";
      default: return "30 Hari Terakhir";
    }
  };

  const handleExportExcel = () => {
    if (transactions.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    exportToExcel({
      transactions,
      period: getPeriodLabel(),
      totalRevenue,
      totalTransactions
    });
    toast.success("Laporan Excel berhasil diunduh");
  };

  const handleExportPDF = () => {
    if (transactions.length === 0) {
      toast.error("Tidak ada data untuk diexport");
      return;
    }
    exportToPDF({
      transactions,
      period: getPeriodLabel(),
      totalRevenue,
      totalTransactions
    });
    toast.success("Laporan PDF berhasil diunduh");
  };

  const chartConfig = {
    revenue: { label: "Pendapatan", color: "hsl(var(--primary))" },
    transactions: { label: "Transaksi", color: "hsl(var(--accent))" }
  };

  // Petugas hanya bisa lihat ringkasan sederhana
  if (isPetugas && !canViewFullReports) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground mt-1">Ringkasan aktivitas parkir hari ini</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="card-elegant">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Transaksi Hari Ini</p>
                  <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
                </div>
                <div className="p-3 rounded-full bg-accent/10">
                  <Car className="w-6 h-6 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="card-elegant p-8 text-center">
          <p className="text-muted-foreground">
            Untuk melihat laporan lengkap dan grafik analisis, silakan hubungi Admin atau Owner.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Laporan</h1>
          <p className="text-muted-foreground mt-1">Analisis pendapatan dan statistik parkir</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">7 Hari Terakhir</SelectItem>
              <SelectItem value="weekly">30 Hari Terakhir</SelectItem>
              <SelectItem value="monthly">12 Bulan Terakhir</SelectItem>
            </SelectContent>
          </Select>

          {canExport && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportExcel}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export ke Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export ke PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Pendapatan</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(totalRevenue)}</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Transaksi</p>
                <p className="text-2xl font-bold text-foreground">{totalTransactions}</p>
              </div>
              <div className="p-3 rounded-full bg-accent/10">
                <Car className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-elegant">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rata-rata / Transaksi</p>
                <p className="text-2xl font-bold text-foreground">{formatCurrency(avgRevenue)}</p>
              </div>
              <div className="p-3 rounded-full bg-success/10">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Grafik Pendapatan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={getDailyRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} tick={{ fontSize: 12 }} />
                  <ChartTooltip 
                    content={<ChartTooltipContent />}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="card-elegant">
          <CardHeader>
            <CardTitle>Jumlah Transaksi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[300px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <LineChart data={getDailyRevenueData()}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="transactions" 
                    stroke="hsl(var(--accent))" 
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--accent))" }}
                  />
                </LineChart>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card className="card-elegant lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribusi Jenis Kendaraan</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-8">
                <ChartContainer config={chartConfig} className="h-[250px] w-[250px]">
                  <PieChart>
                    <Pie
                      data={getVehicleDistribution()}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getVehicleDistribution().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ChartContainer>
                <div className="space-y-4">
                  {getVehicleDistribution().map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">{item.value} transaksi</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
