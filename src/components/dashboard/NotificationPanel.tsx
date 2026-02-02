import { Bell, Car, Bike, LogIn, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface Notification {
  id: string;
  type: "entry" | "exit";
  plate_number: string;
  vehicle_type: string;
  timestamp: Date;
}

interface NotificationPanelProps {
  notifications: Notification[];
  onClear: () => void;
}

const NotificationPanel = ({ notifications, onClear }: NotificationPanelProps) => {
  return (
    <div className="card-elegant p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Aktivitas Realtime</h3>
          {notifications.length > 0 && (
            <span className="bg-destructive text-destructive-foreground text-xs px-2 py-0.5 rounded-full">
              {notifications.length}
            </span>
          )}
        </div>
        {notifications.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      <ScrollArea className="h-[300px]">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <Bell className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Belum ada aktivitas baru</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  notif.type === "entry" ? "bg-success/10" : "bg-accent/10"
                }`}
              >
                <div className={`p-2 rounded-full ${
                  notif.type === "entry" ? "bg-success" : "bg-accent"
                }`}>
                  {notif.type === "entry" ? (
                    <LogIn className="w-4 h-4 text-white" />
                  ) : (
                    <LogOut className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {notif.vehicle_type === "motor" ? (
                      <Bike className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <Car className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="font-semibold text-foreground truncate">
                      {notif.plate_number}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {notif.type === "entry" ? "Kendaraan masuk" : "Kendaraan keluar"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(notif.timestamp, "HH:mm:ss", { locale: id })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default NotificationPanel;
