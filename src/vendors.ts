import { Vendor, AccountCode } from "./types";
import { load, save } from "./storage";

const VENDOR_KEY = "vendors";

export function getVendors(): Vendor[] {
  return load<Vendor[]>(VENDOR_KEY, []);
}

function persistVendors(vendors: Vendor[]): void {
  save<Vendor[]>(VENDOR_KEY, vendors);
}

function createVendorId(name: string): string {
  const base = name.toLowerCase().replace(/\s+/g, "");
  return `V${Math.random().toString(36).substring(2, 8)}_${base}`;
}

export function addVendor(name: string, assignedAccount: AccountCode): string {
  if (!name.trim()) {
    return "Vendor name is required.";
  }

  const vendors = getVendors();

  if (vendors.some(v => v.name.toLowerCase() === name.toLowerCase())) {
    return "Vendor with this name already exists.";
  }

  const newVendor: Vendor = {
    id: createVendorId(name),
    name,
    assignedAccount
  };

  vendors.push(newVendor);
  persistVendors(vendors);

  return `Vendor "${name}" added successfully.`;
}
