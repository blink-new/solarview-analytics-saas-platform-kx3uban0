import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  Database,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Globe,
  Save,
  AlertCircle,
  CheckCircle,
  Key,
  Trash2
} from 'lucide-react';
import { blink } from '@/blink/client';

interface UserSettings {
  // Profile
  displayName: string;
  email: string;
  phone: string;
  address: string;
  
  // System Preferences
  electricityPrice: number;
  currency: string;
  timezone: string;
  language: string;
  
  // Notifications
  emailNotifications: boolean;
  smsNotifications: boolean;
  alertThresholds: {
    lowProduction: number;
    highTemperature: number;
    systemOffline: number;
  };
  
  // Privacy & Security
  dataRetention: number;
  shareData: boolean;
  twoFactorAuth: boolean;
}

export function Settings() {
  const [user, setUser] = useState<any>(null);
  const [settings, setSettings] = useState<UserSettings>({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    electricityPrice: 0.25,
    currency: 'USD',
    timezone: 'UTC',
    language: 'en',
    emailNotifications: true,
    smsNotifications: false,
    alertThresholds: {
      lowProduction: 20,
      highTemperature: 70,
      systemOffline: 5
    },
    dataRetention: 365,
    shareData: false,
    twoFactorAuth: false
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  const loadUserSettings = async () => {
    try {
      const userData = await blink.auth.me();
      setUser(userData);
      
      // Load user settings from database
      const userRecord = await blink.db.users.list({
        where: { id: userData.id },
        limit: 1
      });
      
      if (userRecord.length > 0) {
        const record = userRecord[0];
        setSettings(prev => ({
          ...prev,
          displayName: record.displayName || userData.email.split('@')[0],
          email: userData.email,
          electricityPrice: record.electricityPrice || 0.25,
          // Load other settings from database or use defaults
        }));
      } else {
        // Set defaults for new user
        setSettings(prev => ({
          ...prev,
          displayName: userData.email.split('@')[0],
          email: userData.email
        }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserSettings();
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    setSaveStatus({ type: null, message: '' });
    
    try {
      // Update user profile
      await blink.auth.updateMe({
        displayName: settings.displayName
      });
      
      // Update user settings in database
      await blink.db.users.update(user.id, {
        displayName: settings.displayName,
        phone: settings.phone,
        address: settings.address,
        electricityPrice: settings.electricityPrice,
        currency: settings.currency,
        timezone: settings.timezone,
        language: settings.language,
        emailNotifications: settings.emailNotifications,
        smsNotifications: settings.smsNotifications,
        dataRetention: settings.dataRetention,
        shareData: settings.shareData,
        twoFactorAuth: settings.twoFactorAuth
      });
      
      setSaveStatus({
        type: 'success',
        message: 'Settings saved successfully!'
      });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus({ type: null, message: '' });
      }, 3000);
      
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus({
        type: 'error',
        message: 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      try {
        // In a real implementation, this would delete all user data
        alert('Account deletion would be processed here. This is a demo implementation.');
      } catch (error) {
        console.error('Error deleting account:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <SettingsIcon className="w-8 h-8 animate-spin mx-auto mb-2" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings, preferences, and system configuration.
        </p>
      </div>

      {/* Save Status Alert */}
      {saveStatus.type && (
        <Alert className={saveStatus.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {saveStatus.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription>{saveStatus.message}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    {settings.displayName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{settings.displayName}</h3>
                  <p className="text-sm text-muted-foreground">{settings.email}</p>
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={settings.displayName}
                    onChange={(e) => setSettings(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    value={settings.email}
                    disabled
                    className="bg-muted"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="phone"
                    value={settings.phone}
                    onChange={(e) => setSettings(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </Label>
                  <Textarea
                    id="address"
                    value={settings.address}
                    onChange={(e) => setSettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Your address"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                System Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="electricityPrice" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Electricity Price per kWh
                  </Label>
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
                  <Select 
                    value={settings.currency} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="PLN">PLN - Polish Złoty</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone" className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Timezone
                  </Label>
                  <Select 
                    value={settings.timezone} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, timezone: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Berlin">Berlin</SelectItem>
                      <SelectItem value="Europe/Warsaw">Warsaw</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select 
                    value={settings.language} 
                    onValueChange={(value) => setSettings(prev => ({ ...prev, language: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="pl">Polski</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive alerts and reports via email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, emailNotifications: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      SMS Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive critical alerts via SMS
                    </p>
                  </div>
                  <Switch
                    checked={settings.smsNotifications}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, smsNotifications: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Alert Thresholds</h4>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="lowProduction">Low Production Alert (%)</Label>
                    <Input
                      id="lowProduction"
                      type="number"
                      value={settings.alertThresholds.lowProduction}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: {
                          ...prev.alertThresholds,
                          lowProduction: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when production drops below this percentage
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="highTemperature">High Temperature Alert (°C)</Label>
                    <Input
                      id="highTemperature"
                      type="number"
                      value={settings.alertThresholds.highTemperature}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: {
                          ...prev.alertThresholds,
                          highTemperature: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when inverter temperature exceeds this value
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systemOffline">System Offline Alert (min)</Label>
                    <Input
                      id="systemOffline"
                      type="number"
                      value={settings.alertThresholds.systemOffline}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: {
                          ...prev.alertThresholds,
                          systemOffline: parseInt(e.target.value) || 0
                        }
                      }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Alert when system is offline for this duration
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Key className="w-4 h-4" />
                      Two-Factor Authentication
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoFactorAuth}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Share Anonymous Data</Label>
                    <p className="text-sm text-muted-foreground">
                      Help improve SolarView Analytics by sharing anonymous usage data
                    </p>
                  </div>
                  <Switch
                    checked={settings.shareData}
                    onCheckedChange={(checked) => setSettings(prev => ({ ...prev, shareData: checked }))}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Data Retention (days)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    value={settings.dataRetention}
                    onChange={(e) => setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) || 365 }))}
                  />
                  <p className="text-sm text-muted-foreground">
                    How long to keep your historical data (minimum 30 days)
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium text-red-600">Danger Zone</h4>
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Delete Account</p>
                      <p className="text-sm">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={handleDeleteAccount}
                        className="mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={saving} size="lg">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}