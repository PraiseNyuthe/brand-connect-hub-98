import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "@/components/ui/sonner";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";

const schema = z.object({
  full_name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  brand_name: z.string().trim().min(2, "Brand name is required").max(100),
  year_started: z.coerce.number().min(1900, "Invalid year").max(new Date().getFullYear(), "Year cannot be in the future"),
  founders: z.string().trim().min(2, "Founder name(s) required").max(200),
  contact: z.string().trim().min(5, "Valid contact required").max(200),
  description: z.string().trim().min(10, "Please provide a brief description").max(1000),
});

type FormData = z.infer<typeof schema>;

const VerificationForm = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { full_name: "", brand_name: "", year_started: new Date().getFullYear(), founders: "", contact: "", description: "" },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { error } = await supabase.from("brand_applications").insert([{
      full_name: data.full_name,
      brand_name: data.brand_name,
      year_started: data.year_started,
      founders: data.founders,
      contact: data.contact,
      description: data.description,
    }]);
    setLoading(false);

    if (error) {
      toast.error("Failed to submit application. Please try again.");
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4">
        <Card className="max-w-md w-full bg-card border-brand-blue/20">
          <CardContent className="pt-8 text-center">
            <CheckCircle className="w-16 h-16 text-brand-blue-light mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold mb-2">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">
              Your brand verification request has been submitted. The Brand AI founder will review your application and issue a verification code if approved.
            </p>
            <Link to="/">
              <Button className="bg-brand-blue hover:bg-brand-blue-light text-primary-foreground">Back to Home</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-navy flex items-center justify-center px-4 py-12">
      <Card className="max-w-lg w-full bg-card border-brand-blue/20">
        <CardHeader>
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Link>
          <CardTitle className="font-display text-2xl">Brand Verification</CardTitle>
          <CardDescription>Submit your brand details for verification by the Brand AI founder.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="brand_name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Official Brand Name</FormLabel>
                  <FormControl><Input placeholder="Acme Inc." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="year_started" render={({ field }) => (
                <FormItem>
                  <FormLabel>Year Brand Started</FormLabel>
                  <FormControl><Input type="number" placeholder="2020" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="founders" render={({ field }) => (
                <FormItem>
                  <FormLabel>Brand Founder(s)</FormLabel>
                  <FormControl><Input placeholder="Jane Smith, John Doe" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="contact" render={({ field }) => (
                <FormItem>
                  <FormLabel>Official Brand Contact</FormLabel>
                  <FormControl><Input placeholder="contact@brand.com or +1234567890" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Brief Description</FormLabel>
                  <FormControl><Textarea placeholder="Describe your brand..." {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-brand-blue hover:bg-brand-blue-light text-primary-foreground" disabled={loading}>
                {loading ? "Submitting..." : "Submit for Verification"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationForm;
