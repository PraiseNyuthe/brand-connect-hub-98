import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound } from "lucide-react";

const schema = z.object({
  code: z.string().trim().min(1, "Verification code is required"),
  email: z.string().trim().email("Valid email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

const Activate = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { code: "", email: "", password: "", confirmPassword: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    // Verify the code exists and is unused
    const { data: codeData, error: codeError } = await supabase
      .from("verification_codes")
      .select("*, brand_applications(*)")
      .eq("code", data.code)
      .eq("used", false)
      .maybeSingle();

    if (codeError || !codeData) {
      setLoading(false);
      toast.error("Invalid or already used verification code.");
      return;
    }

    // Check email matches
    if (codeData.email.toLowerCase() !== data.email.toLowerCase()) {
      setLoading(false);
      toast.error("Email does not match the verification code.");
      return;
    }

    // Create auth account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { emailRedirectTo: window.location.origin },
    });

    if (authError || !authData.user) {
      setLoading(false);
      toast.error(authError?.message || "Failed to create account.");
      return;
    }

    const app = codeData.brand_applications;

    // Create manager record
    const { error: managerError } = await supabase.from("managers").insert({
      user_id: authData.user.id,
      full_name: app.full_name,
      brand_name: app.brand_name,
      year_started: app.year_started,
    });

    if (managerError) {
      setLoading(false);
      toast.error("Failed to activate account.");
      return;
    }

    // Mark code as used
    await supabase.from("verification_codes").update({ used: true }).eq("id", codeData.id);

    setLoading(false);
    toast.success("Account activated! Please check your email to confirm, then sign in.");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4 py-12">
      <Card className="max-w-md w-full bg-card border-brand-blue/20">
        <CardHeader>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <KeyRound className="w-8 h-8 text-brand-blue-light" />
            <CardTitle className="font-display text-2xl">Activate Account</CardTitle>
          </div>
          <CardDescription>Enter your verification code to activate your manager account.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="code" render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl><Input placeholder="Enter your unique code" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Create Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl><Input type="password" placeholder="••••••••" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-light text-primary-foreground" disabled={loading}>
                {loading ? "Activating..." : "Activate Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Activate;
