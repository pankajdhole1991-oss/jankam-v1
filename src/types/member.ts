// ============================================
// JANKAM — MEMBER TYPES
// ============================================

export interface MemberData {
  id?: string;
  name: string;
  mobile: string;
  email: string;
  gender: string;
  age: number;
  homeState: string;
  homeDistrict: string;
  workState: string;
  workDistrict: string;
  industryType: string;
  workerType: string;
  educationLevel: string;
  preferredLanguage: string;
  companyName: string;
  occupation: string;
  experience: string; // Years
  emergencyName?: string;
  emergencyMobile?: string;
  joinDate: string;   // ISO 8601 or YYYY-MM-DD
  status: 'active' | 'pending' | 'suspended' | 'rejected';
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface MemberAcknowledgement {
  memberId: string;
  name: string;
  workDistrict: string;
  workState: string;
  industryType: string;
  joinedAt: string;
  status: string;
}
