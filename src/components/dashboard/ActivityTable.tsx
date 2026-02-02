import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Car, Bike } from "lucide-react";

interface Activity {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  entry_time: string;
  exit_time: string | null;
  profiles?: { full_name: string } | null;
}

const ActivityTable = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from("transactions")
      .select(`
        id,
        plate_number,
        vehicle_type,
        status,
        entry_time,
        exit_time,
        operator_id
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("activity-table-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions"
        },
        () => {
          fetchActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getTimeDisplay = (activity: Activity) => {
    if (activity.exit_time) {
      return format(new Date(activity.exit_time), "HH:mm", { locale: id });
    }
    return format(new Date(activity.entry_time), "HH:mm", { locale: id });
  };

  if (loading) {
    return (
      <div className="card-elegant p-6">
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Aktivitas Terkini</h2>
        <a href="/dashboard/transactions" className="text-sm text-accent hover:underline font-medium">
          Lihat Semua
        </a>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 pr-4">
                Waktu
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 pr-4">
                Plat Nomor
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 pr-4">
                Tipe
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-muted/50 transition-colors">
                <td className="py-4 pr-4">
                  <span className="text-sm font-medium text-foreground">
                    {getTimeDisplay(activity)}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm font-semibold text-foreground">
                    {activity.plate_number}
                  </span>
                </td>
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {activity.vehicle_type === "motor" ? (
                      <Bike className="w-4 h-4" />
                    ) : (
                      <Car className="w-4 h-4" />
                    )}
                    {activity.vehicle_type === "motor" ? "Motor" : "Mobil"}
                  </div>
                </td>
                <td className="py-4">
                  <span
                    className={`badge-status ${
                      activity.status === "parked"
                        ? "bg-success/10 text-success"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {activity.status === "parked" ? "Parkir" : "Selesai"}
                  </span>
                </td>
              </tr>
            ))}
            {activities.length === 0 && (
              <tr>
                <td colSpan={4} className="py-8 text-center text-muted-foreground">
                  Belum ada aktivitas
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
