import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Car, Bike } from "lucide-react";

interface ParkingArea {
  id: string;
  name: string;
  total_slots: number;
  occupied_slots: number;
}

const ParkingOverview = () => {
  const [parkingAreas, setParkingAreas] = useState<ParkingArea[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAreas = async () => {
    const { data, error } = await supabase
      .from("parking_areas")
      .select("id, name, total_slots, occupied_slots")
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching parking areas:", error);
    } else {
      setParkingAreas(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAreas();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("parking-areas-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "parking_areas"
        },
        () => {
          fetchAreas();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="card-elegant p-6">
        <h2 className="text-lg font-bold text-foreground mb-6">Overview Area Parkir</h2>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elegant p-6">
      <h2 className="text-lg font-bold text-foreground mb-6">Overview Area Parkir</h2>
      
      <div className="space-y-4">
        {parkingAreas.map((area) => {
          const percentage = area.total_slots > 0 
            ? Math.round((area.occupied_slots / area.total_slots) * 100) 
            : 0;
          const isHigh = percentage > 80;
          const isMedium = percentage > 50 && percentage <= 80;
          const isMotor = area.name.toLowerCase().includes("motor");
          
          return (
            <div key={area.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isMotor ? (
                    <Bike className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Car className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">{area.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {area.occupied_slots}/{area.total_slots} slot
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh ? "bg-warning" : isMedium ? "bg-accent" : "bg-success"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {parkingAreas.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            Belum ada area parkir
          </p>
        )}
      </div>
    </div>
  );
};

export default ParkingOverview;
