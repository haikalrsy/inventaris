import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Monitor, ShieldCheck, FileSearch, Wrench } from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-brand-black text-white p-6 overflow-hidden">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center relative z-10"
        >
          <div className="mb-4">
            <span className="text-[10px] font-black tracking-[0.5em] text-brand-lime opacity-50 uppercase">Initialising Kernel</span>
          </div>
          <h1 className="text-6xl font-black mb-2 tracking-[0.2em] text-brand-lime neon-glow">LABSYS</h1>
          <div className="flex gap-1 justify-center mt-4">
             {[1, 2, 3, 4, 5].map(i => (
               <motion.div 
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1, delay: i * 0.1, repeat: Infinity }}
                className="w-1.5 h-6 bg-brand-lime rounded-full" 
               />
             ))}
          </div>
        </motion.div>
        
        {/* Background Grid Dots */}
        <div className="fixed inset-0 pointer-events-none opacity-20" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #BAFF00 1px, transparent 0)', backgroundSize: '40px 40px' }} 
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-black font-sans selection:bg-brand-lime selection:text-black antialiased overflow-x-hidden">
      {/* Hero Section */}
      <header className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
        {/* Animated Background Noise/Grid */}
        <div className="absolute inset-0 opacity-30 pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(186, 255, 0, 0.1) 1px, transparent 0)', backgroundSize: '32px 32px' }} 
        />
        
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/4 -left-20 w-[600px] h-[600px] bg-brand-lime/10 blur-[150px] rounded-full"
        />

        <div className="max-w-6xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-[1px] w-12 bg-white/10" />
              <span className="text-[10px] font-black tracking-[0.4em] uppercase text-brand-lime bg-brand-lime/5 px-4 py-2 border border-brand-lime/20 rounded-full">
                Synthetic Lab OS / v2.0.4
              </span>
              <div className="h-[1px] w-12 bg-white/10" />
            </div>

            <h1 className="text-7xl md:text-[120px] font-black mb-10 leading-[0.8] tracking-tighter text-white">
              MASTER <br />
              <span className="text-brand-lime italic neon-glow text-transparent bg-clip-text bg-gradient-to-r from-brand-lime to-white/50">MATRIX.</span>
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-16 max-w-2xl mx-auto font-medium leading-relaxed tracking-tight group">
              Centralized hardware telemetry and inventory control for specialized laboratory sectors. 
              <span className="text-white hover:text-brand-lime transition-colors"> High-security encryption enabled.</span>
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto bg-brand-lime text-black px-12 py-5 rounded-sm font-black text-xs uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(186,255,0,0.3)] transition-all"
              >
                Access Interface
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/register')}
                className="w-full sm:w-auto bg-transparent border border-white/20 text-white px-12 py-5 rounded-sm font-black text-xs uppercase tracking-[0.3em] hover:bg-white/5 transition-all"
              >
                Register Unit
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Decorative Corner Stats */}
        <div className="absolute bottom-10 left-10 hidden lg:block text-[9px] font-mono font-bold text-slate-600 space-y-1">
          <p>ST_CODE: 200_OK</p>
          <p>LATENCY: 14MS</p>
          <p>MOD: SECURE_SHELL</p>
        </div>

        <motion.div 
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 right-10 hidden lg:flex items-center gap-4"
        >
          <div className="w-48 h-[1px] bg-white/10 relative">
            <motion.div 
              animate={{ x: ["0%", "100%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute top-0 left-0 w-8 h-full bg-brand-lime" 
            />
          </div>
          <span className="text-[9px] font-mono text-slate-400">DATA_STREAM_ACTIVE</span>
        </motion.div>
      </header>

      {/* Feature Grid - Bento Style */}
      <section className="py-24 px-6 border-t border-brand-border bg-brand-dark/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2 md:row-span-2 glass-card p-10 rounded-[2.5rem] flex flex-col justify-end min-h-[400px] group">
              <ShieldCheck className="w-16 h-16 text-brand-lime border border-brand-lime/20 p-4 rounded-2xl mb-8 group-hover:scale-110 transition-transform neon-glow" />
              <h3 className="text-3xl font-black mb-4 tracking-tighter text-white">ENCRYPTED <br />ACCESS CONTROL</h3>
              <p className="text-slate-500 font-medium leading-relaxed">
                Multi-layer authentication and sector-based role permissions for total security of school assets.
              </p>
            </div>
            
            <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-brand-lime/50 transition-all">
              <Monitor className="w-10 h-10 text-brand-lime mb-4 opacity-50 group-hover:opacity-100" />
              <h4 className="text-lg font-black tracking-tight mb-2 uppercase text-white">REALTIME MONITOR</h4>
            </div>

            <div className="glass-card p-8 rounded-[2rem] flex flex-col items-center justify-center text-center group hover:border-brand-lime/50 transition-all">
              <Wrench className="w-10 h-10 text-brand-lime mb-4 opacity-50 group-hover:opacity-100" />
              <h4 className="text-lg font-black tracking-tight mb-2 uppercase text-white">MAINTENANCE HUB</h4>
            </div>

            <div className="md:col-span-2 glass-card p-8 rounded-[2rem] flex items-center gap-8 group">
              <div className="w-20 h-20 bg-brand-lime/10 rounded-2xl flex items-center justify-center border border-brand-lime/20 flex-shrink-0 neon-glow">
                <FileSearch size={32} className="text-brand-lime" />
              </div>
              <div className="text-white">
                <h4 className="text-xl font-black mb-1 uppercase tracking-tighter">GLOBAL SEARCH MATRIX</h4>
                <p className="text-xs text-slate-500 font-medium tracking-tight">Quickly locate any device across all sectors using advanced matrix filtering.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Interface */}
      <footer className="py-20 px-6 border-t border-brand-border bg-brand-black">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <h2 className="text-3xl font-black text-brand-lime flex items-center gap-2 tracking-tighter mb-4">
              <div className="w-2 h-2 bg-brand-lime rounded-full" />
              LABSYS <span className="text-white">OS</span>
            </h2>
            <p className="text-xs font-bold text-slate-600 max-w-sm font-mono uppercase tracking-widest leading-loose">
              Technical infrastructure management kernel for verified educational facilities only.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-20">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">Protocols</h4>
              <ul className="text-xs font-bold text-slate-500 space-y-2 uppercase tracking-wide">
                <li><Link to="/login" className="hover:text-brand-lime transition-colors font-mono">/AUTH_UI</Link></li>
                <li><Link to="/register" className="hover:text-brand-lime transition-colors font-mono">/REGISTER_UNIT</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-white uppercase tracking-[0.4em]">System</h4>
              <ul className="text-xs font-bold text-slate-500 space-y-2 uppercase tracking-wide">
                <li><a href="#" className="hover:text-brand-lime transition-colors font-mono">/DOCS</a></li>
                <li><a href="#" className="hover:text-brand-lime transition-colors font-mono">/LICENSE</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-20 pt-8 border-t border-white/5 flex justify-between items-center text-[10px] font-bold text-slate-700 uppercase tracking-[0.5em]">
          <span>© 2024 LABSYS_OS</span>
          <span className="text-brand-lime animate-pulse">Kernel_Online</span>
        </div>
      </footer>
    </div>
  );
}
