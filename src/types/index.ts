// ─── Auth ────────────────────────────────────────────────────────────────────
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
}

export interface AuthUser extends User {
  user_type: 'student' | 'admin';
  has_student_profile?: boolean;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
  password2: string;
  first_name: string;
  last_name: string;
}

export interface LoginPayload {
  username: string;
  password: string;
}

// ─── Profile ─────────────────────────────────────────────────────────────────
export interface Profile {
  id: number;
  user: number;
  address: string;
  dob: string;
  gender: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Grades ───────────────────────────────────────────────────────────────────
export type GradeChoice =
  | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-'
  | 'D+' | 'D' | 'D-' | 'E';

export type SubjectChoice =
  | 'ENGLISH' | 'KISWAHILI' | 'MATHEMATICS'
  | 'BIOLOGY' | 'CHEMISTRY' | 'PHYSICS'
  | 'HISTORY' | 'GEOGRAPHY' | 'CRE' | 'IRE' | 'HRE'
  | 'FRENCH' | 'GERMAN' | 'ARABIC'
  | 'HOME_SCIENCE' | 'AGRICULTURE' | 'WOODWORK' | 'METALWORK'
  | 'BUILDING_CONSTRUCTION' | 'POWER_MECHANICS' | 'ELECTRICITY'
  | 'DRAWING_DESIGN' | 'AVIATION' | 'COMPUTER' | 'BUSINESS' | 'MUSIC' | 'ART_DESIGN';

export interface StudentGrade {
  id: number;
  subject: SubjectChoice;
  grade: GradeChoice;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface GradeStatistics {
  total_subjects: number;
  total_points: number;
  average_points: number;
  mean_grade: string;
}

export interface GradesResponse {
  status: string;
  data: StudentGrade[];
  statistics: GradeStatistics;
}

// ─── Preferences ─────────────────────────────────────────────────────────────
export interface StudentPreferences {
  id: number;
  preferred_subjects: SubjectChoice[];
}

// ─── Psychometric Assessment ──────────────────────────────────────────────────
export type RiasecCategory =
  | 'REALISTIC' | 'INVESTIGATIVE' | 'ARTISTIC'
  | 'SOCIAL' | 'ENTERPRISING' | 'CONVENTIONAL';

export type BigFiveCategory =
  | 'OPENNESS' | 'CONSCIENTIOUSNESS' | 'EXTRAVERSION'
  | 'AGREEABLENESS' | 'NEUROTICISM';

export type QuestionCategory = RiasecCategory | BigFiveCategory;

export interface PsychometricQuestion {
  id: number;
  question_text: string;
  category: QuestionCategory;
  is_active: boolean;
}

export interface PsychometricResponse {
  id: number;
  question: number;
  response_value: 1 | 2 | 3 | 4 | 5;
  submitted_at: string;
}

export interface PsychometricResult {
  category: QuestionCategory;
  average_score: number;
  question_count: number;
  interpretation: string;
}

export interface PsychometricProgress {
  total_questions: number;
  answered: number;
  percentage: number;
  is_complete: boolean;
}

// ─── Careers ─────────────────────────────────────────────────────────────────
export interface Institution {
  id: number;
  name: string;
  location: string;
  type: string;
}

export interface Course {
  id: number;
  prog_code: string;
  name: string;
  institution: Institution;
  cutoff_2022?: number;
  cutoff_2023?: number;
  cutoff_2024?: number;
  cutoff_2025?: number;
  career_field?: string;
  required_subjects?: string[];
  min_grade?: string;
  // ... other fields
}

export interface CareerPath {
  id: number;
  name: string;
  description: string;
  required_skills: string;
  average_salary?: number;
  related_courses: Course[];
  created_at?: string;
  updated_at?: string;
}


// ─── Cluster Calculator ───────────────────────────────────────────────────────
export interface Subject {
  id: number;
  name: string;
  code: string;
  is_compulsory: boolean;
}

export interface Grade {
  id: number;
  grade: GradeChoice;
  points: number;
}

export interface Cluster {
  id: number;
  name: string;
  code: string;
  description: string;
  subjects: Subject[];
}

export interface ClusterCalculation {
  id: number;
  cluster: Cluster;
  total_points: number;
  subjects_used: { subject: string; grade: string; points: number }[];
  year: number;
}

// ─── Generic API Response ─────────────────────────────────────────────────────
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data: T;
  message?: string;
}


export interface RecommendationsResponse {
  student_profile: {
    top_riasec_categories: string[];
    avg_grade: number;
    strong_subjects: string[];
    matched_career_fields: string[];
  };
  recommended_courses: Array<{
    course_id: number;
    course_name: string;
    score: number;
    match_reasons: string[];
  }>;
  recommended_universities: Array<{
    university_id: number;
    university_name: string;
    score: number;
    match_reasons: string[];
  }>;
  cluster_info?: {
    cluster_points: number;
    cluster_message: string;
  };
}