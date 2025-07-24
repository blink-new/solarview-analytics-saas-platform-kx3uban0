export interface User {
  id: string;
  email: string;
  electricityPrice: number;
  createdAt: string;
  updatedAt: string;
}

export interface Inverter {
  id: string;
  userId: string;
  name: string;
  serialNumber?: string;
  ahoyDtuUrl?: string;
  status: 'online' | 'offline';
  createdAt: string;
  updatedAt: string;
}

export interface PowerData {
  id: string;
  inverterId: string;
  userId: string;
  timestamp: string;
  acPower: number;
  acVoltage: number;
  acCurrent: number;
  dcPower1: number;
  dcVoltage1: number;
  dcCurrent1: number;
  dcPower2: number;
  dcVoltage2: number;
  dcCurrent2: number;
  dcPower3: number;
  dcVoltage3: number;
  dcCurrent3: number;
  dcPower4: number;
  dcVoltage4: number;
  dcCurrent4: number;
  temperature: number;
  yieldToday: number;
  yieldTotal: number;
  createdAt: string;
}

export interface LiveData {
  acPower: number;
  acVoltage: number;
  acCurrent: number;
  dcChannels: Array<{
    power: number;
    voltage: number;
    current: number;
  }>;
  temperature: number;
  yieldToday: number;
  yieldTotal: number;
}

export interface DashboardMetrics {
  totalAcPower: number;
  yieldToday: number;
  yieldTotal: number;
  savingsToday: number;
}

export interface ChartDataPoint {
  timestamp: string;
  value: number;
  label?: string;
}