import { useState } from "react";
import { Navigation } from "@/components/navigation";
import { AdminPanel } from "@/components/admin-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, useLogin } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

export default function AdminPage() {
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  
  const { data: user, isLoading: authLoading } = useAuth();
  const login = useLogin();
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
        description: "Invalid username or password",
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
                
                {/* Demo Credentials */}
                <div className="mt-6 p-4 bg-muted/50 rounded-lg" data-testid="card-demo-credentials">
                  <h4 className="font-semibold text-sm mb-2">Demo Credentials:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Username:</strong> admin</p>
                    <p><strong>Password:</strong> secretchat2024</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

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
