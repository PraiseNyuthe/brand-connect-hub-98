import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Navigate, Link } from "react-router-dom";
import { ArrowLeft, Check, X, Copy } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import type { Tables } from "@/integrations/supabase/types";

const AdminPanel = () => {
  const { manager, loading } = useAuth();
  const [applications, setApplications] = useState<Tables<"brand_applications">[]>([]);
  const [emailInputs, setEmailInputs] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!manager?.is_admin) return;
    fetchApplications();
  }, [manager]);

  const fetchApplications = async () => {
    const { data } = await supabase
      .from("brand_applications")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setApplications(data);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "BAI-";
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    return code;
  };

  const approveApplication = async (app: Tables<"brand_applications">) => {
    const email = emailInputs[app.id];
    if (!email) {
      toast.error("Please enter the manager's email first.");
      return;
    }

    const code = generateCode();

    // Update status
    await supabase.from("brand_applications").update({ status: "approved" }).eq("id", app.id);

    // Create verification code
    const { error } = await supabase.from("verification_codes").insert({
      application_id: app.id,
      code,
      email,
    });

    if (error) {
      toast.error("Failed to create verification code.");
      return;
    }

    toast.success(`Approved! Verification code: ${code}`);
    navigator.clipboard.writeText(code);
    toast.info("Code copied to clipboard. Share it with the manager.");
    fetchApplications();
  };

  const rejectApplication = async (id: string) => {
    await supabase.from("brand_applications").update({ status: "rejected" }).eq("id", id);
    toast.success("Application rejected.");
    fetchApplications();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center">
        <div className="text-primary-foreground/60">Loading...</div>
      </div>
    );
  }

  if (!manager?.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-brand-navy">
      <header className="border-b border-brand-blue/20 px-6 py-4">
        <div className="container mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-primary-foreground/60 hover:text-primary-foreground">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="font-display text-xl font-bold text-primary-foreground">Admin Panel</h1>
            <p className="text-xs text-primary-foreground/40">Review brand applications</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-4">
          {applications.length === 0 && (
            <p className="text-primary-foreground/40 text-center py-12">No applications yet.</p>
          )}
          {applications.map((app) => (
            <Card key={app.id} className="bg-primary-foreground/5 border-brand-blue/15">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="font-display text-lg text-primary-foreground">{app.brand_name}</CardTitle>
                  <Badge variant={
                    app.status === "approved" ? "default" :
                    app.status === "rejected" ? "destructive" : "secondary"
                  }>
                    {app.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-primary-foreground/70">
                <p><strong>Manager:</strong> {app.full_name}</p>
                <p><strong>Founded:</strong> {app.year_started} by {app.founders}</p>
                <p><strong>Contact:</strong> {app.contact}</p>
                <p><strong>Description:</strong> {app.description}</p>

                {app.status === "pending" && (
                  <div className="flex items-center gap-2 pt-4">
                    <Input
                      placeholder="Manager's email for code"
                      value={emailInputs[app.id] || ""}
                      onChange={(e) => setEmailInputs((p) => ({ ...p, [app.id]: e.target.value }))}
                      className="bg-primary-foreground/5 border-brand-blue/20 text-primary-foreground max-w-xs"
                    />
                    <Button size="sm" onClick={() => approveApplication(app)} className="bg-brand-blue hover:bg-brand-blue-light text-primary-foreground">
                      <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => rejectApplication(app.id)}>
                      <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
