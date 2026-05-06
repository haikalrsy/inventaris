import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { motion } from 'motion/react';
import { 
  BarChart as ReBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  Layout, 
  Monitor, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  BarChart2, 
  Activity,
  History,
  PieChart as PieIcon
} from 'lucide-react';

const COLORS = ['#BAFF00', '#FF4444', '#4488FF', '#FFBB28'];

export default function Analytics() {
  const [stats, setStats] = useState({
    totalPcs: 0,
    goodPcs: 0,
    brokenPcs: 0,
    totalReports: 0,
    resolvedReports: 0,
    activeReports: 0
  });

  const [labStats, setLabStats] = useState<any[]>([]);
  const [timelineData, setTimelineData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      // Fetch PCs with error handling
      const { data: pcs, error: pcError } = await supabase.from('pcs').select('*');
      if (pcError) throw pcError;
      
      const totalPcs = pcs?.length || 0;
      const goodPcs = pcs?.filter(pc => pc.status === 'Baik').length || 0;
      const brokenPcs = totalPcs - goodPcs;

      // Fetch Reports with error handling
      const { data: reports, error: reportsError } = await supabase.from('damage_reports').select('*');
      if (reportsError) throw reportsError;
      
      const totalReports = reports?.length || 0;
      const resolvedReports = reports?.filter(r => r.status === 'Selesai').length || 0;
      const activeReports = totalReports - resolvedReports;

      setStats({
        totalPcs,
        goodPcs,
        brokenPcs,
        totalReports,
        resolvedReports,
        activeReports
      });

      // Lab Stats
      const labs = ['RPL', 'DKV', 'MP'];
      const calculatedLabStats = labs.map(lab => {
        const labPcs = pcs?.filter(p => p.lab === lab) || [];
        const broken = labPcs.filter(p => p.status === 'Rusak' || p.status === 'Critical').length;
        return {
          name: lab,
          total: labPcs.length,
          good: labPcs.length - broken,
          broken: broken
        };
      });
      setLabStats(calculatedLabStats);

      // Timeline (simplified)
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().split('T')[0];
      });

      const timeline = last7Days.map(date => {
        const count = reports?.filter(r => r.created_at?.includes(date)).length || 0;
        return {
          date: date.split('-').slice(1).join('/'),
          reports: count
        };
      });
      setTimelineData(timeline);

    } catch (error: any) {
      console.error('Error fetching analytics:', error);
      // Ensure we don't stay in a loading state if error occurs
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-brand-black rounded-3xl border border-brand-border/30">
        <div className="w-12 h-12 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Downloading Intelligence Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
          System <span className="text-brand-lime">Intelligence</span>
        </h1>
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Data Telemetry & Hardware flux Analysis</p>
      </div>

      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Health Index" 
          value={`${stats.totalPcs > 0 ? Math.round((stats.goodPcs / stats.totalPcs) * 100) : 0}%`} 
          icon={<Activity className="text-brand-lime" />}
          trend="OPTIMAL"
        />
        <StatCard 
          label="Broken Units" 
          value={stats.brokenPcs} 
          icon={<AlertTriangle className="text-red-500" />}
          trend="SYSTEM_FAIL"
          subValue="Requires Attention"
        />
        <StatCard 
          label="Anomalies Tracked" 
          value={stats.totalReports} 
          icon={<History className="text-blue-500" />}
          trend="DATA_LOG"
        />
        <StatCard 
          label="Active Tasks" 
          value={stats.activeReports} 
          icon={<Clock className="text-orange-400" />}
          trend="PENDING"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lab Distribution */}
        <div className="glass-card p-8 rounded-3xl border-brand-border/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
               <Layout size={14} className="text-brand-lime" />
               Sector Distribution
             </h3>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={labStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight="bold" 
                  tickLine={false} 
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  cursor={{ fill: 'rgba(186, 255, 0, 0.05)' }}
                />
                <Bar dataKey="good" fill="#BAFF00" radius={[4, 4, 0, 0]} stackId="a" />
                <Bar dataKey="broken" fill="#FF4444" radius={[4, 4, 0, 0]} stackId="a" />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="glass-card p-8 rounded-3xl border-brand-border/50">
          <div className="flex items-center justify-between mb-8">
             <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
               <PieIcon size={14} className="text-brand-lime" />
               Unit Status Matrix
             </h3>
          </div>
          <div className="h-[300px] w-full flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={[
                    { name: 'Stable', value: stats.goodPcs },
                    { name: 'Critical', value: stats.brokenPcs }
                  ]}
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill="#BAFF00" stroke="transparent" />
                  <Cell fill="#FF4444" stroke="transparent" />
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#050505', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
              </RePieChart>
            </ResponsiveContainer>
            <div className="flex flex-col gap-4 pr-10">
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-brand-lime rounded-full" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Stable Units</span>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-3 h-3 bg-red-500 rounded-full" />
                 <span className="text-[10px] font-black text-white uppercase tracking-widest">Critical Errors</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      {/* Incident Timeline */}
      <div className="glass-card p-8 rounded-3xl border-brand-border/50">
        <div className="flex items-center justify-between mb-8">
           <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
             <History size={14} className="text-brand-lime" />
             Incident Flux (Last 7 Days)
           </h3>
        </div>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BAFF00" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#BAFF00" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#475569" 
                fontSize={10} 
                fontWeight="bold" 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#475569" 
                fontSize={10} 
                fontWeight="bold" 
                tickLine={false} 
                axisLine={false}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#050505', border: '1px solid #1A1A1A', borderRadius: '12px' }}
                itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="#BAFF00" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorReports)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, trend, subValue }: { label: string, value: string | number, icon: any, trend: string, subValue?: string }) {
  return (
    <div className="glass-card p-6 rounded-2xl border-brand-border/50 flex flex-col justify-between group overflow-hidden relative">
      <div className="absolute -right-4 -top-4 w-20 h-20 bg-brand-lime opacity-[0.02] rounded-full blur-2xl group-hover:opacity-10 transition-opacity" />
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-brand-dark border border-brand-border rounded-xl">
          {icon}
        </div>
        <span className="text-[8px] font-black bg-brand-lime/10 text-brand-lime px-2 py-0.5 rounded border border-brand-lime/20 uppercase tracking-widest ">
          {trend}
        </span>
      </div>
      <div>
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-white font-mono tracking-tighter">{value}</p>
        {subValue && <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">{subValue}</p>}
      </div>
    </div>
  );
}
