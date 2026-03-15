import { 
  BarChart3, 
  Users, 
  Mail, 
  Send,
  Zap,
  Shield,
  Layout,
  ChevronRight,
  Sparkles
} from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-violet-500/30 selection:text-violet-200">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center font-bold">M</div>
            <span className="text-xl font-bold tracking-tight">MarketMail</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#solutions" className="hover:text-white transition-colors">Solutions</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-400 hover:text-white transition-colors px-4">
              Login
            </Link>
            <Link href="/login" className="bg-white text-black text-sm font-bold px-5 py-2 rounded-full hover:bg-slate-200 transition-all active:scale-95">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full -z-10 opacity-50" />
        <div className="absolute top-[20%] right-0 w-[400px] h-[400px] bg-indigo-600/10 blur-[100px] rounded-full -z-10" />

        <div className="max-w-5xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-bold uppercase tracking-wider mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Sparkles size={14} />
            The Future of Email Marketing
          </div>
          <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-8 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
            Send emails that <br /> get noticed.
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            MarketMail is the enterprise-grade platform for high-impact communication. Build, automate, and track your campaigns with surgeon precision.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            <Link href="/dashboard" className="bg-violet-600 hover:bg-violet-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-2xl shadow-violet-600/30 active:scale-95 group">
              Explore Dashboard
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="glass px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all active:scale-95">
              Book a Demo
            </button>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-20 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Emails Sent', value: '45M+' },
            { label: 'Avg. Open Rate', value: '32%' },
            { label: 'Active Users', value: '12K' },
            { label: 'Deliverability', value: '99.9%' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold mb-4">Precision-engineered features.</h2>
            <p className="text-slate-400">Everything you need to dominate the inbox.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Zap, title: 'Lightning Fast', desc: 'Campaigns launched in seconds, not hours.' },
              { icon: BarChart3, title: 'Real-time Analytics', desc: 'Track opens, clicks, and bounces as they happen.' },
              { icon: Shield, title: 'Enterprise Security', desc: 'Bank-grade encryption for your most sensitive data.' },
              { icon: Layout, title: 'Visual Editor', desc: 'Drag-and-drop your way to beautiful templates.' },
              { icon: Users, title: 'Smart Segments', desc: 'Address the right person at the perfect time.' },
              { icon: Mail, title: 'Deliverability focus', desc: 'We work hard so your emails land where they should.' },
            ].map((feature) => (
              <div key={feature.title} className="glass-card p-8 group hover:border-violet-500/30 transition-all">
                <div className="p-3 w-12 h-12 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400 mb-6 group-hover:bg-violet-600/20 transition-colors">
                  <feature.icon size={24} />
                </div>
                <h3 className="text-lg font-bold mb-3">{feature.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto glass-card p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-violet-600/20 blur-[100px] rounded-full -z-10" />
          <h2 className="text-4xl font-bold mb-6">Ready to transform your communication?</h2>
          <p className="text-slate-400 mb-10 text-lg">Join thousands of companies scaling with MarketMail.</p>
          <Link href="/login" className="bg-white text-black font-bold px-10 py-4 rounded-2xl hover:bg-slate-200 transition-all shadow-xl active:scale-95 inline-block">
            Get Started Now
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2026 MarketMail. All rights reserved.</p>
      </footer>
    </div>
  );
}
