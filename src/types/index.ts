export interface SchoolSetting {
  id?: number;
  school_name: string;
  agenda_title?: string;
  election_period: string;
  logo_url: string;
  voting_status: 'open' | 'closed' | 'paused';
  updated_at?: string;
}

export interface AdminUser {
  id?: string;
  username: string;
  password_hash: string;
  name: string;
  created_at?: string;
}

export interface ClassItem {
  id: string;
  name: string;
  created_at?: string;
  student_count?: number;
}

export interface Student {
  id: string;
  nisn: string;
  name: string;
  birth_date: string; // YYYY-MM-DD
  class_id?: string | null;
  class_name: string;
  has_voted: boolean;
  voted_at?: string | null;
  created_at?: string;
}

export interface Candidate {
  id: string;
  candidate_number: number;
  photo_url: string;
  leader_name: string;
  vice_leader_name: string;
  vision: string;
  mission: string;
  slogan: string;
  total_votes: number;
  created_at?: string;
}

export interface VoteResult {
  candidate_id: string;
  candidate_number: number;
  leader_name: string;
  vice_leader_name: string;
  photo_url: string;
  total_votes: number;
  percentage: number;
}

export interface ElectionStats {
  totalStudents: number;
  totalClasses: number;
  totalCandidates: number;
  votedStudents: number;
  notVotedStudents: number;
  turnoutPercentage: number;
  totalVotesCast: number;
}
