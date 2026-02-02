import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Transaction {
  id: string;
  plate_number: string;
  vehicle_type: string;
  status: string;
  entry_time: string;
  exit_time: string | null;
  amount: number;
  parking_area_id: string | null;
}

interface RealtimeNotification {
  id: string;
  type: "entry" | "exit";
  plate_number: string;
  vehicle_type: string;
  timestamp: Date;
}

export const useRealtimeTransactions = () => {
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [todayStats, setTodayStats] = useState({
    totalVehicles: 0,
    currentlyParked: 0,
    todayRevenue: 0,
    todayTransactions: 0
  });

  const fetchTodayStats = async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [parkedRes, completedRes] = await Promise.all([
      supabase
        .from("transactions")
        .select("id")
        .eq("status", "parked"),
      supabase
        .from("transactions")
        .select("id, amount")
        .eq("status", "completed")
        .gte("created_at", today.toISOString())
    ]);

    const currentlyParked = parkedRes.data?.length || 0;
    const completedToday = completedRes.data || [];
    const todayRevenue = completedToday.reduce((sum, tx) => sum + (tx.amount || 0), 0);
    
    setTodayStats({
      totalVehicles: currentlyParked + completedToday.length,
      currentlyParked,
      todayRevenue,
      todayTransactions: completedToday.length
    });
  };

  useEffect(() => {
    fetchTodayStats();

    const channel = supabase
      .channel("transactions-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions"
        },
        (payload) => {
          const newData = payload.new as Transaction;
          const oldData = payload.old as Transaction;

          if (payload.eventType === "INSERT") {
            // Vehicle entry
            const notification: RealtimeNotification = {
              id: newData.id,
              type: "entry",
              plate_number: newData.plate_number,
              vehicle_type: newData.vehicle_type,
              timestamp: new Date()
            };
            setNotifications(prev => [notification, ...prev].slice(0, 10));
            toast.success(`🚗 Kendaraan Masuk: ${newData.plate_number}`, {
              description: `${newData.vehicle_type === "motor" ? "Motor" : "Mobil"} telah masuk area parkir`
            });
            fetchTodayStats();
          }

          if (payload.eventType === "UPDATE" && newData.status === "completed" && oldData?.status === "parked") {
            // Vehicle exit
            const notification: RealtimeNotification = {
              id: newData.id,
              type: "exit",
              plate_number: newData.plate_number,
              vehicle_type: newData.vehicle_type,
              timestamp: new Date()
            };
            setNotifications(prev => [notification, ...prev].slice(0, 10));
            toast.info(`🚗 Kendaraan Keluar: ${newData.plate_number}`, {
              description: `Biaya parkir: Rp ${newData.amount?.toLocaleString("id-ID") || 0}`
            });
            fetchTodayStats();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const clearNotifications = () => setNotifications([]);

  return { notifications, todayStats, clearNotifications, refetch: fetchTodayStats };
};
