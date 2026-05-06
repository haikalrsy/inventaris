import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  Monitor, 
  CheckCircle2, 
  AlertTriangle, 
  FileText, 
  Calendar as CalendarIcon,
  ArrowUpRight,
  Layout,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

function StatCard({ title, value, icon, status }: { title: string, value: number, icon: React.ReactNode, status?: string }) {
  return (
    <motion.div 
      whileHover={{ y: -5, scale: 1.02 }}
      className="glass-card p-6 rounded-2xl group transition-all cursor-default overflow-hidden relative"
    >
      <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
        {icon}
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className="p-2 bg-brand-lime/10 text-brand-lime rounded-lg neon-glow">
          {icon}
        </div>
        {status && (
          <span className="text-[10px] font-mono text-brand-lime bg-brand-lime/5 px-2 py-0.5 rounded border border-brand-lime/20 animate-pulse">
            {status}
          </span>
        )}
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{title}</p>
        <p className="text-3xl font-black text-white group-hover:text-brand-lime transition-colors font-mono">{value}</p>
      </div>
    </motion.div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100
    }
  }
};

export default function Dashboard() {
  const { profile, user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalPCs: 0,
    goodPCs: 0,
    damagedPCs: 0,
    activeReports: 0
  });
  const [labData, setLabData] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();

    // Set up real-time subscriptions
    const pcsSubscription = supabase
      .channel('pcs_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pcs' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    const reportsSubscription = supabase
      .channel('reports_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'damage_reports' }, () => {
        fetchDashboardData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(pcsSubscription);
      supabase.removeChannel(reportsSubscription);
    };
  }, [user, profile]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: pcs } = await supabase
        .from('pcs')
        .select('*');
      
      const total = pcs?.length || 0;
      const good = pcs?.filter(pc => pc.status === 'Baik').length || 0;
      const damaged = pcs?.filter(pc => pc.status === 'Rusak').length || 0;

      // Group by lab
      const labs = ['RPL', 'DKV', 'MP'];
      const calculatedLabData = labs.map(labName => {
        const labPCs = pcs?.filter(pc => pc.lab === labName) || [];
        const labTotal = labPCs.length;
        const labGood = labPCs.filter(pc => pc.status === 'Baik').length;
        const percentage = labTotal > 0 ? (labGood / labTotal) * 100 : 0;
        
        let status = 'STABLE';
        if (percentage < 50) status = 'CRITICAL';
        else if (percentage < 90) status = 'MAINTENANCE';
        else if (labTotal > 0) status = 'ONLINE';

        return {
          name: labName,
          total: labTotal,
          good: labGood,
          percentage,
          status
        };
      });

      setLabData(calculatedLabData);

      const { data: reports } = await supabase
        .from('damage_reports')
        .select('*');
      
      const active = reports?.filter(r => r.status !== 'Selesai').length || 0;

      setStats({
        totalPCs: total,
        goodPCs: good,
        damagedPCs: damaged,
        activeReports: active
      });

      const { data: recent } = await supabase
        .from('damage_reports')
        .select(`
          *,
          pcs (pc_name, lab)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      setRecentReports(recent || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const labStats = [
    { name: 'RPL', total: 40, good: 38 },
    { name: 'DKV', total: 35, good: 30 },
    { name: 'MP', total: 30, good: 29 },
  ];

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse p-4">
        <div className="h-20 bg-brand-card rounded-2xl border border-brand-border" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-brand-card rounded-2xl border border-brand-border" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-8 pb-10"
    >
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            OVERVIEW <span className="text-brand-lime">/ CORE</span>
          </h1>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-brand-lime rounded-full" />
              User: {profile?.full_name}
            </span>
            <span className="text-slate-800">|</span>
            <span className="flex items-center gap-2">
              {format(new Date(), 'dd.MM.yyyy')}
            </span>
          </div>
        </div>
        
        <div className="hidden md:flex flex-col items-end">
          <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] mb-1 text-right w-full">SYSTEM STATUS</p>
          <div className="px-4 py-1.5 bg-brand-lime/10 border border-brand-lime/30 rounded-full flex items-center gap-3">
            <div className="flex gap-1">
              {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-3 bg-brand-lime rounded-full opacity-50" />)}
              <div className="w-1.5 h-3 bg-brand-lime rounded-full animate-bounce" />
            </div>
            <span className="text-[9px] font-mono text-brand-lime font-bold">ALL MODULES ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Inventory" value={stats.totalPCs} icon={<Monitor size={20} />} status="DATABASE" />
        <StatCard title="Operational" value={stats.goodPCs} icon={<CheckCircle2 size={20} />} status="STABLE" />
        <StatCard title="Critical Units" value={stats.damagedPCs} icon={<AlertTriangle size={20} />} status="WARNING" />
        <StatCard title="Active Logs" value={stats.activeReports} icon={<FileText size={20} />} status="LIVE" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Lab Grid */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Sector Distribution</h3>
            <Link to="/app/inventory" className="text-brand-lime text-[10px] font-black uppercase tracking-widest hover:underline">
              Access Inventory Matrix &rarr;
            </Link>
          </div>
          
          <div className="grid sm:grid-cols-3 gap-6">
            {labData.map((lab, i) => (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="glass-card p-6 rounded-2xl space-y-4 group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 bg-brand-dark rounded-lg flex items-center justify-center border border-brand-border text-slate-500 group-hover:text-brand-lime group-hover:border-brand-lime/30 transition-all">
                    <Monitor size={14} />
                  </div>
                  <span className={cn(
                    "text-[8px] font-black px-2 py-0.5 rounded border",
                    lab.status === 'ONLINE' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                    lab.status === 'MAINTENANCE' ? "bg-orange-500/10 text-orange-500 border-orange-500/20" :
                    lab.status === 'CRITICAL' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                    "bg-brand-lime/10 text-brand-lime border-brand-lime/20"
                  )}>
                    {lab.status}
                  </span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lab {lab.name}</p>
                  <p className="text-2xl font-black text-white font-mono">{Math.round(lab.percentage)}%</p>
                </div>
                <div className="w-full h-1 bg-brand-dark rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${lab.percentage}%` }}
                    className="h-full bg-brand-lime"
                  />
                </div>
              </motion.div>
            ))}
          </div>

          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Recent Telemetry Logs</h3>
            <div className="glass-card rounded-2xl overflow-hidden divide-y divide-brand-border">
              {recentReports.length > 0 ? (
                recentReports.map((report, i) => (
                  <div key={i} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-brand-dark rounded-xl flex items-center justify-center border border-brand-border text-slate-500 group-hover:text-brand-lime transition-colors">
                        <Monitor size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white tracking-tight">{report.pcs?.pc_name} <span className="text-slate-500">/</span> {report.pcs?.lab}</p>
                        <p className="text-[10px] text-slate-500 font-medium truncate max-w-[200px] sm:max-w-md">{report.description}</p>
                      </div>
                    </div>
                    <div className={cn(
                      "px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest border transition-all",
                      report.status === 'Selesai' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                      report.status === 'Diproses' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                      "bg-red-500/10 text-red-500 border-red-500/20"
                    )}>
                      {report.status}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-12 text-center text-slate-500 text-xs font-bold uppercase tracking-widest italic">
                  NO DATA FOUND IN BUFFER
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-8">
          <div className="space-y-6">
            <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Direct Command</h3>
            <div className="glass-card p-6 rounded-2xl space-y-6 group">
              <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 shadow-lg shadow-red-500/5 group-hover:scale-110 transition-transform">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-2">
                <h4 className="text-lg font-black text-white tracking-tight">Report Anomaly</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Initialize maintenance protocol for hardware failure. Alert tech support immediately.
                </p>
              </div>
              <Link 
                to="/app/reports" 
                className="block w-full py-4 glass-card border-brand-lime/20 text-brand-lime text-center rounded-xl font-black text-xs uppercase tracking-[0.2em] relative overflow-hidden group/btn"
              >
                <div className="absolute inset-0 bg-brand-lime/5 translate-y-full group-hover/btn:translate-y-0 transition-transform" />
                <span className="relative z-10">Execute Report &rarr;</span>
              </Link>
            </div>

            <div className="bg-brand-lime p-6 rounded-2xl text-black relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
                <ShieldCheck size={80} />
              </div>
              <h4 className="text-lg font-black tracking-tighter mb-2">SECURITY PROTOCOL</h4>
              <p className="text-xs font-bold text-black/60 leading-tight mb-6">
                ALL PERSONNEL MUST SHUTDOWN TERMINALS AND CLEAR WORKSPACE AFTER SESSION COMPLETION.
              </p>
              <div className="bg-black/10 rounded-xl p-3 flex items-center justify-center border border-black/10">
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">Mandatory Directive</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
