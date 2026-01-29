import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Car, Bike, LogIn, LogOut, Printer, Search } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface ParkingArea {
  id: string;
  name: string;
  total_slots: number;
  occupied_slots: number;
  hourly_rate: number;
}

interface Transaction {
  id: string;
  plate_number: string;
  vehicle_type: string;
  parking_area_id: string | null;
  entry_time: string;
  exit_time: string | null;
  duration_hours: number | null;
  amount: number;
  status: string;
  parking_areas?: ParkingArea;
}

const Transactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Entry form state
  const [plateNumber, setPlateNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("motor");
  const [selectedArea, setSelectedArea] = useState("");
  
  // Receipt dialog state
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<Transaction | null>(null);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [transactionsRes, areasRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("*, parking_areas(*)")
        .order("created_at", { ascending: false })
        .limit(50),
      supabase.from("parking_areas").select("*")
    ]);

    if (transactionsRes.data) setTransactions(transactionsRes.data);
    if (areasRes.data) {
      setParkingAreas(areasRes.data);
      if (areasRes.data.length > 0) setSelectedArea(areasRes.data[0].id);
    }
    
    setLoading(false);
  };

  const handleVehicleEntry = async () => {
    if (!plateNumber.trim()) {
      toast.error("Masukkan nomor plat kendaraan");
      return;
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert({
        plate_number: plateNumber.toUpperCase(),
        vehicle_type: vehicleType,
        parking_area_id: selectedArea,
        operator_id: user?.id,
        status: "parked"
      })
      .select("*, parking_areas(*)")
      .single();

    if (error) {
      toast.error("Gagal mencatat kendaraan masuk");
      console.error(error);
      return;
    }

    // Update occupied slots
    await supabase
      .from("parking_areas")
      .update({ occupied_slots: (parkingAreas.find(a => a.id === selectedArea)?.occupied_slots || 0) + 1 })
      .eq("id", selectedArea);

    toast.success("Kendaraan berhasil masuk");
    setReceiptData(data);
    setReceiptDialogOpen(true);
    setPlateNumber("");
    fetchData();
  };

  const handleVehicleExit = async (transaction: Transaction) => {
    const entryTime = new Date(transaction.entry_time);
    const exitTime = new Date();
    const durationMs = exitTime.getTime() - entryTime.getTime();
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60));
    
    const area = parkingAreas.find(a => a.id === transaction.parking_area_id);
    const amount = durationHours * (area?.hourly_rate || 2000);

    const { data, error } = await supabase
      .from("transactions")
      .update({
        exit_time: exitTime.toISOString(),
        duration_hours: durationHours,
        amount: amount,
        status: "completed"
      })
      .eq("id", transaction.id)
      .select("*, parking_areas(*)")
      .single();

    if (error) {
      toast.error("Gagal mencatat kendaraan keluar");
      console.error(error);
      return;
    }

    // Update occupied slots
    if (area) {
      await supabase
        .from("parking_areas")
        .update({ occupied_slots: Math.max(0, area.occupied_slots - 1) })
        .eq("id", area.id);
    }

    toast.success("Kendaraan berhasil keluar");
    setReceiptData(data);
    setReceiptDialogOpen(true);
    fetchData();
  };

  const handlePrint = () => {
    const printContent = receiptRef.current;
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Struk Parkir</title>
          <style>
            body { font-family: 'Courier New', monospace; padding: 20px; max-width: 300px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .row { display: flex; justify-content: space-between; margin: 5px 0; }
            .divider { border-top: 1px dashed #000; margin: 10px 0; }
            .total { font-weight: bold; font-size: 1.2em; }
            .footer { text-align: center; margin-top: 20px; font-size: 0.9em; }
          </style>
        </head>
        <body>${printContent.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  const filteredTransactions = transactions.filter(t =>
    t.plate_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Transaksi Parkir</h1>
        <p className="text-muted-foreground mt-1">Kelola kendaraan masuk dan keluar</p>
      </div>

      {/* Entry Form */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LogIn className="w-5 h-5 text-primary" />
            Kendaraan Masuk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Nomor Plat</Label>
              <Input
                placeholder="B 1234 XYZ"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>Jenis Kendaraan</Label>
              <Select value={vehicleType} onValueChange={setVehicleType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="motor">
                    <div className="flex items-center gap-2">
                      <Bike className="w-4 h-4" /> Motor
                    </div>
                  </SelectItem>
                  <SelectItem value="mobil">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4" /> Mobil
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Area Parkir</Label>
              <Select value={selectedArea} onValueChange={setSelectedArea}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {parkingAreas.map((area) => (
                    <SelectItem key={area.id} value={area.id}>
                      {area.name} ({area.total_slots - area.occupied_slots} tersedia)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={handleVehicleEntry} className="w-full">
                <LogIn className="w-4 h-4 mr-2" />
                Catat Masuk
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="card-elegant">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>Daftar Transaksi</CardTitle>
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Cari nomor plat..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plat Nomor</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Waktu Masuk</TableHead>
                  <TableHead>Waktu Keluar</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Biaya</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="font-medium">{tx.plate_number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {tx.vehicle_type === "motor" ? <Bike className="w-4 h-4" /> : <Car className="w-4 h-4" />}
                        {tx.vehicle_type === "motor" ? "Motor" : "Mobil"}
                      </div>
                    </TableCell>
                    <TableCell>{tx.parking_areas?.name || "-"}</TableCell>
                    <TableCell>{format(new Date(tx.entry_time), "dd MMM HH:mm", { locale: id })}</TableCell>
                    <TableCell>
                      {tx.exit_time ? format(new Date(tx.exit_time), "dd MMM HH:mm", { locale: id }) : "-"}
                    </TableCell>
                    <TableCell>{tx.duration_hours ? `${tx.duration_hours} jam` : "-"}</TableCell>
                    <TableCell>{tx.amount ? formatCurrency(tx.amount) : "-"}</TableCell>
                    <TableCell>
                      <Badge variant={tx.status === "parked" ? "default" : "secondary"}>
                        {tx.status === "parked" ? "Parkir" : "Selesai"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {tx.status === "parked" && (
                        <Button size="sm" variant="outline" onClick={() => handleVehicleExit(tx)}>
                          <LogOut className="w-4 h-4 mr-1" />
                          Keluar
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTransactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Tidak ada transaksi ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onOpenChange={setReceiptDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Struk Parkir</DialogTitle>
          </DialogHeader>
          
          <div ref={receiptRef} className="bg-white p-4 rounded-lg border">
            <div className="header text-center border-b border-dashed pb-3 mb-3">
              <h2 className="text-lg font-bold">E-PARKING</h2>
              <p className="text-sm text-muted-foreground">Sistem Manajemen Parkir</p>
            </div>
            
            {receiptData && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>No. Transaksi</span>
                  <span className="font-mono">{receiptData.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Plat Nomor</span>
                  <span className="font-bold">{receiptData.plate_number}</span>
                </div>
                <div className="flex justify-between">
                  <span>Jenis</span>
                  <span>{receiptData.vehicle_type === "motor" ? "Motor" : "Mobil"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Area</span>
                  <span>{receiptData.parking_areas?.name || "-"}</span>
                </div>
                <div className="border-t border-dashed my-2 pt-2">
                  <div className="flex justify-between">
                    <span>Masuk</span>
                    <span>{format(new Date(receiptData.entry_time), "dd/MM/yy HH:mm")}</span>
                  </div>
                  {receiptData.exit_time && (
                    <>
                      <div className="flex justify-between">
                        <span>Keluar</span>
                        <span>{format(new Date(receiptData.exit_time), "dd/MM/yy HH:mm")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Durasi</span>
                        <span>{receiptData.duration_hours} jam</span>
                      </div>
                    </>
                  )}
                </div>
                {receiptData.amount > 0 && (
                  <div className="border-t border-dashed pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>TOTAL</span>
                      <span>{formatCurrency(receiptData.amount)}</span>
                    </div>
                  </div>
                )}
                <div className="text-center text-xs text-muted-foreground mt-4 pt-2 border-t border-dashed">
                  <p>Terima kasih atas kunjungan Anda</p>
                  <p>{format(new Date(), "dd MMMM yyyy HH:mm", { locale: id })}</p>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setReceiptDialogOpen(false)}>
              Tutup
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Cetak Struk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Transactions;
