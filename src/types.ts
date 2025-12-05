export type AccountCode = "A" | "B";

export interface Vendor {
  id: string;
  name: string;
  assignedAccount: AccountCode;
}

export interface Payment {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  account: AccountCode;
  date: string; 
}

export interface Accounts {
  A: number;
  B: number;
}
