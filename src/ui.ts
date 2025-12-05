import { login, isLoggedIn, logout, getCurrentUserName } from "./auth";
import { addVendor, getVendors } from "./vendors";
import {
  makePayment,
  getAllPayments,
  getPaymentsByVendor,
  getAccountsState
} from "./payments";
import { downloadBankStatementCsv } from "./excel";
import type { Vendor, Payment } from "./types";

function el(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function optEl(id: string): HTMLElement | null {
  return document.getElementById(id);
}

// debug log 
function logDebug(message: string) {
  const box = optEl("debugBox");
  if (!box) return;
  const time = new Date().toLocaleTimeString();
  box.textContent = `${time} — ${message}\n` + box.textContent;
}

// render balance 
function renderBalances() {
  const box = el("balancesBox");
  const acc = getAccountsState();
    box.innerHTML = `
        <div class="balance-card">
        <h4>Account A</h4>
        <p>$${acc.A.toLocaleString()}</p>
        </div>
        <div class="balance-card">
        <h4>Account B</h4>
        <p>$${acc.B.toLocaleString()}</p>
    </div>
  `;
}

// render vendors
function renderVendors() {
  const list = el("vendorList");
  const vendors = getVendors();

  const paySelect = el("paymentVendorSelect") as HTMLSelectElement;
  const historySelect = el("historyVendorFilter") as HTMLSelectElement;

  list.innerHTML = "";
  paySelect.innerHTML = `<option value="">-- choose vendor --</option>`;
  historySelect.innerHTML = `<option value="">All Vendors</option>`;

  vendors.forEach((v: Vendor) => {
    const row = document.createElement("div");
    row.className = "list-row";
    row.innerHTML = `
      <span class="main">${v.name}</span>
      <span class="sub">ID: ${v.id} • Assigned Account: ${v.assignedAccount}</span>
    `;
    list.appendChild(row);

    const opt = document.createElement("option");
    opt.value = v.id;
    opt.textContent = `${v.name} (${v.id})`;
    paySelect.appendChild(opt);

    const opt2 = document.createElement("option");
    opt2.value = v.id;
    opt2.textContent = v.name;
    historySelect.appendChild(opt2);
  });
}

// rendor payments
function renderPayments(payments: Payment[], containerId: string) {
  const list = el(containerId);

  if (!payments.length) {
    list.innerHTML = "<p>No payments found.</p>";
    return;
  }

  list.innerHTML = payments
    .map(
      p => `
      <div class="list-row">
        <span class="main">₹${p.amount.toLocaleString()} • Account ${p.account}</span>
        <span class="sub">Vendor: ${p.vendorName} • ${new Date(
        p.date
      ).toLocaleString()}</span>
      </div>
    `
    )
    .join("");
}

function renderAllPayments() {
  renderPayments(getAllPayments(), "paymentsList");
}

function renderVendorHistory(vendorId: string | null) {
  const data = vendorId ? getPaymentsByVendor(vendorId) : getAllPayments();
  renderPayments(data, "vendorHistory");
}

// auth ui 
function showApp() {
  el("loginSection").classList.add("hidden");
  el("appSection").classList.remove("hidden");
  el("logoutBtn").classList.remove("hidden");

  const name = getCurrentUserName();
  const lbl = optEl("currentUserLabel") as HTMLElement | null;
  if (lbl) {
    lbl.textContent = name ? `Logged in as: ${name}` : "";
  }
}

function showLogin() {
  el("loginSection").classList.remove("hidden");
  el("appSection").classList.add("hidden");
  el("logoutBtn").classList.add("hidden");

  const lbl = optEl("currentUserLabel") as HTMLElement | null;
  if (lbl) lbl.textContent = "";
}

// initialize ui
export function initializeUI() {
  if (isLoggedIn()) {
    showApp();
    renderBalances();
    renderVendors();
    renderAllPayments();
    renderVendorHistory(null);
  } else {
    showLogin();
  }

  // login
  el("loginBtn").addEventListener("click", () => {
    const email = (el("loginEmail") as HTMLInputElement).value.trim();
    const password = (el("loginPassword") as HTMLInputElement).value;
    const ok = login(email, password);

    const err = el("loginError") as HTMLParagraphElement;

    if (ok) {
      err.textContent = "";
      showApp();
      renderBalances();
      renderVendors();
      renderAllPayments();
      renderVendorHistory(null);
      logDebug(`Login success for ${email}`);
    } else {
      err.textContent = "Invalid email or password.";
      logDebug(`Login failed for ${email}`);
    }
  });

  // logout
  el("logoutBtn").addEventListener("click", () => {
    logout();
    showLogin();
    logDebug("User logged out");
  });

  // add vendor
  el("addVendorBtn").addEventListener("click", () => {
    const name = (el("vendorName") as HTMLInputElement).value;
    const account = (el("vendorAccount") as HTMLSelectElement).value as "A" | "B";

    const msg = addVendor(name, account);
    logDebug(msg);

    (el("vendorName") as HTMLInputElement).value = "";
    renderVendors();
  });

  // make payment
  el("makePaymentBtn").addEventListener("click", () => {
    const vendorId = (el("paymentVendorSelect") as HTMLSelectElement).value;
    const amountStr = (el("paymentAmount") as HTMLInputElement).value;
    const amount = Number(amountStr);

    const result = makePayment(vendorId, amount);
    logDebug(result.message);

    if (result.ok) {
      (el("paymentAmount") as HTMLInputElement).value = "";
      renderBalances();
      renderAllPayments();

      const filterVal = (el("historyVendorFilter") as HTMLSelectElement).value || null;
      renderVendorHistory(filterVal);
    }
  });

  // vendor history filter
  el("historyVendorFilter").addEventListener("change", () => {
    const vendorId = (el("historyVendorFilter") as HTMLSelectElement).value || null;
    renderVendorHistory(vendorId);
  });

  // csv + excel export
  el("downloadReportBtn").addEventListener("click", () => {
    downloadBankStatementCsv();
    logDebug("Bank statement export triggered.");
  });
}
