import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { blink } from '@/blink/client'
import { 
  Sun, 
  Zap, 
  LayoutDashboard, 
  Settings, 
  FileText, 
  Calculator, 
  Database, 
  Download,
  Menu,
  LogOut,
  User
} from 'lucide-react'

interface AppLayoutProps {
  children: React.ReactNode
  currentPage: string
  onNavigate: (page: string) => void
}

const navigation = [
  { name: 'Dashboard', key: 'dashboard', icon: LayoutDashboard },
  { name: 'Inverters', key: 'inverters', icon: Zap },
  { name: 'Data Import', key: 'import', icon: Database },
  { name: 'Data Export', key: 'export', icon: Download },
  { name: 'Cost Calculator', key: 'calculator', icon: Calculator },
  { name: 'Reports', key: 'reports', icon: FileText },
  { name: 'Settings', key: 'settings', icon: Settings },
]

export function AppLayout({ children, currentPage, onNavigate }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  const NavLink = ({ item, mobile = false }: { item: typeof navigation[0], mobile?: boolean }) => {
    const isActive = currentPage === item.key
    const Icon = item.icon
    
    return (
      <button
        onClick={() => {
          onNavigate(item.key)
          if (mobile) setSidebarOpen(false)
        }}
        className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
        }`}
      >
        <Icon className="w-4 h-4 mr-3" />
        {item.name}
      </button>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative mb-4">
            <Sun className="w-12 h-12 text-emerald-600 animate-spin" />
            <Zap className="w-6 h-6 text-blue-600 absolute -bottom-1 -right-1" />
          </div>
          <p className="text-muted-foreground">Loading SolarView Analytics...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="relative mb-6">
            <Sun className="w-16 h-16 text-emerald-600 mx-auto" />
            <Zap className="w-8 h-8 text-blue-600 absolute -bottom-2 -right-2" />
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
            SolarView Analytics
          </h1>
          <p className="text-muted-foreground mb-6">
            Monitor and analyze your solar inverters with real-time data and insights.
          </p>
          <Button onClick={() => blink.auth.login()} size="lg" className="w-full">
            Sign In to Continue
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Sun className="w-8 h-8 text-emerald-600" />
                <Zap className="w-4 h-4 text-blue-600 absolute -bottom-1 -right-1" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  SolarView
                </h1>
                <p className="text-xs text-muted-foreground">Analytics</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <NavLink item={item} />
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-card px-6 pb-4">
            <div className="flex h-16 shrink-0 items-center">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Sun className="w-8 h-8 text-emerald-600" />
                  <Zap className="w-4 h-4 text-blue-600 absolute -bottom-1 -right-1" />
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent">
                    SolarView
                  </h1>
                  <p className="text-xs text-muted-foreground">Analytics</p>
                </div>
              </div>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation.map((item) => (
                      <li key={item.name}>
                        <NavLink item={item} mobile />
                      </li>
                    ))}
                  </ul>
                </li>
              </ul>
            </nav>
          </div>
        </SheetContent>

        {/* Main Content */}
        <div className="lg:pl-72">
          {/* Top Navigation */}
          <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {user.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.email}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        Solar System Owner
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onNavigate('settings')} className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

          {/* Page Content */}
          <main className="py-6">
            <div className="px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </Sheet>
    </div>
  )
}