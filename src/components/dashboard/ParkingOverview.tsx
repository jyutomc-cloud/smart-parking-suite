import { Car, Bike } from "lucide-react";

const parkingAreas = [
  { name: "Area A - Utama", total: 50, used: 42, type: "car" },
  { name: "Area B - Timur", total: 40, used: 28, type: "car" },
  { name: "Area C - Motor", total: 100, used: 85, type: "bike" },
  { name: "Area D - VIP", total: 20, used: 12, type: "car" },
];

const ParkingOverview = () => {
  return (
    <div className="card-elegant p-6">
      <h2 className="text-lg font-bold text-foreground mb-6">Overview Area Parkir</h2>
      
      <div className="space-y-4">
        {parkingAreas.map((area, index) => {
          const percentage = Math.round((area.used / area.total) * 100);
          const isHigh = percentage > 80;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {area.type === "car" ? (
                    <Car className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Bike className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium text-foreground">{area.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {area.used}/{area.total} slot
                </span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isHigh ? "bg-warning" : "bg-accent"
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ParkingOverview;
