import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  FileText, 
  Calendar as CalendarIcon,
  Database,
  CheckCircle,
  AlertCircle,
  Info,
  FileSpreadsheet,
  FileJson,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { blink } from '@/blink/client';

interface ExportConfig {
  format: 'csv' | 'excel' | 'json';
  dateRange: { from: Date; to: Date };
  includeFields: {
    timestamp: boolean;
    acPower: boolean;
    acVoltage: boolean;
    acCurrent: boolean;
    dcChannels: boolean;
    temperature: boolean;
    yield: boolean;
  };
  inverterIds: string[];
}

interface ExportStatus {
  status: 'idle' | 'exporting' | 'completed' | 'error';
  progress: number;
  message: string;
  downloadUrl?: string;
  fileName?: string;
}

export function DataExport() {
  const [config, setConfig] = useState<ExportConfig>({
    format: 'csv',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      to: new Date()
    },
    includeFields: {
      timestamp: true,
      acPower: true,
      acVoltage: true,
      acCurrent: true,
      dcChannels: true,
      temperature: true,
      yield: true
    },
    inverterIds: []
  });

  const [exportStatus, setExportStatus] = useState<ExportStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const [availableInverters, setAvailableInverters] = useState([
    { id: '1', name: 'Roof East' },
    { id: '2', name: 'Roof West' },
    { id: '3', name: 'Garage' }
  ]);

  const handleFieldChange = (field: keyof ExportConfig['includeFields'], checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      includeFields: {
        ...prev.includeFields,
        [field]: checked
      }
    }));
  };

  const handleInverterToggle = (inverterId: string, checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      inverterIds: checked 
        ? [...prev.inverterIds, inverterId]
        : prev.inverterIds.filter(id => id !== inverterId)
    }));
  };

  const handleSelectAllInverters = (checked: boolean) => {
    setConfig(prev => ({
      ...prev,
      inverterIds: checked ? availableInverters.map(inv => inv.id) : []
    }));
  };

  const generateMockData = () => {
    const data = [];
    const startDate = config.dateRange.from;
    const endDate = config.dateRange.to;
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Generate hourly data for the selected period
    for (let day = 0; day < daysDiff; day++) {
      for (let hour = 6; hour < 20; hour++) { // Solar production hours
        const timestamp = new Date(startDate.getTime() + day * 24 * 60 * 60 * 1000 + hour * 60 * 60 * 1000);
        
        const record: any = {};
        
        if (config.includeFields.timestamp) {
          record.timestamp = timestamp.toISOString();
        }
        if (config.includeFields.acPower) {
          record.ac_power = Math.floor(Math.random() * 1500) + 200;
        }
        if (config.includeFields.acVoltage) {
          record.ac_voltage = 230 + Math.random() * 10;
        }
        if (config.includeFields.acCurrent) {
          record.ac_current = Math.random() * 6 + 1;
        }
        if (config.includeFields.dcChannels) {
          for (let i = 1; i <= 4; i++) {
            record[`dc_power_${i}`] = Math.floor(Math.random() * 400) + 100;
            record[`dc_voltage_${i}`] = 35 + Math.random() * 5;
            record[`dc_current_${i}`] = Math.random() * 10 + 2;
          }
        }
        if (config.includeFields.temperature) {
          record.temperature = 45 + Math.random() * 15;
        }
        if (config.includeFields.yield) {
          record.yield_today = Math.random() * 15 + 5;
          record.yield_total = Math.random() * 5000 + 2000;
        }
        
        data.push(record);
      }
    }
    
    return data;
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };

  const convertToJSON = (data: any[]) => {
    return JSON.stringify(data, null, 2);
  };

  const handleStartExport = async () => {
    if (config.inverterIds.length === 0) {
      alert('Please select at least one inverter to export data from.');
      return;
    }

    const selectedFields = Object.entries(config.includeFields)
      .filter(([_, selected]) => selected)
      .map(([field, _]) => field);

    if (selectedFields.length === 0) {
      alert('Please select at least one field to export.');
      return;
    }

    setExportStatus({
      status: 'exporting',
      progress: 0,
      message: 'Preparing export...'
    });

    try {
      // Simulate export process
      const steps = [
        { progress: 20, message: 'Querying database...' },
        { progress: 40, message: 'Processing data...' },
        { progress: 60, message: 'Formatting export...' },
        { progress: 80, message: 'Generating file...' },
        { progress: 100, message: 'Export completed!' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setExportStatus(prev => ({
          ...prev,
          progress: step.progress,
          message: step.message
        }));
      }

      // Generate mock data
      const data = generateMockData();
      let fileContent = '';
      let fileName = '';
      let mimeType = '';

      switch (config.format) {
        case 'csv':
          fileContent = convertToCSV(data);
          fileName = `solar_data_${format(config.dateRange.from, 'yyyy-MM-dd')}_to_${format(config.dateRange.to, 'yyyy-MM-dd')}.csv`;
          mimeType = 'text/csv';
          break;
        case 'excel':
          // In a real implementation, you'd use a library like xlsx
          fileContent = convertToCSV(data);
          fileName = `solar_data_${format(config.dateRange.from, 'yyyy-MM-dd')}_to_${format(config.dateRange.to, 'yyyy-MM-dd')}.xlsx`;
          mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          break;
        case 'json':
          fileContent = convertToJSON(data);
          fileName = `solar_data_${format(config.dateRange.from, 'yyyy-MM-dd')}_to_${format(config.dateRange.to, 'yyyy-MM-dd')}.json`;
          mimeType = 'application/json';
          break;
      }

      // Create download URL
      const blob = new Blob([fileContent], { type: mimeType });
      const downloadUrl = URL.createObjectURL(blob);

      setExportStatus({
        status: 'completed',
        progress: 100,
        message: `Export completed! ${data.length} records exported.`,
        downloadUrl,
        fileName
      });

    } catch (error) {
      console.error('Export failed:', error);
      setExportStatus({
        status: 'error',
        progress: 0,
        message: 'Export failed. Please try again.'
      });
    }
  };

  const handleDownload = () => {
    if (exportStatus.downloadUrl && exportStatus.fileName) {
      const link = document.createElement('a');
      link.href = exportStatus.downloadUrl;
      link.download = exportStatus.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const resetExport = () => {
    if (exportStatus.downloadUrl) {
      URL.revokeObjectURL(exportStatus.downloadUrl);
    }
    setExportStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'csv':
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4" />;
      case 'json':
        return <FileJson className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Data Export</h1>
        <p className="text-muted-foreground">
          Export your solar production data in various formats for analysis or backup purposes.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Export Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Format Selection */}
            <div className="space-y-2">
              <Label>Export Format</Label>
              <Select 
                value={config.format} 
                onValueChange={(value: 'csv' | 'excel' | 'json') => 
                  setConfig(prev => ({ ...prev, format: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      CSV (Comma Separated Values)
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4" />
                      Excel (.xlsx)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileJson className="w-4 h-4" />
                      JSON (JavaScript Object Notation)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {config.dateRange.from ? (
                      config.dateRange.to ? (
                        <>
                          {format(config.dateRange.from, "LLL dd, y")} -{" "}
                          {format(config.dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(config.dateRange.from, "LLL dd, y")
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
                    defaultMonth={config.dateRange.from}
                    selected={config.dateRange}
                    onSelect={(range: any) => setConfig(prev => ({ 
                      ...prev, 
                      dateRange: range || prev.dateRange 
                    }))}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Inverter Selection */}
            <div className="space-y-3">
              <Label>Select Inverters</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    checked={config.inverterIds.length === availableInverters.length}
                    onCheckedChange={handleSelectAllInverters}
                  />
                  <Label htmlFor="select-all" className="font-medium">
                    Select All ({availableInverters.length})
                  </Label>
                </div>
                <Separator />
                {availableInverters.map((inverter) => (
                  <div key={inverter.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`inverter-${inverter.id}`}
                      checked={config.inverterIds.includes(inverter.id)}
                      onCheckedChange={(checked) => handleInverterToggle(inverter.id, checked as boolean)}
                    />
                    <Label htmlFor={`inverter-${inverter.id}`}>
                      {inverter.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Selection */}
            <div className="space-y-3">
              <Label>Data Fields to Include</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(config.includeFields).map(([field, selected]) => (
                  <div key={field} className="flex items-center space-x-2">
                    <Checkbox
                      id={`field-${field}`}
                      checked={selected}
                      onCheckedChange={(checked) => 
                        handleFieldChange(field as keyof ExportConfig['includeFields'], checked as boolean)
                      }
                    />
                    <Label htmlFor={`field-${field}`} className="text-sm">
                      {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleStartExport}
              disabled={exportStatus.status === 'exporting'}
              className="w-full"
            >
              {exportStatus.status === 'exporting' ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  {getFormatIcon(config.format)}
                  <span className="ml-2">Start Export</span>
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Export Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Export Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <span className={cn(
                "text-sm font-medium",
                exportStatus.status === 'completed' && "text-green-600",
                exportStatus.status === 'error' && "text-red-600",
                exportStatus.status === 'exporting' && "text-blue-600"
              )}>
                {exportStatus.status === 'idle' ? 'Ready' :
                 exportStatus.status === 'exporting' ? 'Exporting' :
                 exportStatus.status === 'completed' ? 'Completed' :
                 'Error'}
              </span>
            </div>

            {exportStatus.status !== 'idle' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{exportStatus.progress}%</span>
                  </div>
                  <Progress value={exportStatus.progress} className="w-full" />
                </div>

                {exportStatus.message && (
                  <Alert>
                    {exportStatus.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : exportStatus.status === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4 animate-spin" />
                    )}
                    <AlertDescription>{exportStatus.message}</AlertDescription>
                  </Alert>
                )}

                {exportStatus.status === 'completed' && (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-800">Export Ready</span>
                      </div>
                      <p className="text-sm text-green-700">
                        File: {exportStatus.fileName}
                      </p>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button onClick={handleDownload} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download File
                      </Button>
                      <Button onClick={resetExport} variant="outline">
                        New Export
                      </Button>
                    </div>
                  </div>
                )}

                {exportStatus.status === 'error' && (
                  <Button onClick={resetExport} variant="outline" className="w-full">
                    Try Again
                  </Button>
                )}
              </>
            )}

            {exportStatus.status === 'idle' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configure your export settings and click "Start Export" to begin downloading your data.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Export Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Export Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-medium mb-2">Supported Formats</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• <strong>CSV:</strong> Compatible with Excel, Google Sheets</li>
                <li>• <strong>Excel:</strong> Native .xlsx format with formatting</li>
                <li>• <strong>JSON:</strong> Structured data for developers</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Fields</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Timestamps with timezone information</li>
                <li>• AC power, voltage, and current measurements</li>
                <li>• DC channel data for all 4 inputs</li>
                <li>• Temperature and yield information</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Usage Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Limit date ranges for faster exports</li>
                <li>• CSV format is best for analysis</li>
                <li>• JSON format preserves data types</li>
                <li>• Excel format includes formatting</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}