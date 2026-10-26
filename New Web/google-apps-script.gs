/**
 * Skill Sphere Academy — Enquiry form → Google Sheet
 *
 * SETUP (one time, ~3 minutes):
 * 1. Create a new Google Sheet (e.g. "Skill Sphere Enquiries").
 * 2. In the sheet: Extensions → Apps Script. Delete any code and paste this whole file. Save.
 * 3. Click Deploy → New deployment → gear icon → "Web app".
 *      - Execute as:      Me
 *      - Who has access:  Anyone
 *    Click Deploy and authorize when asked.
 * 4. Copy the "Web app URL" (ends with /exec) and paste it into script.js:
 *      const ENQUIRY_SHEET_URL = "https://script.google.com/macros/s/XXXX/exec";
 *
 * If you edit this script later: Deploy → Manage deployments → Edit → Version: New version → Deploy
 * (the URL stays the same).
 */

const SHEET_NAME = "Enquiries";
const HEADERS = ["Timestamp", "Name", "Course", "Message", "Page", "Submitted At (client)"];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    }

    const p = (e && e.parameter) || {};
    const clean = v => String(v || "").slice(0, 1000).replace(/^[=+\-@]/, "'$&"); // block formula injection

    sheet.appendRow([
      new Date(),
      clean(p.name),
      clean(p.course),
      clean(p.message),
      clean(p.page),
      clean(p.submittedAt)
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput("Skill Sphere enquiry endpoint is running.");
}
