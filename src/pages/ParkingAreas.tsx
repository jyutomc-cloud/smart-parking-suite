import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { ParkingCircle, Plus, Pencil, Trash2, Car, Bike } from "lucide-react";

interface ParkingArea {
  id: string;
  name: string;
  total_slots: number;
  occupied_slots: number;
  hourly_rate: number;
  created_at: string;
}

const ParkingAreas = () => {
  const { isAdmin } = useUserRole();
  const [areas, setAreas] = useState<ParkingArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<ParkingArea | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    total_slots: 0,
    hourly_rate: 2000
  });

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("parking_areas")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching areas:", error);
      toast.error("Gagal memuat data area parkir");
    } else {
      setAreas(data || []);
    }
    setLoading(false);
  };

  const handleOpenDialog = (area?: ParkingArea) => {
    if (area) {
      setEditingArea(area);
      setFormData({
        name: area.name,
        total_slots: area.total_slots,
        hourly_rate: area.hourly_rate
      });
    } else {
      setEditingArea(null);
      setFormData({ name: "", total_slots: 0, hourly_rate: 2000 });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Nama area tidak boleh kosong");
      return;
    }

    if (formData.total_slots <= 0) {
      toast.error("Jumlah slot harus lebih dari 0");
      return;
    }

    if (editingArea) {
      // Update existing area
      const { error } = await supabase
        .from("parking_areas")
        .update({
          name: formData.name,
          total_slots: formData.total_slots,
          hourly_rate: formData.hourly_rate
        })
        .eq("id", editingArea.id);

      if (error) {
        toast.error("Gagal mengupdate area parkir");
        console.error(error);
        return;
      }
      toast.success("Area parkir berhasil diupdate");
    } else {
      // Create new area
      const { error } = await supabase
        .from("parking_areas")
        .insert({
          name: formData.name,
          total_slots: formData.total_slots,
          occupied_slots: 0,
          hourly_rate: formData.hourly_rate
        });

      if (error) {
        toast.error("Gagal menambah area parkir");
        console.error(error);
        return;
      }
      toast.success("Area parkir berhasil ditambahkan");
    }

    setDialogOpen(false);
    fetchAreas();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("parking_areas")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Gagal menghapus area parkir");
      console.error(error);
      return;
    }

    toast.success("Area parkir berhasil dihapus");
    fetchAreas();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const getOccupancyColor = (percentage: number) => {
    if (percentage >= 90) return "bg-destructive";
    if (percentage >= 70) return "bg-warning";
    return "bg-success";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Area Parkir</h1>
          <p className="text-muted-foreground mt-1">Kelola zona dan kapasitas parkir</p>
        </div>
        {isAdmin && (
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Tambah Area
          </Button>
        )}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {areas.map((area) => {
          const percentage = area.total_slots > 0 
            ? Math.round((area.occupied_slots / area.total_slots) * 100) 
            : 0;
          
          return (
            <Card key={area.id} className="card-elegant">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <ParkingCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{area.name}</h3>
                      <p className="text-xs text-muted-foreground">{formatCurrency(area.hourly_rate)}/jam</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Terisi</span>
                    <span className="font-medium">{area.occupied_slots}/{area.total_slots}</span>
                  </div>
                  <Progress value={percentage} className={getOccupancyColor(percentage)} />
                  <p className={`text-xs text-right ${percentage >= 90 ? "text-destructive" : percentage >= 70 ? "text-warning" : "text-success"}`}>
                    {percentage}% terisi
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Areas Table */}
      <Card className="card-elegant">
        <CardHeader>
          <CardTitle>Daftar Area Parkir</CardTitle>
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
                  <TableHead>Nama Area</TableHead>
                  <TableHead>Total Slot</TableHead>
                  <TableHead>Terisi</TableHead>
                  <TableHead>Tersedia</TableHead>
                  <TableHead>Tarif/Jam</TableHead>
                  <TableHead>Okupansi</TableHead>
                  {isAdmin && <TableHead>Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {areas.map((area) => {
                  const available = area.total_slots - area.occupied_slots;
                  const percentage = area.total_slots > 0 
                    ? Math.round((area.occupied_slots / area.total_slots) * 100) 
                    : 0;
                  
                  return (
                    <TableRow key={area.id}>
                      <TableCell className="font-medium">{area.name}</TableCell>
                      <TableCell>{area.total_slots}</TableCell>
                      <TableCell>{area.occupied_slots}</TableCell>
                      <TableCell className={available <= 5 ? "text-warning font-medium" : ""}>
                        {available}
                      </TableCell>
                      <TableCell>{formatCurrency(area.hourly_rate)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-20">
                            <Progress value={percentage} className={getOccupancyColor(percentage)} />
                          </div>
                          <span className="text-sm">{percentage}%</span>
                        </div>
                      </TableCell>
                      {isAdmin && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleOpenDialog(area)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Hapus Area Parkir?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Anda yakin ingin menghapus area "{area.name}"? Tindakan ini tidak dapat dibatalkan.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Batal</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(area.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Hapus
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })}
                {areas.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Belum ada area parkir
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingArea ? "Edit Area Parkir" : "Tambah Area Parkir"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nama Area</Label>
              <Input
                placeholder="Contoh: Area A - Utama"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Slot</Label>
              <Input
                type="number"
                placeholder="50"
                value={formData.total_slots || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, total_slots: parseInt(e.target.value) || 0 }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Tarif per Jam (Rp)</Label>
              <Input
                type="number"
                placeholder="2000"
                value={formData.hourly_rate || ""}
                onChange={(e) => setFormData(prev => ({ ...prev, hourly_rate: parseInt(e.target.value) || 0 }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingArea ? "Simpan Perubahan" : "Tambah Area"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ParkingAreas;
