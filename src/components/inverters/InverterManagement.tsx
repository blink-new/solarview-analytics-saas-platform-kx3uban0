import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  Zap, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  Activity,
  AlertCircle,
  CheckCircle,
  Search,
  Filter,
  MoreHorizontal,
  Power,
  Wifi,
  WifiOff
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { blink } from '@/blink/client';
import { Inverter } from '@/types';

interface InverterFormData {
  name: string;
  serialNumber: string;
  ahoyDtuUrl: string;
  model: string;
  maxPower: number;
}

export function InverterManagement() {
  const [inverters, setInverters] = useState<Inverter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingInverter, setEditingInverter] = useState<Inverter | null>(null);
  const [formData, setFormData] = useState<InverterFormData>({
    name: '',
    serialNumber: '',
    ahoyDtuUrl: '',
    model: '',
    maxPower: 800
  });
  const [saving, setSaving] = useState(false);

  const loadInverters = async () => {
    try {
      const user = await blink.auth.me();
      const invertersData = await blink.db.inverters.list({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' }
      });
      
      // Add mock status and current data
      const invertersWithStatus = invertersData.map(inverter => ({
        ...inverter,
        status: Math.random() > 0.2 ? 'online' : 'offline' as 'online' | 'offline',
        currentPower: Math.random() > 0.2 ? Math.floor(Math.random() * 1500) + 200 : 0,
        yieldToday: Math.random() > 0.2 ? Math.floor(Math.random() * 15) + 5 : 0,
        lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        temperature: Math.random() > 0.2 ? Math.floor(Math.random() * 20) + 45 : null
      }));
      
      setInverters(invertersWithStatus as any);
    } catch (error) {
      console.error('Error loading inverters:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      serialNumber: '',
      ahoyDtuUrl: '',
      model: '',
      maxPower: 800
    });
  };

  const testInverterConnection = async (inverterId: string, url: string) => {
    try {
      // Mock connection test - in real implementation, this would call AhoyDTU API
      console.log(`Testing connection to ${url}`);
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update inverter status
      setInverters(prev => prev.map(inv => 
        inv.id === inverterId 
          ? { ...inv, status: 'online' as 'online' | 'offline' }
          : inv
      ));
      
    } catch (error) {
      console.error('Connection test failed:', error);
    }
  };

  useEffect(() => {
    loadInverters();
  }, []);

  const handleAddInverter = async () => {
    setSaving(true);
    try {
      const user = await blink.auth.me();
      
      const newInverter = await blink.db.inverters.create({
        userId: user.id,
        name: formData.name,
        serialNumber: formData.serialNumber,
        ahoyDtuUrl: formData.ahoyDtuUrl,
        model: formData.model,
        maxPower: formData.maxPower,
        status: 'offline'
      });

      setInverters(prev => [newInverter as any, ...prev]);
      setShowAddDialog(false);
      resetForm();
      
      // Test connection to AhoyDTU
      if (formData.ahoyDtuUrl) {
        testInverterConnection(newInverter.id, formData.ahoyDtuUrl);
      }
      
    } catch (error) {
      console.error('Error adding inverter:', error);
      alert('Failed to add inverter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleEditInverter = async () => {
    if (!editingInverter) return;
    
    setSaving(true);
    try {
      await blink.db.inverters.update(editingInverter.id, {
        name: formData.name,
        serialNumber: formData.serialNumber,
        ahoyDtuUrl: formData.ahoyDtuUrl,
        model: formData.model,
        maxPower: formData.maxPower
      });

      setInverters(prev => prev.map(inv => 
        inv.id === editingInverter.id 
          ? { ...inv, ...formData }
          : inv
      ));
      
      setEditingInverter(null);
      resetForm();
      
    } catch (error) {
      console.error('Error updating inverter:', error);
      alert('Failed to update inverter. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInverter = async (inverterId: string) => {
    if (!window.confirm('Are you sure you want to delete this inverter? This will also delete all associated data.')) {
      return;
    }

    try {
      await blink.db.inverters.delete(inverterId);
      setInverters(prev => prev.filter(inv => inv.id !== inverterId));
    } catch (error) {
      console.error('Error deleting inverter:', error);
      alert('Failed to delete inverter. Please try again.');
    }
  };



  const openEditDialog = (inverter: Inverter) => {
    setEditingInverter(inverter);
    setFormData({
      name: inverter.name,
      serialNumber: inverter.serialNumber || '',
      ahoyDtuUrl: inverter.ahoyDtuUrl || '',
      model: (inverter as any).model || '',
      maxPower: (inverter as any).maxPower || 800
    });
  };

  const filteredInverters = inverters.filter(inverter => {
    const matchesSearch = inverter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (inverter.serialNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inverter.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = inverters.filter(inv => inv.status === 'online').length;
  const totalPower = inverters
    .filter(inv => inv.status === 'online')
    .reduce((sum, inv) => sum + ((inv as any).currentPower || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">Inverter Management</h1>
          <p className="text-muted-foreground">
            Manage your solar inverters, monitor their status, and configure AhoyDTU connections.
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Inverter
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Inverter</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Inverter Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g. Roof East"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="serialNumber">Serial Number</Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    placeholder="e.g. HMS-800-001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ahoyDtuUrl">AhoyDTU URL *</Label>
                <Input
                  id="ahoyDtuUrl"
                  value={formData.ahoyDtuUrl}
                  onChange={(e) => setFormData(prev => ({ ...prev, ahoyDtuUrl: e.target.value }))}
                  placeholder="http://192.168.1.100"
                />
                <p className="text-xs text-muted-foreground">
                  The IP address or hostname of your AhoyDTU device
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g. HMS-800W-2T"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxPower">Max Power (W)</Label>
                  <Input
                    id="maxPower"
                    type="number"
                    value={formData.maxPower}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxPower: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleAddInverter} disabled={saving || !formData.name || !formData.ahoyDtuUrl}>
                  {saving ? 'Adding...' : 'Add Inverter'}
                </Button>
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Inverters</p>
                <p className="text-2xl font-bold">{inverters.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wifi className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Online</p>
                <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <WifiOff className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Offline</p>
                <p className="text-2xl font-bold text-red-600">{inverters.length - onlineCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Power className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Power</p>
                <p className="text-2xl font-bold text-yellow-600">{totalPower}W</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search inverters..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('all')}
              >
                All
              </Button>
              <Button
                variant={statusFilter === 'online' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('online')}
              >
                Online
              </Button>
              <Button
                variant={statusFilter === 'offline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter('offline')}
              >
                Offline
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inverters Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Inverters ({filteredInverters.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredInverters.length === 0 ? (
            <div className="text-center py-8">
              <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">
                {inverters.length === 0 ? 'No Inverters Found' : 'No Matching Inverters'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {inverters.length === 0 
                  ? 'Add your first inverter to start monitoring your solar production.'
                  : 'Try adjusting your search or filter criteria.'
                }
              </p>
              {inverters.length === 0 && (
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Inverter
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Current Power</TableHead>
                  <TableHead>Today's Yield</TableHead>
                  <TableHead>Temperature</TableHead>
                  <TableHead>Last Seen</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInverters.map((inverter: any) => (
                  <TableRow key={inverter.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{inverter.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {inverter.serialNumber || 'No serial'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={inverter.status === 'online' ? 'default' : 'secondary'}
                        className={inverter.status === 'online' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {inverter.status === 'online' ? (
                          <Wifi className="w-3 h-3 mr-1" />
                        ) : (
                          <WifiOff className="w-3 h-3 mr-1" />
                        )}
                        {inverter.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {inverter.status === 'online' ? `${inverter.currentPower}W` : '-'}
                    </TableCell>
                    <TableCell>
                      {inverter.status === 'online' ? `${inverter.yieldToday}kWh` : '-'}
                    </TableCell>
                    <TableCell>
                      {inverter.temperature ? `${inverter.temperature}°C` : '-'}
                    </TableCell>
                    <TableCell>
                      {inverter.lastSeen ? new Date(inverter.lastSeen).toLocaleString() : '-'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(inverter)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => testInverterConnection(inverter.id, inverter.ahoyDtuUrl)}>
                            <Settings className="w-4 h-4 mr-2" />
                            Test Connection
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteInverter(inverter.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingInverter} onOpenChange={() => setEditingInverter(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Inverter</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Inverter Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-serialNumber">Serial Number</Label>
                <Input
                  id="edit-serialNumber"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-ahoyDtuUrl">AhoyDTU URL *</Label>
              <Input
                id="edit-ahoyDtuUrl"
                value={formData.ahoyDtuUrl}
                onChange={(e) => setFormData(prev => ({ ...prev, ahoyDtuUrl: e.target.value }))}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-model">Model</Label>
                <Input
                  id="edit-model"
                  value={formData.model}
                  onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-maxPower">Max Power (W)</Label>
                <Input
                  id="edit-maxPower"
                  type="number"
                  value={formData.maxPower}
                  onChange={(e) => setFormData(prev => ({ ...prev, maxPower: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleEditInverter} disabled={saving || !formData.name || !formData.ahoyDtuUrl}>
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant="outline" onClick={() => setEditingInverter(null)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}