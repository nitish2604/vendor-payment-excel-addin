import { initializeUI } from "./ui";

// declare globals for Office so TS doesn't complain
declare const Office: any;

localStorage.clear();

function startWebApp() {
  document.addEventListener("DOMContentLoaded", () => {
    console.log("Starting in pure Web mode.");
    initializeUI();
  });
}

// Try Excel / Office mode first
if (typeof Office !== "undefined" && Office.onReady) {
  Office.onReady()
    .then(() => {
      console.log("Office.js mode detected - starting in Excel add-in mode.");
      initializeUI();
    })
    .catch(() => {
      startWebApp();    // If Office.onReady fails, fallback to web
    });
} else {
  startWebApp();    // No Office.js, start in web mode
}
