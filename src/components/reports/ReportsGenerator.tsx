import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp,
  Sun,
  Zap,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import { blink } from '@/blink/client';

interface ReportConfig {
  month: string;
  year: string;
  includeCharts: boolean;
  includeDetails: boolean;
}

interface ReportStatus {
  status: 'idle' | 'generating' | 'completed' | 'error';
  progress: number;
  message: string;
  downloadUrl?: string;
}

interface ReportData {
  period: string;
  totalProduction: number;
  maxPower: number;
  totalSavings: number;
  dailyData: Array<{
    date: string;
    production: number;
    savings: number;
  }>;
  summary: {
    averageDailyProduction: number;
    bestDay: { date: string; production: number };
    totalDays: number;
    onlineDays: number;
  };
}

export function ReportsGenerator() {
  const [config, setConfig] = useState<ReportConfig>({
    month: new Date().getMonth().toString(),
    year: new Date().getFullYear().toString(),
    includeCharts: true,
    includeDetails: true
  });

  const [reportStatus, setReportStatus] = useState<ReportStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });

  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [recentReports, setRecentReports] = useState<Array<{
    id: string;
    name: string;
    date: string;
    size: string;
    status: 'completed' | 'failed';
  }>>([
    {
      id: '1',
      name: 'Solar Report - December 2024.pdf',
      date: '2024-12-20',
      size: '2.3 MB',
      status: 'completed'
    },
    {
      id: '2',
      name: 'Solar Report - November 2024.pdf',
      date: '2024-11-30',
      size: '2.1 MB',
      status: 'completed'
    }
  ]);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => (currentYear - i).toString());

  const generateMockReportData = (): ReportData => {
    const monthIndex = parseInt(config.month);
    const year = parseInt(config.year);
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    
    const dailyData = [];
    let totalProduction = 0;
    let maxPower = 0;
    
    for (let day = 1; day <= daysInMonth; day++) {
      const production = Math.random() * 40 + 10;
      const power = Math.random() * 1500 + 500;
      const savings = production * 0.25; // $0.25 per kWh
      
      totalProduction += production;
      maxPower = Math.max(maxPower, power);
      
      dailyData.push({
        date: `${year}-${(monthIndex + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
        production: Math.floor(production * 100) / 100,
        savings: Math.floor(savings * 100) / 100
      });
    }

    const bestDay = dailyData.reduce((max, day) => 
      day.production > max.production ? day : max
    );

    return {
      period: `${months[monthIndex]} ${year}`,
      totalProduction: Math.floor(totalProduction * 100) / 100,
      maxPower: Math.floor(maxPower),
      totalSavings: Math.floor(totalProduction * 0.25 * 100) / 100,
      dailyData,
      summary: {
        averageDailyProduction: Math.floor((totalProduction / daysInMonth) * 100) / 100,
        bestDay: {
          date: bestDay.date,
          production: bestDay.production
        },
        totalDays: daysInMonth,
        onlineDays: Math.floor(daysInMonth * 0.95) // 95% uptime
      }
    };
  };

  const handleGenerateReport = async () => {
    setReportStatus({
      status: 'generating',
      progress: 0,
      message: 'Preparing report data...'
    });

    try {
      // Generate mock data
      const data = generateMockReportData();
      setReportData(data);

      // Simulate report generation progress
      const steps = [
        { progress: 20, message: 'Collecting production data...' },
        { progress: 40, message: 'Calculating statistics...' },
        { progress: 60, message: 'Generating charts...' },
        { progress: 80, message: 'Creating PDF document...' },
        { progress: 100, message: 'Report generated successfully!' }
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setReportStatus(prev => ({
          ...prev,
          progress: step.progress,
          message: step.message
        }));
      }

      // Simulate PDF generation
      const reportName = `Solar Report - ${data.period}.pdf`;
      const mockDownloadUrl = `#download-${Date.now()}`;

      setReportStatus({
        status: 'completed',
        progress: 100,
        message: 'Report ready for download!',
        downloadUrl: mockDownloadUrl
      });

      // Add to recent reports
      setRecentReports(prev => [{
        id: Date.now().toString(),
        name: reportName,
        date: new Date().toISOString().split('T')[0],
        size: '2.4 MB',
        status: 'completed'
      }, ...prev.slice(0, 4)]);

    } catch (error) {
      setReportStatus({
        status: 'error',
        progress: 0,
        message: 'Failed to generate report. Please try again.'
      });
    }
  };

  const handleDownloadReport = () => {
    if (reportStatus.downloadUrl) {
      // In a real implementation, this would trigger the actual PDF download
      alert('PDF download would start here. This is a demo implementation.');
    }
  };

  const resetGenerator = () => {
    setReportStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
    setReportData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">PDF Reports Generator</h1>
        <p className="text-muted-foreground">
          Generate comprehensive monthly reports with production data, charts, and savings analysis.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Report Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Report Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Month</Label>
                <Select 
                  value={config.month} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, month: value }))}
                  disabled={reportStatus.status === 'generating'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Year</Label>
                <Select 
                  value={config.year} 
                  onValueChange={(value) => setConfig(prev => ({ ...prev, year: value }))}
                  disabled={reportStatus.status === 'generating'}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label>Report Options</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.includeCharts}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeCharts: e.target.checked }))}
                    disabled={reportStatus.status === 'generating'}
                    className="rounded"
                  />
                  <span className="text-sm">Include charts and graphs</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={config.includeDetails}
                    onChange={(e) => setConfig(prev => ({ ...prev, includeDetails: e.target.checked }))}
                    disabled={reportStatus.status === 'generating'}
                    className="rounded"
                  />
                  <span className="text-sm">Include daily details table</span>
                </label>
              </div>
            </div>

            <Separator />

            <Button 
              onClick={handleGenerateReport}
              disabled={reportStatus.status === 'generating'}
              className="w-full"
            >
              {reportStatus.status === 'generating' ? (
                <>
                  <Clock className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generation Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Generation Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status:</span>
              <Badge variant={
                reportStatus.status === 'completed' ? 'default' :
                reportStatus.status === 'error' ? 'destructive' :
                reportStatus.status === 'generating' ? 'secondary' :
                'outline'
              }>
                {reportStatus.status === 'idle' ? 'Ready' :
                 reportStatus.status === 'generating' ? 'Generating' :
                 reportStatus.status === 'completed' ? 'Completed' :
                 'Error'}
              </Badge>
            </div>

            {reportStatus.status !== 'idle' && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{reportStatus.progress}%</span>
                  </div>
                  <Progress value={reportStatus.progress} className="w-full" />
                </div>

                {reportStatus.message && (
                  <Alert>
                    {reportStatus.status === 'completed' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : reportStatus.status === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4 animate-spin" />
                    )}
                    <AlertDescription>{reportStatus.message}</AlertDescription>
                  </Alert>
                )}

                {reportStatus.status === 'completed' && reportData && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Period:</span>
                        <p className="font-semibold">{reportData.period}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Production:</span>
                        <p className="font-semibold">{reportData.totalProduction} kWh</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Max Power:</span>
                        <p className="font-semibold">{reportData.maxPower} W</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Savings:</span>
                        <p className="font-semibold">${reportData.totalSavings}</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleDownloadReport} className="flex-1">
                        <Download className="w-4 h-4 mr-2" />
                        Download PDF
                      </Button>
                      <Button onClick={resetGenerator} variant="outline">
                        Generate New
                      </Button>
                    </div>
                  </div>
                )}

                {reportStatus.status === 'error' && (
                  <Button onClick={resetGenerator} variant="outline" className="w-full">
                    Try Again
                  </Button>
                )}
              </>
            )}

            {reportStatus.status === 'idle' && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Select a month and year, then click "Generate Report" to create your PDF report.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recent Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentReports.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No Reports Generated</h3>
              <p className="text-muted-foreground">
                Generate your first report to see it listed here.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report Name</TableHead>
                  <TableHead>Date Generated</TableHead>
                  <TableHead>File Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.name}</TableCell>
                    <TableCell>{new Date(report.date).toLocaleDateString()}</TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell>
                      <Badge variant={report.status === 'completed' ? 'default' : 'destructive'}>
                        {report.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => alert('Download would start here')}>
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5" />
              Report Preview - {reportData.period}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Sun className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-800">{reportData.totalProduction}</p>
                  <p className="text-sm text-green-600">Total Production (kWh)</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <Zap className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-blue-800">{reportData.maxPower}</p>
                  <p className="text-sm text-blue-600">Max Power (W)</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <DollarSign className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-800">${reportData.totalSavings}</p>
                  <p className="text-sm text-yellow-600">Total Savings</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-800">{reportData.summary.averageDailyProduction}</p>
                  <p className="text-sm text-purple-600">Avg Daily (kWh)</p>
                </div>
              </div>

              {/* Additional Summary */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Performance Summary</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Best production day: {new Date(reportData.summary.bestDay.date).toLocaleDateString()} ({reportData.summary.bestDay.production} kWh)</li>
                    <li>• System uptime: {Math.floor((reportData.summary.onlineDays / reportData.summary.totalDays) * 100)}% ({reportData.summary.onlineDays}/{reportData.summary.totalDays} days)</li>
                    <li>• Average daily production: {reportData.summary.averageDailyProduction} kWh</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Report Contents</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Monthly production summary</li>
                    <li>• Daily production charts</li>
                    <li>• Power generation trends</li>
                    <li>• Cost savings analysis</li>
                    <li>• System performance metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}