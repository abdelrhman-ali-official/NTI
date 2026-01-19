// Core Models
export interface User {
  token: string;
  userId: string;
  userName: string;
  userType: 'Admin' | 'Instructor' | 'Student';
  displayName: string;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface LoginResponse extends User {}
