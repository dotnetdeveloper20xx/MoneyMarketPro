export interface BorrowerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  dateOfBirth: string;
  address: Address;
  employmentInfo: EmploymentInfo;
  creditScore: number;
  isVerified: boolean;
  createdAt: string;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface EmploymentInfo {
  employerName: string;
  jobTitle: string;
  monthlyIncome: number;
  employmentStartDate: string;
  employmentType: 'FullTime' | 'PartTime' | 'SelfEmployed' | 'Unemployed';
}

export interface CreateBorrowerProfileRequest {
  phoneNumber: string;
  dateOfBirth: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  employerName: string;
  jobTitle: string;
  monthlyIncome: number;
  employmentStartDate: string;
  employmentType: string;
}

export interface UpdateBorrowerProfileRequest {
  phoneNumber?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  employerName?: string;
  jobTitle?: string;
  monthlyIncome?: number;
}
