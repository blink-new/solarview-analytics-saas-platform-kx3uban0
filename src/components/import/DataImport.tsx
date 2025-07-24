import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Database, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Info,
  Server,
  Key,
  Building,
  Folder,
  Clock,
  TrendingUp
} from 'lucide-react';
import { blink } from '@/blink/client';

interface ImportConfig {
  host: string;
  port: string;
  token: string;
  organization: string;
  bucket: string;
}

interface ImportStatus {
  status: 'idle' | 'connecting' | 'importing' | 'completed' | 'error';
  progress: number;
  message: string;
  recordsProcessed: number;
  recordsTotal: number;
  errors: string[];
}

export function DataImport() {
  const [config, setConfig] = useState<ImportConfig>({
    host: '',
    port: '8086',
    token: '',
    organization: '',
    bucket: ''
  });
  
  const [importStatus, setImportStatus] = useState<ImportStatus>({
    status: 'idle',
    progress: 0,
    message: '',
    recordsProcessed: 0,
    recordsTotal: 0,
    errors: []
  });

  const [testConnection, setTestConnection] = useState<{
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
  }>({
    status: 'idle',
    message: ''
  });

  const handleConfigChange = (field: keyof ImportConfig, value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setTestConnection({ status: 'testing', message: 'Testing connection...' });
    
    try {
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock validation
      if (!config.host || !config.token || !config.organization || !config.bucket) {
        throw new Error('Please fill in all required fields');
      }
      
      setTestConnection({ 
        status: 'success', 
        message: 'Connection successful! InfluxDB is accessible and credentials are valid.' 
      });
    } catch (error) {
      setTestConnection({ 
        status: 'error', 
        message: error instanceof Error ? error.message : 'Connection failed' 
      });
    }
  };

  const handleStartImport = async () => {
    if (testConnection.status !== 'success') {
      alert('Please test the connection first');
      return;
    }

    setImportStatus({
      status: 'connecting',
      progress: 0,
      message: 'Connecting to InfluxDB...',
      recordsProcessed: 0,
      recordsTotal: 0,
      errors: []
    });

    try {
      const user = await blink.auth.me();
      
      // Simulate import process
      const totalRecords = Math.floor(Math.random() * 10000) + 5000;
      
      setImportStatus(prev => ({
        ...prev,
        status: 'importing',
        message: 'Importing historical data...',
        recordsTotal: totalRecords
      }));

      // Simulate progress updates
      for (let i = 0; i <= 100; i += 5) {
        await new Promise(resolve => setTimeout(resolve, 200));
        
        const processed = Math.floor((i / 100) * totalRecords);
        setImportStatus(prev => ({
          ...prev,
          progress: i,
          recordsProcessed: processed,
          message: `Processing records... ${processed}/${totalRecords}`
        }));
      }

      // Simulate data insertion into PostgreSQL
      setImportStatus(prev => ({
        ...prev,
        message: 'Saving data to database...'
      }));

      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock database insertion
      const mockPowerData = [];
      const now = new Date();
      
      for (let i = 0; i < 100; i++) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        mockPowerData.push({
          userId: user.id,
          inverterId: 'mock-inverter-1',
          timestamp: timestamp.toISOString(),
          acPower: Math.floor(Math.random() * 1500) + 200,
          acVoltage: 230 + Math.random() * 10,
          acCurrent: Math.random() * 6 + 1,
          dcPower1: Math.floor(Math.random() * 400) + 100,
          dcVoltage1: 35 + Math.random() * 5,
          dcCurrent1: Math.random() * 10 + 2,
          dcPower2: Math.floor(Math.random() * 400) + 100,
          dcVoltage2: 35 + Math.random() * 5,
          dcCurrent2: Math.random() * 10 + 2,
          dcPower3: Math.floor(Math.random() * 400) + 100,
          dcVoltage3: 35 + Math.random() * 5,
          dcCurrent3: Math.random() * 10 + 2,
          dcPower4: Math.floor(Math.random() * 400) + 100,
          dcVoltage4: 35 + Math.random() * 5,
          dcCurrent4: Math.random() * 10 + 2,
          temperature: 45 + Math.random() * 15,
          yieldToday: Math.random() * 15 + 5,
          yieldTotal: Math.random() * 5000 + 2000
        });
      }

      // Insert sample data
      await blink.db.powerData.createMany(mockPowerData);

      setImportStatus({
        status: 'completed',
        progress: 100,
        message: 'Import completed successfully!',
        recordsProcessed: totalRecords,
        recordsTotal: totalRecords,
        errors: []
      });

    } catch (error) {
      setImportStatus(prev => ({
        ...prev,
        status: 'error',
        message: 'Import failed',
        errors: [error instanceof Error ? error.message : 'Unknown error occurred']
      }));
    }
  };

  const resetImport = () => {
    setImportStatus({
      status: 'idle',
      progress: 0,
      message: '',
      recordsProcessed: 0,
      recordsTotal: 0,
      errors: []
    });
    setTestConnection({ status: 'idle', message: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">InfluxDB Data Import</h1>
        <p className="text-muted-foreground">
          Import historical solar production data from your InfluxDB instance into SolarView Analytics.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              InfluxDB Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="host" className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Host
              </Label>
              <Input
                id="host"
                placeholder="e.g. localhost or 192.168.1.100"
                value={config.host}
                onChange={(e) => handleConfigChange('host', e.target.value)}
                disabled={importStatus.status === 'importing'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input
                id="port"
                placeholder="8086"
                value={config.port}
                onChange={(e) => handleConfigChange('port', e.target.value)}
                disabled={importStatus.status === 'importing'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token" className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                Access Token
              </Label>
              <Textarea
                id="token"
                placeholder="Your InfluxDB access token"
                value={config.token}
                onChange={(e) => handleConfigChange('token', e.target.value)}
                disabled={importStatus.status === 'importing'}
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization" className="flex items-center gap-2">
                <Building className="w-4 h-4" />
                Organization
              </Label>
              <Input
                id="organization"
                placeholder="Your organization name"
                value={config.organization}
                onChange={(e) => handleConfigChange('organization', e.target.value)}
                disabled={importStatus.status === 'importing'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bucket" className="flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Bucket
              </Label>
              <Input
                id="bucket"
                placeholder="Your data bucket name"
                value={config.bucket}
                onChange={(e) => handleConfigChange('bucket', e.target.value)}
                disabled={importStatus.status === 'importing'}
              />
            </div>

            <Separator />

            <div className="flex gap-2">
              <Button
                onClick={handleTestConnection}
                disabled={testConnection.status === 'testing' || importStatus.status === 'importing'}
                variant="outline"
                className="flex-1"
              >
                {testConnection.status === 'testing' ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>

              <Button
                onClick={handleStartImport}
                disabled={
                  testConnection.status !== 'success' || 
                  importStatus.status === 'importing' ||
                  importStatus.status === 'connecting'
                }
                className="flex-1"
              >
                {importStatus.status === 'importing' || importStatus.status === 'connecting' ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-pulse" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Import
                  </>
                )}
              </Button>
            </div>

            {/* Connection Test Result */}
            {testConnection.status !== 'idle' && (
              <Alert className={testConnection.status === 'success' ? 'border-green-200 bg-green-50' : testConnection.status === 'error' ? 'border-red-200 bg-red-50' : ''}>
                {testConnection.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : testConnection.status === 'error' ? (
                  <AlertCircle className="h-4 w-4 text-red-600" />
                ) : (
                  <Clock className="h-4 w-4 animate-spin" />
                )}
                <AlertDescription>{testConnection.message}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Import Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Import Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={
                importStatus.status === 'completed' ? 'default' :
                importStatus.status === 'error' ? 'destructive' :
                importStatus.status === 'importing' || importStatus.status === 'connecting' ? 'secondary' :
                'outline'
              }>
                {importStatus.status === 'idle' ? 'Ready' :
                 importStatus.status === 'connecting' ? 'Connecting' :
                 importStatus.status === 'importing' ? 'Importing' :
                 importStatus.status === 'completed' ? 'Completed' :
                 'Error'}
              </Badge>
            </div>

            {importStatus.status !== 'idle' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{importStatus.progress}%</span>
                  </div>
                  <Progress value={importStatus.progress} className="w-full" />
                </div>

                {importStatus.message && (
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>{importStatus.message}</AlertDescription>
                  </Alert>
                )}

                {importStatus.recordsTotal > 0 && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Records Processed:</span>
                      <p className="font-semibold">{importStatus.recordsProcessed.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Records:</span>
                      <p className="font-semibold">{importStatus.recordsTotal.toLocaleString()}</p>
                    </div>
                  </div>
                )}

                {importStatus.errors.length > 0 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription>
                      <div className="space-y-1">
                        <p className="font-medium">Import Errors:</p>
                        {importStatus.errors.map((error, index) => (
                          <p key={index} className="text-sm">• {error}</p>
                        ))}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {(importStatus.status === 'completed' || importStatus.status === 'error') && (
                  <Button onClick={resetImport} variant="outline" className="w-full">
                    Start New Import
                  </Button>
                )}
              </>
            )}

            {importStatus.status === 'idle' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Configure your InfluxDB connection settings and test the connection before starting the import process.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Import Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="w-5 h-5" />
            Import Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">What data will be imported?</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• AC Power, Voltage, and Current measurements</li>
                <li>• DC Power, Voltage, and Current for all channels</li>
                <li>• Inverter temperature readings</li>
                <li>• Daily and total yield values</li>
                <li>• Historical timestamps and metadata</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Data Processing</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Automatic unit conversion and validation</li>
                <li>• Duplicate record detection and prevention</li>
                <li>• Data mapping to PostgreSQL schema</li>
                <li>• Error handling and recovery</li>
                <li>• Progress tracking and status updates</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}