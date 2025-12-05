import { saveAs } from "file-saver";
import { getAllPayments, getAccountsState } from "./payments";
import { getVendors } from "./vendors";
import type { Payment, Vendor, Accounts } from "./types";

// declare globals so TS doesn't complain if we don't have @types/office-js
declare const Excel: any;
declare const Office: any;

function buildReportData() {
  const payments: Payment[] = getAllPayments();
  const vendors: Vendor[] = getVendors();
  const accounts: Accounts = getAccountsState();

  return { payments, vendors, accounts };
}

function buildCsv({ payments, vendors, accounts }: ReturnType<typeof buildReportData>): string {
  const lines: string[] = [];
  lines.push("Vendor ID,Vendor Name,Amount,Account,Date");

  payments.forEach(p => {
    const v = vendors.find(v => v.id === p.vendorId);
    const name = v ? v.name : p.vendorName || "Unknown";
    lines.push(
      `${p.vendorId},${name},${p.amount},${p.account},${p.date}`
    );
  });

  lines.push("");
  lines.push("Account,Balance");
  lines.push(`A,${accounts.A}`);
  lines.push(`B,${accounts.B}`);
  lines.push("");
  lines.push(`Report generated at,${new Date().toISOString()}`);

  return lines.join("\n");
}

// download csv + excel report
export async function downloadBankStatementCsv(): Promise<void> {
  const data = buildReportData();
  const csv = buildCsv(data);

  // Always: CSV download (works in browser & Excel taskpane)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  saveAs(blob, "BankStatement.csv");

  // Try Excel automation if available
  const hasExcel =
    typeof Excel !== "undefined" &&
    typeof Office !== "undefined" &&
    Office.context &&
    Office.context.host;

  if (!hasExcel) {
    console.log("Excel.js not available - CSV only mode.");
    return;
  }

  try {
    await Excel.run(async (context: any) => {
      const sheetName = "Vendor Report";
      let sheet;

      // Try to get or add worksheet
      try {
        sheet = context.workbook.worksheets.getItem(sheetName);
      } catch {
        sheet = context.workbook.worksheets.add(sheetName);
      }

      const payments = data.payments;
      const accounts = data.accounts;

      // Header
      const headerRange = sheet.getRange("A1:E1");
      headerRange.values = [["Vendor ID", "Vendor Name", "Amount", "Account", "Date"]];
      headerRange.format.font.bold = true;

      if (payments.length > 0) {
        const bodyValues = payments.map(p => [
          p.vendorId,
          p.vendorName,
          p.amount,
          p.account,
          new Date(p.date).toLocaleString()
        ]);

        const bodyRange = sheet.getRangeByIndexes(
          1,
          0,
          bodyValues.length,
          5
        ); 
        bodyRange.values = bodyValues;
      }

      // Accounts summary
      const summaryStartRow = payments.length + 3;
      const summaryHeader = sheet.getRange(`A${summaryStartRow}:B${summaryStartRow}`);
      summaryHeader.values = [["Account", "Balance"]];
      summaryHeader.format.font.bold = true;

      const summaryValues = [
        ["A", accounts.A],
        ["B", accounts.B]
      ];
      const summaryBody = sheet.getRangeByIndexes(
        summaryStartRow,
        0,
        summaryValues.length,
        2
      );
      summaryBody.values = summaryValues;

      // Timestamp
      const tsRow = summaryStartRow + summaryValues.length + 2;
      sheet.getRange(`A${tsRow}:B${tsRow}`).values = [
        ["Report generated at", new Date().toLocaleString()]
      ];

      sheet.activate();
      await context.sync();
    });

    console.log("Excel sheet report generated successfully.");
  } catch (err) {
    console.error("Excel.run failed, but CSV was still downloaded.", err);
  }
}
