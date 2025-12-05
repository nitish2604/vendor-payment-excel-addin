import { Payment, Accounts, AccountCode } from "./types";
import { load, save } from "./storage";
import { getVendors } from "./vendors";

const PAY_KEY = "payments";
const ACC_KEY = "accounts";

const INITIAL_BALANCE = 200000; 

function ensureAccounts(): Accounts {
  const stored = load<Accounts | null>(ACC_KEY, null);
  if (!stored) {
    const fresh: Accounts = { A: INITIAL_BALANCE, B: INITIAL_BALANCE };
    save<Accounts>(ACC_KEY, fresh);
    return fresh;
  }
  return stored;
}

export function getAccountsState(): Accounts {
  return ensureAccounts();
}

function persistAccounts(acc: Accounts): void {
  save<Accounts>(ACC_KEY, acc);
}

function getPaymentsRaw(): Payment[] {
  return load<Payment[]>(PAY_KEY, []);
}

function persistPayments(p: Payment[]): void {
  save<Payment[]>(PAY_KEY, p);
}

export function getAllPayments(): Payment[] {
  return getPaymentsRaw();
}

export function getPaymentsByVendor(vendorId: string): Payment[] {
  return getPaymentsRaw().filter(p => p.vendorId === vendorId);
}

export function makePayment(
  vendorId: string,
  amount: number
): { ok: boolean; message: string } {
  if (!vendorId) {
    return { ok: false, message: "Please select a vendor." };
  }
  if (!amount || isNaN(amount) || amount <= 0) {
    return { ok: false, message: "Please enter a valid amount." };
  }

  const vendors = getVendors();
  const vendor = vendors.find(v => v.id === vendorId);
  if (!vendor) {
    return { ok: false, message: "Vendor not found." };
  }

  const accounts = getAccountsState();
  const accountCode = vendor.assignedAccount;

  if (amount > accounts[accountCode]) {
    return { ok: false, message: "Insufficient balance in assigned account." };
  }

  // Deduct
  accounts[accountCode] -= amount;
  persistAccounts(accounts);

  // Record payment
  const payments = getPaymentsRaw();
  const payment: Payment = {
    id: "P" + Date.now().toString(36),
    vendorId: vendor.id,
    vendorName: vendor.name,
    amount,
    account: accountCode,
    date: new Date().toISOString()
  };

  payments.push(payment);
  persistPayments(payments);

  return { ok: true, message: "Payment recorded successfully." };
}
