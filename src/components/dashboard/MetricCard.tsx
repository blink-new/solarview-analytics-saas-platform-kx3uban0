import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  loading?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  unit, 
  icon: Icon, 
  trend, 
  className,
  loading = false 
}: MetricCardProps) {
  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline space-x-1">
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 animate-pulse rounded"></div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              {unit && (
                <span className="text-sm text-muted-foreground">{unit}</span>
              )}
            </>
          )}
        </div>
        {trend && !loading && (
          <p className={cn(
            "text-xs mt-1",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            {trend.isPositive ? "+" : ""}{trend.value}% from yesterday
          </p>
        )}
      </CardContent>
    </Card>
  );
}