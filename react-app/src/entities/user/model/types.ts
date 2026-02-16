export type Role = 'ADMIN' | 'USER' | 'MANAGER' | 'EMPLOYEE';

export interface ProfileCardType {
  id: number;
  email: string;
  role: Role;
  position: string;
  companyId: number;
  companyName: string;
  active: boolean;
  name?: string;
  username?: string;
  photo?: string;
  avatar?: string;
}
