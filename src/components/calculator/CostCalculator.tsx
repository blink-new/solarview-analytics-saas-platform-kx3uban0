import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  Calculator, 
  Lightbulb,
  Leaf,
  Zap,
  Calendar,
  Settings,
  Info,
  Save
} from 'lucide-react';
import { blink } from '@/blink/client';

interface SavingsData {
  today: number;
  thisMonth: number;
  thisYear: number;
  total: number;
}

interface CostSettings {
  electricityPrice: number;
  currency: string;
  taxRate: number;
}

export function CostCalculator() {
  const [settings, setSettings] = useState<CostSettings>({
    electricityPrice: 0.25,
    currency: 'USD',
    taxRate: 0
  });
  
  const [savings, setSavings] = useState<SavingsData>({
    today: 0,
    thisMonth: 0,
    thisYear: 0,
    total: 0
  });

  const [monthlySavings, setMonthlySavings] = useState<any[]>([]);
  const [environmentalImpact, setEnvironmentalImpact] = useState({
    co2Saved: 0,
    treesEquivalent: 0,
    coalAvoided: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadUserSettings = async () => {
    try {
      const user = await blink.auth.me();
      
      // Load user's electricity price setting
      const userData = await blink.db.users.list({
        where: { id: user.id },
        limit: 1
      });
      
      if (userData.length > 0 && userData[0].electricityPrice) {
        setSettings(prev => ({
          ...prev,
          electricityPrice: userData[0].electricityPrice
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
  };

  const calculateSavings = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      
      // Mock production data - in real implementation, this would query actual power_data
      const mockProductionData = {
        today: Math.random() * 30 + 10,
        thisMonth: Math.random() * 800 + 400,
        thisYear: Math.random() * 8000 + 4000,
        total: Math.random() * 50000 + 25000
      };

      const calculatedSavings = {
        today: mockProductionData.today * settings.electricityPrice,
        thisMonth: mockProductionData.thisMonth * settings.electricityPrice,
        thisYear: mockProductionData.thisYear * settings.electricityPrice,
        total: mockProductionData.total * settings.electricityPrice
      };

      setSavings(calculatedSavings);

      // Generate monthly savings data for chart
      const monthlyData = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'short' });
        const production = Math.random() * 600 + 200;
        const savings = production * settings.electricityPrice;
        
        monthlyData.push({
          month: monthName,
          production: Math.floor(production),
          savings: Math.floor(savings * 100) / 100
        });
      }
      setMonthlySavings(monthlyData);

      // Calculate environmental impact
      const totalKwh = mockProductionData.total;
      setEnvironmentalImpact({
        co2Saved: Math.floor(totalKwh * 0.4), // ~0.4 kg CO2 per kWh
        treesEquivalent: Math.floor(totalKwh * 0.4 / 21), // ~21 kg CO2 per tree per year
        coalAvoided: Math.floor(totalKwh * 0.5) // ~0.5 kg coal per kWh
      });

    } catch (error) {
      console.error('Error calculating savings:', error);
    } finally {
      setLoading(false);
    }
  }, [settings.electricityPrice]);

  useEffect(() => {
    loadUserSettings();
    calculateSavings();
  }, [calculateSavings]);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const user = await blink.auth.me();
      
      await blink.db.users.update(user.id, {
        electricityPrice: settings.electricityPrice
      });

      // Recalculate savings with new price
      await calculateSavings();
      
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: settings.currency
    }).format(amount);
  };

  const pieData = [
    { name: 'Today', value: savings.today, color: '#10B981' },
    { name: 'This Month', value: savings.thisMonth - savings.today, color: '#3B82F6' },
    { name: 'This Year', value: savings.thisYear - savings.thisMonth, color: '#8B5CF6' },
    { name: 'Previous Years', value: savings.total - savings.thisYear, color: '#F59E0B' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Cost Calculator & Savings Analysis</h1>
        <p className="text-muted-foreground">
          Track your solar energy savings and environmental impact with detailed cost analysis.
        </p>
      </div>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Cost Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="electricityPrice">Electricity Price per kWh</Label>
              <div className="flex">
                <span className="inline-flex items-center px-3 text-sm border border-r-0 rounded-l-md bg-muted">
                  $
                </span>
                <Input
                  id="electricityPrice"
                  type="number"
                  step="0.01"
                  value={settings.electricityPrice}
                  onChange={(e) => setSettings(prev => ({ ...prev, electricityPrice: parseFloat(e.target.value) || 0 }))}
                  className="rounded-l-none"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                value={settings.currency}
                onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
                placeholder="USD"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxRate">Tax Rate (%)</Label>
              <Input
                id="taxRate"
                type="number"
                step="0.1"
                value={settings.taxRate}
                onChange={(e) => setSettings(prev => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))}
                placeholder="0"
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-4">
            <Button onClick={handleSaveSettings} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
            <Button onClick={calculateSavings} variant="outline">
              <Calculator className="w-4 h-4 mr-2" />
              Recalculate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Savings Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-800">Today's Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-green-800">
                {formatCurrency(savings.today)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-800">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold text-blue-800">
                {formatCurrency(savings.thisMonth)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-purple-800">This Year</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold text-purple-800">
                {formatCurrency(savings.thisYear)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-800">Total Savings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold text-yellow-800">
                {formatCurrency(savings.total)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Savings Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Monthly Savings (Last 12 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySavings}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis 
                    dataKey="month" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === 'savings' ? formatCurrency(value as number) : `${value}kWh`,
                      name === 'savings' ? 'Savings' : 'Production'
                    ]}
                    labelStyle={{ color: '#374151' }}
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="savings" fill="#10B981" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Savings Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              Savings Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environmental Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Environmental Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Leaf className="w-8 h-8 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-green-800">{environmentalImpact.co2Saved} kg</p>
              <p className="text-sm text-muted-foreground">CO₂ Emissions Saved</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Zap className="w-8 h-8 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-blue-800">{environmentalImpact.treesEquivalent}</p>
              <p className="text-sm text-muted-foreground">Trees Planted Equivalent</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <DollarSign className="w-8 h-8 text-gray-600" />
              </div>
              <p className="text-2xl font-bold text-gray-800">{environmentalImpact.coalAvoided} kg</p>
              <p className="text-sm text-muted-foreground">Coal Consumption Avoided</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Calculation Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>Savings Calculation:</strong> Based on your solar production data multiplied by your electricity rate.</p>
                <p><strong>Environmental Impact:</strong> CO₂ savings calculated using average grid emission factors. Tree equivalency based on annual CO₂ absorption rates.</p>
                <p><strong>Data Updates:</strong> Calculations are updated in real-time as new production data is recorded from your inverters.</p>
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}