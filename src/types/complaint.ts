// ============================================
// JANKAM — COMPLAINT TYPES
// Backend-ready: compatible with Supabase / PostgreSQL
// ============================================

export type ComplaintStatus = 'submitted' | 'under_review' | 'resolved' | 'escalated' | 'closed';

export type ComplaintStage = 'submitted' | 'under_review' | 'employer_verification' | 'conciliation' | 'resolved';

export type ComplaintType =
  | 'Salary Delay'
  | 'Salary Deduction'
  | 'Overtime Non-Payment'
  | 'PF Issue'
  | 'ESIC Issue'
  | 'Workplace Harassment'
  | 'Women Safety'
  | 'Illegal Termination'
  | 'Leave Issue'
  | 'Gratuity Issue'
  | 'Contract Labour Issue'
  | 'Other';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface ComplaintData {
  id?: string;                  // JK-XXX-0001 format
  name: string;
  mobile: string;
  email?: string;
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
  employeeId?: string;
  complaintType: ComplaintType;
  description: string;
  priorityLevel: PriorityLevel;
  documentType?: string;        // E.g. Salary Slip, PF Statement, ESIC Card, etc.
  status: ComplaintStatus;
  createdAt: string;            // ISO 8601
  updatedAt?: string;

  // --- UPGRADED INTAKE FIELDS ---
  // Employer / Contractor Information
  employerName: string;
  employerMobile?: string;
  employerEmail?: string;
  companyAddress?: string;
  workSiteAddress?: string;
  supervisorName?: string;
  supervisorMobile?: string;
  hrMobile?: string;
  hrEmail?: string;

  // Case Details Upgrade
  incidentDate: string;
  complaintAgainst: 'Employer' | 'Contractor' | 'HR Department' | 'Supervisor' | 'Company Management' | 'Other';
  approxFinancialLoss?: string;

  // Evidence Collection Upgrade
  witnessName?: string;
  witnessMobile?: string;
  witnessDesignation?: string;
  evidenceNotes?: string;

  // Automation / Notification Integration
  workerMobileVerified: boolean;
  lastNotificationSent?: string | null;
  notificationType: 'SMS' | 'WhatsApp' | 'Email' | 'None';

  // Secretary Note & Officer Workflows
  internalNotes?: string;
  publicUpdate?: string;
  currentStage: ComplaintStage;
  assignedVolunteer?: string;
  assignedDistrictTeam?: string;
  assignedOfficer?: string;

  // Soft Delete System Audit
  isDeleted?: boolean;
  deletedAt?: string;
}

export interface ComplaintReceipt {
  complaintId: string;
  name: string;
  workDistrict: string;
  complaintType: ComplaintType;
  status: ComplaintStatus;
  submittedAt: string;
  priorityLevel: PriorityLevel;
}

export const COMPLAINT_TYPE_LABELS: Record<ComplaintType, string> = {
  'Salary Delay': 'Salary Delay',
  'Salary Deduction': 'Salary Deduction',
  'Overtime Non-Payment': 'Overtime Non-Payment',
  'PF Issue': 'PF (Provident Fund) Issue',
  'ESIC Issue': 'ESIC Issue',
  'Workplace Harassment': 'Workplace Harassment',
  'Women Safety': 'Women Safety & POSH Support',
  'Illegal Termination': 'Illegal Termination / Layoff',
  'Leave Issue': 'Leave Rights / Policy Issue',
  'Gratuity Issue': 'Gratuity / Retiral Benefit Issue',
  'Contract Labour Issue': 'Contract Labour Violation',
  'Other': 'Other Labour / Workplace Grievance',
};

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  submitted: 'Submitted — Awaiting Review',
  under_review: 'Under Review',
  resolved: 'Resolved',
  escalated: 'Escalated to Labour Office',
  closed: 'Closed',
};

export const COMPLAINT_STAGE_LABELS: Record<ComplaintStage, string> = {
  submitted: 'Complaint Submitted',
  under_review: 'Under Review',
  employer_verification: 'Employer Verification',
  conciliation: 'Conciliation',
  resolved: 'Resolved',
};

// Auto priority solver - Upgraded with user's approved rules
export function getPriorityForCategory(category: ComplaintType): PriorityLevel {
  switch (category) {
    case 'Women Safety':
    case 'Workplace Harassment':
    case 'Illegal Termination':
    case 'PF Issue':
    case 'ESIC Issue':
      return 'High';
    case 'Salary Delay':
    case 'Salary Deduction':
    case 'Overtime Non-Payment':
    case 'Leave Issue':
    case 'Gratuity Issue':
    case 'Contract Labour Issue':
      return 'Medium';
    default:
      return 'Low';
  }
}
