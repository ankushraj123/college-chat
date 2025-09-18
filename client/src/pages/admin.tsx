import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useLogin, useLogout } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "", collegeCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const { data: user, isLoading: authLoading } = useAuth();
  const login = useLogin();
  const logout = useLogout();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login.mutateAsync(credentials);
      toast({
        title: "Login successful",
        description: "Welcome to the admin panel",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username, password, or college code",
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="max-w-md mx-auto">
            <Card className="glass-card" data-testid="card-admin-login">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-shield-alt text-2xl text-primary"></i>
                </div>
                <CardTitle className="gradient-text text-2xl">Admin Login</CardTitle>
                <p className="text-muted-foreground">Access the moderation panel</p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={credentials.username}
                      onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                      required
                      data-testid="input-username"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={credentials.password}
                        onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                        required
                        data-testid="input-password"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                        onClick={() => setShowPassword(!showPassword)}
                        data-testid="button-toggle-password"
                      >
                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="collegeCode">College Code</Label>
                    <Input
                      id="collegeCode"
                      type="text"
                      value={credentials.collegeCode}
                      onChange={(e) => setCredentials(prev => ({ ...prev, collegeCode: e.target.value }))}
                      required
                      data-testid="input-college-code"
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary/90"
                    disabled={login.isPending}
                    data-testid="button-login"
                  >
                    {login.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Logging in...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt mr-2"></i>
                        Login
                      </>
                    )}
                  </Button>
                </form>
                

              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Role-based dashboard routing
  if (user.role === 'chief') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold gradient-text" data-testid="text-admin-title">
                Chief Admin Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Logged in as <strong>{user.username}</strong> (Chief Admin)
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex justify-end">
              <Button 
                onClick={() => logout.mutate()}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
            <iframe 
              src="/chief-dashboard" 
              className="w-full h-screen border-0 rounded-lg"
              title="Chief Dashboard"
            />
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'college') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold gradient-text" data-testid="text-admin-title">
                College Admin Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Logged in as <strong>{user.username}</strong> (College Admin - {user.collegeId})
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex justify-end">
              <Button 
                onClick={() => logout.mutate()}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
            <iframe 
              src="/college-admin-dashboard" 
              className="w-full h-screen border-0 rounded-lg"
              title="College Admin Dashboard"
            />
          </div>
        </div>
      </div>
    );
  }

  if (user.role === 'normal') {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-8">
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold gradient-text" data-testid="text-admin-title">
                Normal Admin Dashboard
              </h1>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">
                  Logged in as <strong>{user.username}</strong> (Normal Admin)
                </span>
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            <div className="flex justify-end">
              <Button 
                onClick={() => logout.mutate()}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </Button>
            </div>
            <iframe 
              src="/normal-admin-dashboard" 
              className="w-full h-screen border-0 rounded-lg"
              title="Normal Admin Dashboard"
            />
          </div>
        </div>
      </div>
    );
  }

  // Fallback to original AdminPanel for backward compatibility
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold gradient-text" data-testid="text-admin-title">
              Admin Panel
            </h1>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-muted-foreground">
                Logged in as <strong>{user.username}</strong>
              </span>
            </div>
          </div>
        </div>
        
        <AdminPanel />
      </div>
    </div>
  );
}