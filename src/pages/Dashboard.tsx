import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, Navigate } from "react-router-dom";
import { MessageSquare, Shield, LogOut, Settings, User, Calendar, Building2 } from "lucide-react";

const Dashboard = () => {
  const { manager, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-primary-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!manager) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-navy">
      {/* Header */}
      <header className="border-b border-brand-blue/20 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="font-display text-2xl font-bold text-primary-foreground tracking-tight">
            Brand<span className="text-brand-blue-light">AI</span>
          </Link>
          <div className="flex items-center gap-3">
            {manager.is_admin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-brand-blue/20">
                  <Settings className="w-4 h-4 mr-1" /> Admin
                </Button>
              </Link>
            )}
            <Button variant="ghost" size="sm" onClick={signOut} className="text-primary-foreground hover:bg-brand-blue/20">
              <LogOut className="w-4 h-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Welcome */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/30 rounded-full px-3 py-1 mb-4">
            <Shield className="w-3.5 h-3.5 text-brand-blue-light" />
            <span className="text-xs text-brand-blue-light font-medium">Verified Manager</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-primary-foreground mb-2">
            Welcome, {manager.full_name}
          </h1>
          <p className="text-primary-foreground/50">Your verified manager dashboard</p>
        </div>

        {/* Profile Card */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-primary-foreground/5 border-brand-blue/15 text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/50 flex items-center gap-2">
                <User className="w-4 h-4" /> Manager
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-display font-semibold">{manager.full_name}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary-foreground/5 border-brand-blue/15 text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/50 flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Brand
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-display font-semibold">{manager.brand_name}</p>
            </CardContent>
          </Card>
          <Card className="bg-primary-foreground/5 border-brand-blue/15 text-primary-foreground">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-primary-foreground/50 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Since
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xl font-display font-semibold">{manager.year_started}</p>
            </CardContent>
          </Card>
        </div>

        {/* Communication Hub Link */}
        <Link to="/hub">
          <Card className="bg-brand-blue/10 border-brand-blue/30 hover:bg-brand-blue/20 transition-colors cursor-pointer">
            <CardContent className="flex items-center gap-4 py-8">
              <div className="w-14 h-14 rounded-xl bg-brand-blue/20 flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-brand-blue-light" />
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-primary-foreground">Communication Hub</h3>
                <p className="text-primary-foreground/50 text-sm">Chat with other verified brand managers</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </main>
    </div>
  );
};

export default Dashboard;
