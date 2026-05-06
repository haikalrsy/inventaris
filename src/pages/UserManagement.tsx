import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { UserRole } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Edit2, 
  Trash2, 
  UserPlus, 
  Filter,
  X,
  AlertTriangle,
  Fingerprint,
  Users as UsersIcon,
  ShieldCheck as ShieldIcon
} from 'lucide-react';

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

export default function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'siswa' as UserRole
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (currentUser) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            role: formData.role
          })
          .eq('id', currentUser.id);

        if (error) throw error;
      } else {
        const { data, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              role: formData.role,
            }
          }
        });

        if (authError) throw authError;

        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              full_name: formData.full_name,
              role: formData.role
            });
          
          if (profileError) throw profileError;
        }
      }

      setIsModalOpen(false);
      fetchUsers();
      resetForm();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', currentUser.id);

      if (error) throw error;
      
      setIsDeleteModalOpen(false);
      fetchUsers();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      role: 'siswa'
    });
    setCurrentUser(null);
  };

  const openEditModal = (user: any) => {
    setCurrentUser(user);
    setFormData({
      email: '', 
      password: '',
      full_name: user.full_name,
      role: user.role
    });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(u => {
    const nameMatch = u.full_name?.toLowerCase().includes(search.toLowerCase());
    const roleMatch = roleFilter === 'all' || u.role === roleFilter;
    return nameMatch && roleMatch;
  });

  if (loading && users.length === 0) {
    return (
      <div className="min-h-[400px] flex flex-col items-center justify-center bg-brand-black rounded-3xl border border-brand-border/30">
        <div className="w-12 h-12 border-2 border-brand-lime border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Accessing Personnel Database...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">
            Personnel <span className="text-brand-lime">Matrix</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2">Authorization & Privilege Console</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-brand-lime text-black px-8 py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(186,255,0,0.2)] hover:scale-105 active:scale-95 transition-all"
        >
          INIT_NEW_AGENT [+]
        </button>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 rounded-2xl border-brand-border/50 overflow-hidden relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Personnel</span>
            <span className="text-3xl font-black text-white font-mono">{users.length}</span>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <UsersIcon size={48} />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-brand-border/50 overflow-hidden relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Admin Protocols</span>
            <span className="text-3xl font-black text-purple-400 font-mono">{users.filter(u => u.role === 'admin').length}</span>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldIcon size={48} className="text-purple-400" />
          </div>
        </div>
        <div className="glass-card p-6 rounded-2xl border-brand-border/50 overflow-hidden relative">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Standard Units</span>
            <span className="text-3xl font-black text-brand-lime font-mono">{users.filter(u => u.role === 'siswa').length}</span>
          </div>
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Fingerprint size={48} className="text-brand-lime" />
          </div>
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4 border-brand-border/50">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-lime opacity-50" />
          <input 
            type="text"
            placeholder="SCAN_AGENT_IDENTIFIER..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-brand-dark/50 border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all text-[10px] font-mono font-bold text-white placeholder:text-slate-700"
          />
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-brand-lime opacity-50" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="pl-10 pr-10 py-3 bg-brand-dark/50 border border-brand-border rounded-xl focus:outline-none appearance-none font-black text-slate-400 text-[10px] uppercase tracking-widest cursor-pointer hover:border-brand-lime/30 transition-colors"
            >
              <option value="all">ALL_PRIVILEGES</option>
              <option value="admin">LVL_ADMIN</option>
              <option value="siswa">LVL_USER</option>
            </select>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl border border-brand-border/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-mono">
            <thead>
              <tr className="bg-brand-dark/80 border-b border-brand-border/50">
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Agent_ID</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Access_Level</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] text-right">Operations</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border/30">
              <AnimatePresence>
                {filteredUsers.map((user, index) => (
                  <motion.tr 
                    key={user.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-brand-lime/[0.02] transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-brand-dark border border-brand-border rounded-xl flex items-center justify-center text-brand-lime font-black text-xs">
                          {user.full_name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-black text-white text-sm tracking-tight">{user.full_name}</span>
                          <span className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">UUID: {user.id.slice(0, 8)}...</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-[0_0_10px_rgba(0,0,0,0.1)]",
                        user.role === 'admin' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        "bg-brand-lime/10 text-brand-lime border-brand-lime/20"
                      )}>
                        {user.role === 'admin' ? 'SEC_ADMIN' : 'SEC_USER'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => openEditModal(user)}
                          className="p-2 text-slate-500 hover:text-brand-lime transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => { setCurrentUser(user); setIsDeleteModalOpen(true); }}
                          className="p-2 text-slate-500 hover:text-red-500 transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {filteredUsers.length === 0 && !loading && (
          <div className="p-20 text-center">
            <div className="w-16 h-16 bg-brand-dark border border-brand-border rounded-full flex items-center justify-center mx-auto mb-6">
              <Fingerprint size={24} className="text-slate-800" />
            </div>
            <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tighter">No Signal</h3>
            <p className="text-slate-600 text-[10px] font-bold uppercase tracking-widest">Database return zero matching agent profiles.</p>
          </div>
        )}
      </div>

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
                   <h3 className="text-xl font-black uppercase tracking-tighter text-black">{currentUser ? 'Override Profile' : 'Initialize Profile'}</h3>
                   <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Matrix Command Console</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-black/10 rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>
              
              <form onSubmit={handleSaveUser} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Agent Name</label>
                  <input 
                    required
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                    className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all font-bold text-white text-sm"
                    placeholder="VERIFY_FULL_NAME..."
                  />
                </div>

                {!currentUser && (
                  <>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Terminal ID (Email)</label>
                      <input 
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all font-bold text-white text-sm"
                        placeholder="AGENT@SECTOR.COM"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Access Protocol (Password)</label>
                      <input 
                        required
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                        className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all font-bold text-white text-sm"
                        placeholder="MIN_6_CHILLERS"
                      />
                    </div>
                  </>
                )}

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] ml-1">Privilege Level</label>
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value as UserRole})}
                    className="w-full px-5 py-4 bg-brand-black border border-brand-border rounded-xl focus:outline-none focus:border-brand-lime/50 transition-all appearance-none font-bold text-slate-400 text-sm uppercase tracking-widest"
                  >
                    <option value="siswa">SEC_LEVEL: USER</option>
                    <option value="admin">SEC_LEVEL: ADMIN</option>
                  </select>
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
                    {loading ? 'EXECUTING...' : 'TRANSMIT_DATA'}
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
              <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Terminate Agent?</h3>
              <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed mb-8">
                Confirming the permanent erasure of <span className="text-white">[{currentUser?.full_name}]</span> profile from the matrix.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 bg-brand-black border border-brand-border text-slate-500 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:text-white transition-all"
                >
                  Abort
                </button>
                <button 
                  onClick={handleDeleteUser}
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
