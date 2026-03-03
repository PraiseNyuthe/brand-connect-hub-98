import { Button } from "@/components/ui/button";
import { Shield, Users, MessageSquare, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-brand-navy flex flex-col">
      {/* Header */}
      <header className="border-b border-brand-blue/20 px-6 py-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-primary-foreground tracking-tight">
            Brand<span className="text-brand-blue-light">AI</span>
          </h1>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" className="text-primary-foreground hover:bg-brand-blue/20">
                Sign In
              </Button>
            </Link>
            <Link to="/verify">
              <Button className="bg-brand-blue hover:bg-brand-blue-light text-primary-foreground">
                Get Verified
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center">
        <div className="container mx-auto px-6 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-brand-blue/10 border border-brand-blue/30 rounded-full px-4 py-1.5 mb-8">
              <Shield className="w-4 h-4 text-brand-blue-light" />
              <span className="text-sm text-brand-blue-light font-medium">Verified Managers Only</span>
            </div>
            <h2 className="font-display text-5xl md:text-6xl font-bold text-primary-foreground leading-tight mb-6">
              The Trusted Hub for
              <br />
              <span className="text-brand-blue-light">Brand Managers</span>
            </h2>
            <p className="text-lg text-primary-foreground/60 mb-10 max-w-xl mx-auto">
              A private, secure communication platform exclusively for verified brand managers. 
              Connect, collaborate, and grow with confidence.
            </p>
            <div className="flex gap-4 justify-center">
              <Link to="/verify">
                <Button size="lg" className="bg-brand-blue hover:bg-brand-blue-light text-primary-foreground font-display font-semibold px-8">
                  Apply for Verification
                </Button>
              </Link>
              <Link to="/activate">
                <Button size="lg" variant="outline" className="border-brand-blue/40 text-primary-foreground hover:bg-brand-blue/10 font-display">
                  Activate Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-6 mt-24 max-w-4xl mx-auto">
            {[
              { icon: CheckCircle, title: "Brand Verification", desc: "Every manager is verified by Brand AI's founder before access is granted." },
              { icon: Shield, title: "Secure Access", desc: "Unique verification codes ensure only legitimate managers can join." },
              { icon: MessageSquare, title: "Private Communication", desc: "Discuss strategies and collaborate in a trusted, managers-only space." },
            ].map((f, i) => (
              <div key={i} className="bg-primary-foreground/5 border border-brand-blue/15 rounded-xl p-6 text-center">
                <f.icon className="w-8 h-8 text-brand-blue-light mx-auto mb-4" />
                <h3 className="font-display font-semibold text-primary-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-primary-foreground/50">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-brand-blue/20 px-6 py-6">
        <div className="container mx-auto text-center text-sm text-primary-foreground/40">
          © {new Date().getFullYear()} Brand AI. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Index;
