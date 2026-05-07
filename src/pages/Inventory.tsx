import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { LABS, PCDevice, LabType, PCStatus } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Monitor, 
  Filter,
  X,
  Check,
  AlertTriangle,
  Layout,
  FileText
} from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function Inventory() {
  const { isAdmin } = useAuth();
  const [pcs, setPcs] = useState<PCDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [labFilter, setLabFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentPc, setCurrentPc] = useState<PCDevice | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    pc_name: '',
    lab: 'RPL' as LabType,
    status: 'Baik' as PCStatus,
    specs: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pcs')
        .select('*')
        .order('pc_name');

      if (error) throw error;
      setPcs(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized: Only admins can modify inventory.");
      return;
    }
    setLoading(true);
    try {
      if (currentPc) {
        const { error } = await supabase
          .from('pcs')
          .update(formData)
          .eq('id', currentPc.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('pcs')
          .insert([formData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchInventory();
      resetForm();
    } catch (error: any) {
      if (error.message.includes('row-level security')) {
        alert('Gagal menyimpan: Izin ditolak oleh Database (RLS).\n\nSistem mengidentifikasi Anda sebagai Admin, tetapi Database Supabase masih memblokir aksi ini. Silakan hubungi pengembang untuk memperbaiki policy RLS di tabel "pcs".');
      } else {
        alert('Error: ' + error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePc = async () => {
    if (!currentPc) return;
    if (!isAdmin) {
      alert("Unauthorized: Only admins can delete inventory.");
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('pcs')
        .delete()
        .eq('id', currentPc.id);
      if (error) throw error;
      
      setIsDeleteModalOpen(false);
      fetchInventory();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      pc_name: '',
      lab: 'RPL',
      status: 'Baik',
      specs: ''
    });
    setCurrentPc(null);
  };

  const openEditModal = (pc: PCDevice) => {
    setCurrentPc(pc);
    setFormData({
      pc_name: pc.pc_name,
      lab: pc.lab,
      status: pc.status,
      specs: pc.specs || ''
    });
    setIsModalOpen(true);
  };

  const filteredPcs = pcs.filter(pc => {
    const matchesSearch = pc.pc_name.toLowerCase().includes(search.toLowerCase()) || 
                          pc.specs?.toLowerCase().includes(search.toLowerCase());
    const matchesLab = labFilter === 'all' || pc.lab === labFilter;
    return matchesSearch && matchesLab;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter">
            INVENTORY <span className="text-brand-lime">/ MATRIX</span>
          </h1>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Hardware Telemetry & Asset Management</p>
        </div>
        {isAdmin && (
          <div className="flex gap-4 print:hidden">
            <button 
              onClick={() => { resetForm(); setIsModalOpen(true); }}
              className="bg-brand-lime text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(186,255,0,0.2)] hover:scale-105 active:scale-95 transition-all"
            >
              Add Unit [+]
            </button>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 border-brand-border/50 print:hidden">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-lime opacity-50" />
          <input 
            type="text"
            placeholder="SCAN CORE_NAME OR SPECS_DATA..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all text-[10px] font-mono font-bold text-white placeholder:text-slate-700"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-lime opacity-50" />
            <select 
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="pl-10 pr-10 py-3 bg-brand-dark/50 border border-brand-border rounded-xl focus:outline-none appearance-none font-black text-slate-400 text-[10px] uppercase tracking-widest cursor-pointer hover:border-brand-lime/30 transition-colors"
            >
              <option value="all">ALL_SECTORS</option>
              {LABS.map(lab => <option key={lab} value={lab}>SECTOR_{lab}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* PC Grid */}
      <motion.div 
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: {
              staggerChildren: 0.03
            }
          }
        }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredPcs.map((pc) => (
          <motion.div 
            layout
            key={pc.id}
            variants={{
              hidden: { y: 10, opacity: 0 },
              show: { y: 0, opacity: 1 }
            }}
            whileHover={{ y: -5 }}
            className="glass-card p-6 rounded-2xl group transition-all relative overflow-hidden flex flex-col justify-between min-h-[220px]"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
               <Monitor size={80} />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center border transition-all",
                  pc.status === 'Baik' 
                    ? "bg-brand-lime/5 text-brand-lime border-brand-lime/20 neon-glow" 
                    : "bg-red-500/5 text-red-500 border-red-500/20"
                )}>
                  <Monitor size={18} />
                </div>
                {isAdmin && (
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 print:hidden">
                    <button 
                      onClick={() => openEditModal(pc)}
                      className="p-2 text-slate-500 hover:text-brand-lime hover:bg-brand-lime/10 rounded-lg transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => { setCurrentPc(pc); setIsDeleteModalOpen(true); }}
                      className="p-2 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <h3 className="text-xl font-black text-white tracking-tight">{pc.pc_name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-brand-lime/50 uppercase tracking-widest">SECTOR_{pc.lab}</span>
                  <div className="w-1 h-1 bg-slate-800 rounded-full" />
                  <span className="text-[9px] font-mono font-bold text-slate-600">ID: {pc.id.substring(0, 8)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-brand-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-1.5 h-1.5 rounded-full animate-pulse",
                    pc.status === 'Baik' ? "bg-brand-lime shadow-[0_0_8px_#BAFF00]" : "bg-red-500 shadow-[0_0_8px_#ef4444]"
                  )} />
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.2em]",
                    pc.status === 'Baik' ? "text-brand-lime" : "text-red-500"
                  )}>
                    {pc.status === 'Baik' ? 'SYSTEM_STABLE' : 'CRITICAL_ERROR'}
                  </span>
                </div>
                <span className="text-[9px] font-mono font-bold text-slate-500 truncate max-w-[100px]">
                  {pc.specs || 'NO_META_DATA'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {filteredPcs.length === 0 && !loading && (
        <div className="p-20 text-center glass-card rounded-[3rem] border-dashed border-brand-border">
          <div className="w-16 h-16 bg-brand-dark rounded-full flex items-center justify-center mx-auto mb-6 border border-brand-border">
            <Monitor size={24} className="text-slate-700" />
          </div>
          <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">No Units Detected</h3>
          <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">No matching identification found in current matrix.</p>
        </div>
      )}

      {/* Modal Add/Edit */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-brand-dark w-full max-w-lg rounded-3xl border border-brand-border shadow-2xl shadow-brand-lime/5 overflow-hidden"
            >
              <div className="bg-brand-lime p-8 text-black flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tighter">{currentPc ? 'Update Protocol' : 'New Unit Entry'}</h3>
                  <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Master Hardware Matrix</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSavePc} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Hardware Identifier</label>
                  <input 
                    required
                    type="text"
                    value={formData.pc_name}
                    onChange={(e) => setFormData({...formData, pc_name: e.target.value})}
                    className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all font-bold text-white placeholder:text-slate-700 text-sm"
                    placeholder="e.g. PC-LAB-01"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Sector Path</label>
                    <select 
                      value={formData.lab}
                      onChange={(e) => setFormData({...formData, lab: e.target.value as LabType})}
                      className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all appearance-none font-bold text-slate-400 text-sm uppercase tracking-widest"
                    >
                      {LABS.map(lab => <option key={lab} value={lab}>SECTOR_{lab}</option>)}
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Initial Status</label>
                    <select 
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as PCStatus})}
                      className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all appearance-none font-bold text-slate-400 text-sm uppercase tracking-widest"
                    >
                      <option value="Baik">STABLE</option>
                      <option value="Rusak">CRITICAL</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Technical Meta_Data</label>
                  <textarea 
                    value={formData.specs}
                    onChange={(e) => setFormData({...formData, specs: e.target.value})}
                    className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all font-mono text-white placeholder:text-slate-800 text-sm min-h-[100px]"
                    placeholder="CORE_DATA: RAM_16GB, SSD_512GB, RTX_ENTRY..."
                  />
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-brand-black border border-brand-border text-slate-500 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all"
                  >
                    Abort
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 bg-brand-lime text-black rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(186,255,0,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {loading ? 'EXECUTING...' : 'SAVE_DATA'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-brand-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-brand-dark w-full max-w-md rounded-3xl border border-brand-border shadow-2xl p-10 text-center"
            >
              <div className="w-20 h-20 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Terminate Unit?</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
                Confirming the permanent erasure of <span className="text-white">[{currentPc?.pc_name}]</span> hardware data from the matrix.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-brand-black border border-brand-border text-slate-500 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={handleDeletePc}
                  disabled={loading}
                  className="flex-1 py-4 bg-red-600 text-white rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'ERASING...' : 'CONFIRM_KILL'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
