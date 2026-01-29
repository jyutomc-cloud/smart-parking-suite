import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  variant: "primary" | "success" | "warning" | "accent";
  trend?: {
    value: string;
    positive: boolean;
  };
}

const variantStyles = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  accent: "bg-accent",
};

const textStyles = {
  primary: "text-foreground",
  success: "text-success",
  warning: "text-warning",
  accent: "text-accent",
};

const StatCard = ({ title, value, icon: Icon, variant, trend }: StatCardProps) => {
  return (
    <div className="card-elegant p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </p>
          <h3 className={`text-2xl lg:text-3xl font-bold ${textStyles[variant]}`}>
            {value}
          </h3>
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? "text-success" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value} dari kemarin
            </p>
          )}
        </div>
        <div className={`stat-icon ${variantStyles[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

export default StatCard;
