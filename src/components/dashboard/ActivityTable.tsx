const activities = [
  { time: "10:45", plate: "B 1234 XYZ", status: "Masuk", officer: "Budi", type: "Mobil" },
  { time: "10:50", plate: "AD 5555 AB", status: "Keluar", officer: "Siti", type: "Motor" },
  { time: "11:02", plate: "H 8899 CD", status: "Masuk", officer: "Budi", type: "Mobil" },
  { time: "11:15", plate: "AB 1122 EF", status: "Keluar", officer: "Rina", type: "Mobil" },
  { time: "11:30", plate: "D 4567 GH", status: "Masuk", officer: "Siti", type: "Motor" },
];

const ActivityTable = () => {
  return (
    <div className="card-elegant p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-foreground">Aktivitas Terkini</h2>
        <button className="text-sm text-accent hover:underline font-medium">
          Lihat Semua
        </button>
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
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3 pr-4">
                Status
              </th>
              <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider py-3">
                Petugas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {activities.map((activity, index) => (
              <tr key={index} className="hover:bg-muted/50 transition-colors">
                <td className="py-4 pr-4">
                  <span className="text-sm font-medium text-foreground">{activity.time}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm font-semibold text-foreground">{activity.plate}</span>
                </td>
                <td className="py-4 pr-4">
                  <span className="text-sm text-muted-foreground">{activity.type}</span>
                </td>
                <td className="py-4 pr-4">
                  <span
                    className={`badge-status ${
                      activity.status === "Masuk"
                        ? "bg-success/10 text-success"
                        : "bg-destructive/10 text-destructive"
                    }`}
                  >
                    {activity.status}
                  </span>
                </td>
                <td className="py-4">
                  <span className="text-sm text-muted-foreground">{activity.officer}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityTable;
