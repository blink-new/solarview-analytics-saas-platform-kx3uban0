import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  ArrowLeft, 
  Zap, 
  Sun, 
  Thermometer, 
  Activity, 
  Settings, 
  Info, 
  Calendar as CalendarIcon,
  Power,
  RotateCcw,
  Play,
  Square
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { blink } from '@/blink/client';
import { Inverter, LiveData } from '@/types';

interface InverterDetailsProps {
  inverterId: string;
  onBack: () => void;
}

export function InverterDetails({ inverterId, onBack }: InverterDetailsProps) {
  const [inverter, setInverter] = useState<Inverter | null>(null);
  const [liveData, setLiveData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('live');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  });
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [powerLimits, setPowerLimits] = useState({
    nonPersistentWatts: '',
    nonPersistentPercent: '',
    persistentWatts: '',
    persistentPercent: ''
  });

  const loadLiveData = useCallback(async () => {
    // Mock live data - in real implementation, this would call AhoyDTU API
    const mockLiveData: LiveData = {
      acPower: Math.floor(Math.random() * 1500) + 200,
      acVoltage: 230 + Math.random() * 10,
      acCurrent: Math.random() * 6 + 1,
      dcChannels: [
        {
          power: Math.floor(Math.random() * 400) + 100,
          voltage: 35 + Math.random() * 5,
          current: Math.random() * 10 + 2
        },
        {
          power: Math.floor(Math.random() * 400) + 100,
          voltage: 35 + Math.random() * 5,
          current: Math.random() * 10 + 2
        },
        {
          power: Math.floor(Math.random() * 400) + 100,
          voltage: 35 + Math.random() * 5,
          current: Math.random() * 10 + 2
        },
        {
          power: Math.floor(Math.random() * 400) + 100,
          voltage: 35 + Math.random() * 5,
          current: Math.random() * 10 + 2
        }
      ],
      temperature: 45 + Math.random() * 15,
      yieldToday: Math.random() * 15 + 5,
      yieldTotal: Math.random() * 5000 + 2000
    };
    setLiveData(mockLiveData);
  }, []);

  const loadHistoricalData = useCallback(async () => {
    // Mock historical data
    const data = [];
    const now = new Date();
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        time: time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        power: Math.max(0, Math.sin((23 - i) * Math.PI / 12) * (800 + Math.random() * 400)),
        voltage: 230 + Math.random() * 10,
        current: Math.random() * 6 + 1
      });
    }
    setHistoricalData(data);
  }, []);

  const loadInverterData = useCallback(async () => {
    try {
      const inverterData = await blink.db.inverters.list({
        where: { id: inverterId },
        limit: 1
      });
      
      if (inverterData.length > 0) {
        setInverter(inverterData[0] as any);
        await loadLiveData();
        await loadHistoricalData();
      }
    } catch (error) {
      console.error('Error loading inverter data:', error);
    } finally {
      setLoading(false);
    }
  }, [inverterId, loadLiveData, loadHistoricalData]);

  useEffect(() => {
    loadInverterData();
    const interval = setInterval(loadLiveData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, [loadInverterData, loadLiveData]);

  const handlePowerControl = async (action: 'restart' | 'enable' | 'disable') => {
    // Mock API call - in real implementation, this would call AhoyDTU API
    console.log(`Sending ${action} command to inverter ${inverterId}`);
    alert(`${action.charAt(0).toUpperCase() + action.slice(1)} command sent to inverter!`);
  };

  const handleSetPowerLimit = async (type: 'nonPersistentWatts' | 'nonPersistentPercent' | 'persistentWatts' | 'persistentPercent') => {
    const value = powerLimits[type];
    if (!value) return;
    
    console.log(`Setting ${type} limit to ${value}`);
    alert(`Power limit set: ${type} = ${value}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading inverter details...</p>
        </div>
      </div>
    );
  }

  if (!inverter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Inverter Not Found</h2>
        <Button onClick={onBack}>Back to Dashboard</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{inverter.name}</h1>
          <p className="text-muted-foreground">Serial: {inverter.serialNumber || 'N/A'}</p>
        </div>
        <div className="ml-auto">
          <Badge variant={inverter.status === 'online' ? 'default' : 'secondary'}>
            {inverter.status}
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="live">Live Data</TabsTrigger>
          <TabsTrigger value="historical">Historical</TabsTrigger>
          <TabsTrigger value="control">Control</TabsTrigger>
          <TabsTrigger value="info">Info & Alerts</TabsTrigger>
        </TabsList>

        {/* Live Data Tab */}
        <TabsContent value="live" className="space-y-6">
          {liveData && (
            <>
              {/* AC Data Container (Green) */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <Zap className="w-5 h-5" />
                    AC Output
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-green-600">Power</p>
                      <p className="text-2xl font-bold text-green-800">{liveData.acPower.toFixed(0)}W</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600">Voltage</p>
                      <p className="text-2xl font-bold text-green-800">{liveData.acVoltage.toFixed(1)}V</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600">Current</p>
                      <p className="text-2xl font-bold text-green-800">{liveData.acCurrent.toFixed(2)}A</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-green-600">Temperature</p>
                      <p className="text-2xl font-bold text-green-800">{liveData.temperature.toFixed(1)}°C</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* DC Channels (Blue) */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {liveData.dcChannels.map((channel, index) => (
                  <Card key={index} className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-blue-800">
                        DC Channel {index + 1}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-xs text-blue-600">Power:</span>
                        <span className="text-sm font-semibold text-blue-800">{channel.power.toFixed(0)}W</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-blue-600">Voltage:</span>
                        <span className="text-sm font-semibold text-blue-800">{channel.voltage.toFixed(1)}V</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-blue-600">Current:</span>
                        <span className="text-sm font-semibold text-blue-800">{channel.current.toFixed(2)}A</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Production Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sun className="w-5 h-5" />
                      Today's Production
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{liveData.yieldToday.toFixed(2)} kWh</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Total Production
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{liveData.yieldTotal.toFixed(1)} kWh</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* Historical Data Tab */}
        <TabsContent value="historical" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Historical Data</CardTitle>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd, y")} -{" "}
                            {format(dateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>Pick a date range</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange}
                      onSelect={(range: any) => setDateRange(range || dateRange)}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis dataKey="time" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Line type="monotone" dataKey="power" stroke="#059669" strokeWidth={2} name="Power (W)" />
                    <Line type="monotone" dataKey="voltage" stroke="#0ea5e9" strokeWidth={2} name="Voltage (V)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Control Tab */}
        <TabsContent value="control" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Power Limits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Power Limits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Non-persistent Limit (Watts)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 800"
                      value={powerLimits.nonPersistentWatts}
                      onChange={(e) => setPowerLimits(prev => ({ ...prev, nonPersistentWatts: e.target.value }))}
                    />
                    <Button onClick={() => handleSetPowerLimit('nonPersistentWatts')}>Set</Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Non-persistent Limit (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 80"
                      max="100"
                      value={powerLimits.nonPersistentPercent}
                      onChange={(e) => setPowerLimits(prev => ({ ...prev, nonPersistentPercent: e.target.value }))}
                    />
                    <Button onClick={() => handleSetPowerLimit('nonPersistentPercent')}>Set</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Persistent Limit (Watts)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 1000"
                      value={powerLimits.persistentWatts}
                      onChange={(e) => setPowerLimits(prev => ({ ...prev, persistentWatts: e.target.value }))}
                    />
                    <Button onClick={() => handleSetPowerLimit('persistentWatts')}>Set</Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Persistent Limit (%)</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="e.g. 100"
                      max="100"
                      value={powerLimits.persistentPercent}
                      onChange={(e) => setPowerLimits(prev => ({ ...prev, persistentPercent: e.target.value }))}
                    />
                    <Button onClick={() => handleSetPowerLimit('persistentPercent')}>Set</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Control Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Power className="w-5 h-5" />
                  Inverter Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handlePowerControl('restart')}
                  className="w-full"
                  variant="outline"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restart Inverter
                </Button>
                
                <Button 
                  onClick={() => handlePowerControl('enable')}
                  className="w-full"
                  variant="default"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Enable Inverter
                </Button>
                
                <Button 
                  onClick={() => handlePowerControl('disable')}
                  className="w-full"
                  variant="destructive"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Disable Inverter
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Info & Alerts Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Inverter Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Inverter Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell className="font-medium">Model</TableCell>
                      <TableCell>HMS-800W-2T</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Firmware Version</TableCell>
                      <TableCell>1.0.14</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Build Time</TableCell>
                      <TableCell>2024-01-15 10:30:45</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">Serial Number</TableCell>
                      <TableCell>{inverter.serialNumber || 'N/A'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell className="font-medium">AhoyDTU URL</TableCell>
                      <TableCell>{inverter.ahoyDtuUrl || 'Not configured'}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Alarm Log */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Alarm Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>ID</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Normal Operation</TableCell>
                      <TableCell>0</TableCell>
                      <TableCell>2024-01-20 06:00</TableCell>
                      <TableCell>-</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Low Irradiance</TableCell>
                      <TableCell>1</TableCell>
                      <TableCell>2024-01-19 18:30</TableCell>
                      <TableCell>2024-01-20 06:00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}