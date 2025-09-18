export interface Admin {
  id: number;
  username: string;
  role: 'chief' | 'college' | 'normal';
  collegeCode: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface User {
  id: number;
  username: string;
  role: 'chief' | 'college' | 'normal';
  collegeCode: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface Confession {
  id: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  collegeCode: string;
  createdAt: string;
  reports: number;
  author?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  collegeCode: string;
  status: 'active' | 'closed';
  createdAt: string;
  lastMessage: string;
}