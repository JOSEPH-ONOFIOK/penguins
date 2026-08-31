/**
 * h00dguins allowlist collector.
 *
 * Entries submitted on /allowlist land in a Google Sheet, one row per wallet,
 * with a Status column you edit by hand while reviewing.
 *
 * Setup:
 * 1. Create a Google Sheet (any name).
 * 2. Extensions -> Apps Script, delete the boilerplate, paste this file in.
 * 3. Set SHARED_SECRET below to a long random string.
 * 4. Deploy -> New deployment -> type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Copy the Web app URL into the site's env:
 *      GOOGLE_SHEETS_WEBAPP_URL=<the /exec url>
 *      GOOGLE_SHEETS_SECRET=<the same string as SHARED_SECRET>
 * 6. Re-deploy after every edit (Manage deployments -> edit -> new version).
 *    Apps Script does not auto-update a live deployment.
 *
 * The web app URL is public, so SHARED_SECRET is what stops strangers from
 * writing rows. Leave it empty only for local testing.
 */

const SHEET_NAME = "Allowlist";
const SHARED_SECRET = "";

const HEADERS = [
  "Timestamp",
  "Position",
  "Wallet",
  "X Handle",
  "Tasks",
  "Status",
  "Review notes",
];

const COL = { TIMESTAMP: 0, POSITION: 1, WALLET: 2, HANDLE: 3, TASKS: 4, STATUS: 5 };

const WALLET_RE = /^0x[a-fA-F0-9]{40}$/;
const HANDLE_RE = /^@?[A-Za-z0-9_]{1,15}$/;

function getSheet_() {
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
  return sheet;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function authorized_(data) {
  if (!SHARED_SECRET) return true;
  return String(data.secret || "") === SHARED_SECRET;
}

/** Row index (1-based, header included) of a wallet, or -1. */
function findRow_(rows, wallet) {
  const key = wallet.toLowerCase();
  for (let i = 1; i < rows.length; i++) {
    if (String(rows[i][COL.WALLET]).toLowerCase() === key) return i;
  }
  return -1;
}

function doPost(e) {
  let data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return json_({ error: "Invalid JSON body." });
  }

  if (!authorized_(data)) {
    return json_({ error: "unauthorized" });
  }

  const wallet = String(data.wallet || data.address || "").trim();
  const rawHandle = String(data.handle || "").trim();
  const handle = rawHandle.replace(/^@/, "");
  const tasks = Array.isArray(data.tasks) ? data.tasks.join(", ") : "";

  if (!WALLET_RE.test(wallet)) {
    return json_({ error: "Invalid wallet address." });
  }
  if (!HANDLE_RE.test(rawHandle)) {
    return json_({ error: "Invalid X handle." });
  }

  // Serialize writes so two submissions can never claim the same position.
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
  } catch (err) {
    return json_({ error: "Busy, try again." });
  }

  try {
    const sheet = getSheet_();
    const rows = sheet.getDataRange().getValues();
    const existing = findRow_(rows, wallet);

    if (existing !== -1) {
      const row = rows[existing];
      return json_({
        ok: true,
        created: false,
        position: Number(row[COL.POSITION]) || existing,
        status: String(row[COL.STATUS] || "pending"),
        total: Math.max(sheet.getLastRow() - 1, 0),
      });
    }

    const position = Math.max(sheet.getLastRow() - 1, 0) + 1;
    sheet.appendRow([new Date(), position, wallet, "@" + handle, tasks, "pending", ""]);
    SpreadsheetApp.flush();

    return json_({
      ok: true,
      created: true,
      position: position,
      status: "pending",
      total: Math.max(sheet.getLastRow() - 1, 0),
    });
  } finally {
    lock.releaseLock();
  }
}

/**
 * GET ?secret=...            -> { total }
 * GET ?secret=...&address=0x -> { total, listed, position, status }
 */
function doGet(e) {
  const params = (e && e.parameter) || {};
  if (!authorized_(params)) {
    return json_({ error: "unauthorized" });
  }

  const sheet = getSheet_();
  const total = Math.max(sheet.getLastRow() - 1, 0);
  const address = String(params.address || "").trim();

  if (!address) {
    return json_({ total: total });
  }

  const rows = sheet.getDataRange().getValues();
  const found = findRow_(rows, address);
  if (found === -1) {
    return json_({ total: total, listed: false });
  }

  const row = rows[found];
  return json_({
    total: total,
    listed: true,
    position: Number(row[COL.POSITION]) || found,
    status: String(row[COL.STATUS] || "pending"),
    handle: String(row[COL.HANDLE] || ""),
  });
}
