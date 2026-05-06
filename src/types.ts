export type UserRole = 'admin' | 'guru' | 'siswa';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  email: string;
  created_at: string;
}

export type LabType = 'RPL' | 'DKV' | 'Bisnis Retail' | 'AKL' | 'MP';
export type PCStatus = 'Baik' | 'Rusak';

export interface PCDevice {
  id: string;
  pc_name: string;
  lab: LabType;
  status: PCStatus;
  specs?: string;
  last_maintenance?: string;
  created_at: string;
}

export interface DamageReport {
  id: string;
  pc_id: string;
  pc_name?: string; // Joined
  lab?: LabType; // Joined
  reporter_name: string;
  description: string;
  status: 'Diproses' | 'Selesai' | 'Baru';
  created_at: string;
}

export const LABS: LabType[] = ['RPL', 'DKV', 'Bisnis Retail', 'AKL', 'MP'];
