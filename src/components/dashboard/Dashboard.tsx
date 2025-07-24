import { useState, useEffect, useCallback } from 'react';
import { MetricCard } from './MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { 
  Zap, 
  Sun, 
  TrendingUp, 
  DollarSign, 
  Calendar,
  Activity,
  AlertCircle
} from 'lucide-react';
import { blink } from '@/blink/client';
import { Inverter, DashboardMetrics } from '@/types';

interface DashboardProps {
  onInverterSelect?: (inverterId: string) => void;
}

export function Dashboard({ onInverterSelect }: DashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalAcPower: 0,
    yieldToday: 0,
    yieldTotal: 0,
    savingsToday: 0
  });
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [powerChartData, setPowerChartData] = useState<any[]>([]);
  const [dailyChartData, setDailyChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'today' | '7days' | 'month'>('today');

  const generateMockData = useCallback((invertersData: Inverter[]) => {
    // Mock metrics
    const totalPower = Math.floor(Math.random() * 5000) + 1000;
    const yieldToday = Math.floor(Math.random() * 30) + 10;
    const yieldTotal = Math.floor(Math.random() * 10000) + 5000;
    const electricityPrice = 0.25; // Default price per kWh
    
    setMetrics({
      totalAcPower: totalPower,
      yieldToday: yieldToday,
      yieldTotal: yieldTotal,
      savingsToday: yieldToday * electricityPrice
    });

    // Mock power chart data (hourly for today)
    const powerData = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const power = Math.max(0, Math.sin((23 - i) * Math.PI / 12) * (2000 + Math.random() * 1000));
      powerData.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        power: Math.floor(power)
      });
    }
    setPowerChartData(powerData);

    // Mock daily chart data (last 30 days)
    const dailyData = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const yieldValue = Math.floor(Math.random() * 40) + 10;
      dailyData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        yield: yieldValue
      });
    }
    setDailyChartData(dailyData);

    // Update inverter statuses with mock data
    const updatedInverters = invertersData.map(inverter => ({
      ...inverter,
      status: Math.random() > 0.2 ? 'online' : 'offline' as 'online' | 'offline',
      currentPower: Math.floor(Math.random() * 1500) + 200,
      yieldToday: Math.floor(Math.random() * 15) + 5
    }));
    setInverters(updatedInverters as any);
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      
      // Load inverters
      const invertersData = await blink.db.inverters.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      setInverters(invertersData);

      // Generate mock data for demonstration
      generateMockData(invertersData);
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [generateMockData]);

  useEffect(() => {
    loadDashboardData();
    // Set up real-time updates every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, [loadDashboardData, timeRange]);

  const handleInverterClick = (inverterId: string) => {
    if (onInverterSelect) {
      onInverterSelect(inverterId);
    } else {
      alert(`Inverter details for ${inverterId} - Coming in next update!`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total AC Power (Live)"
          value={metrics.totalAcPower}
          unit="W"
          icon={Zap}
          loading={loading}
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <MetricCard
          title="Yield Today"
          value={metrics.yieldToday.toFixed(1)}
          unit="kWh"
          icon={Sun}
          loading={loading}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200"
        />
        <MetricCard
          title="Yield Total"
          value={metrics.yieldTotal.toFixed(1)}
          unit="kWh"
          icon={TrendingUp}
          loading={loading}
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <MetricCard
          title="Savings Today"
          value={`$${metrics.savingsToday.toFixed(2)}`}
          icon={DollarSign}
          loading={loading}
          className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Power Chart */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                AC Power Production
              </CardTitle>
              <div className="flex gap-2">
                {(['today', '7days', 'month'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                  >
                    {range === 'today' ? 'Today' : range === '7days' ? '7 Days' : 'Month'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={powerChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="time" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}W`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}W`, 'Power']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="power" 
                    stroke="hsl(var(--solar-green))" 
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "hsl(var(--solar-green))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Daily Production Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Daily Production (Last 30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `${value}kWh`}
                  />
                  <Tooltip 
                    formatter={(value) => [`${value}kWh`, 'Production']}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar 
                    dataKey="yield" 
                    fill="hsl(var(--solar-blue))"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inverters Status Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Inverter Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {inverters.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Inverters Found</h3>
              <p className="text-muted-foreground mb-4">
                Add your first inverter to start monitoring your solar production.
              </p>
              <Button>Add Inverter</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>AC Power (Live)</TableHead>
                  <TableHead>Yield Today</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inverters.map((inverter: any) => (
                  <TableRow 
                    key={inverter.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleInverterClick(inverter.id)}
                  >
                    <TableCell className="font-medium">{inverter.name}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={inverter.status === 'online' ? 'default' : 'secondary'}
                        className={inverter.status === 'online' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {inverter.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inverter.status === 'online' ? `${inverter.currentPower || 0}W` : '-'}
                    </TableCell>
                    <TableCell>
                      {inverter.status === 'online' ? `${inverter.yieldToday || 0}kWh` : '-'}
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}