export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface Report {
  id: number;
  title: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
  category: string;
}