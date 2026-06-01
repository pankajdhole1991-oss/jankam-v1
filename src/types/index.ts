export interface LeadershipData {
  id?: string;
  name: string;
  mobile: string;
  email: string;
  state: string;
  district: string;
  industryType: string;
  workerType: string;
  educationLevel: string;
  preferredLanguage: string;
  skills: string[];
  emergencyName?: string;
  emergencyMobile?: string;
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
  isDeleted?: boolean;
  deletedAt?: string;
}

// AI Agent Types
export interface AIAgent {
  id: string;
  name: string;
  role: string;
  description: string;
  icon: string;
  imageId: string;
  topics: string[];
  responses: Record<string, string>;
}

// District Types
export interface DistrictData {
  id: string;
  name: string;
  division: string;
  complaintCount: number;
  memberCount: number;
  activeVolunteers: number;
  status: 'active' | 'growing' | 'pending';
}

// Calculator Types
export interface SalaryInput {
  basicSalary: number;
  da: number;
  hra: number;
  otherAllowances: number;
}

export interface SalaryResult {
  grossSalary: number;
  pfEmployee: number;
  pfEmployer: number;
  esicEmployee: number;
  esicEmployer: number;
  totalDeductions: number;
  netTakeHome: number;
}

export interface OvertimeInput {
  basicSalary: number;
  workingDays: number;
  overtimeHours: number;
}

export interface OvertimeResult {
  dailyWage: number;
  hourlyWage: number;
  overtimeRate: number;
  overtimePay: number;
}

export interface PFInput {
  basicSalary: number;
  da: number;
  years: number;
}

export interface PFResult {
  employeeContribution: number;
  employerContribution: number;
  totalMonthly: number;
  totalCorpus: number;
}

export interface GratuityInput {
  basicSalary: number;
  da: number;
  yearsOfService: number;
}

export interface GratuityResult {
  gratuityAmount: number;
  isEligible: boolean;
  message: string;
}
