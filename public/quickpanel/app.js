(() => {
  "use strict";
  const STORAGE_KEY = "yorphives.quickpanel.web.v1";
  const PROFILE_FIELDS = [
    ["profileName", "Full name"], ["profileEmail", "Email"], ["profilePhone", "Phone"],
    ["profileCompany", "Company or role"], ["profileWebsite", "Website"],
    ["profileAddress", "Location or address"], ["profileBio", "Short bio"]
  ];
  const defaults = () => ({ version: 1, snippets: [], clips: [], profile: {} });
  let state = loadState();
  let pendingImport = null;
  let installPrompt = null;
  let toastTimer = null;
  let parsedRows = null;
  const $ = (id) => document.getElementById(id);
  const views = ["textView", "snippetsView", "clipsView", "tablesView", "profileView", "backupView"];

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults();
      const data = JSON.parse(raw);
      return {
        version: 1,
        snippets: Array.isArray(data.snippets) ? data.snippets : [],
        clips: Array.isArray(data.clips) ? data.clips : [],
        profile: data.profile && typeof data.profile === "object" && !Array.isArray(data.profile) ? data.profile : {}
      };
    } catch (err) {
      console.warn("QuickPanel local storage could not be read.", err);
      return defaults();
    }
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      updateCounts();
      return true;
    } catch (err) {
      console.error("QuickPanel local storage could not be written.", err);
      setStatus("backupStatus", "Browser storage is full or blocked. Export your data, or reduce saved content.");
      toast("Could not save: browser storage may be full or blocked.");
      return false;
    }
  }

  function uid() {
    return (globalThis.crypto && typeof crypto.randomUUID === "function")
      ? crypto.randomUUID()
      : "qp-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }
  function text(el) { return String(el && el.value || ""); }
  function safeString(value, max = 30000) { return typeof value === "string" ? value.slice(0, max) : ""; }
  function escapeUrl(value) {
    const candidate = safeString(value, 2048).trim();
    if (!candidate) return "";
    try {
      const url = new URL(candidate);
      return (url.protocol === "https:" || url.protocol === "http:") ? url.href : "";
    } catch (_) { return ""; }
  }
  function setStatus(id, message) { const node = $(id); if (node) node.textContent = message || ""; }
  function toast(message) {
    const el = $("toast");
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove("show"), 2600);
  }
  async function copyText(value, success = "Copied to clipboard.") {
    const content = String(value ?? "");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(content);
      } else {
        const tmp = document.createElement("textarea");
        tmp.value = content; tmp.setAttribute("readonly", "");
        tmp.style.position = "fixed"; tmp.style.opacity = "0"; tmp.style.top = "0";
        document.body.appendChild(tmp); tmp.select();
        const ok = document.execCommand("copy"); tmp.remove();
        if (!ok) throw new Error("Clipboard permission was not available.");
      }
      toast(success);
      return true;
    } catch (_) {
      toast("Clipboard access was blocked. Select the text and copy it manually.");
      return false;
    }
  }
  function downloadText(name, content, type = "application/json") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = name; link.rel = "noopener";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1200);
  }
  function updateCounts() {
    $("snippetCount").textContent = String(state.snippets.length);
    $("clipCount").textContent = String(state.clips.length);
  }
  function setView(id) {
    views.forEach(viewId => {
      const section = $(viewId);
      const active = viewId === id;
      section.hidden = !active;
      section.classList.toggle("active", active);
    });
    document.querySelectorAll(".nav-item").forEach(btn => {
      const active = btn.dataset.view === id;
      btn.classList.toggle("active", active);
      if (active) btn.setAttribute("aria-current", "page"); else btn.removeAttribute("aria-current");
    });
    if (id === "snippetsView") renderSnippets();
    if (id === "clipsView") renderClips();
    if (id === "profileView") renderProfile();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }
  function cleanCaseTitle(input) {
    return input.toLocaleLowerCase().replace(/(^|[\s\-\/])([a-z\p{L}])/gu, function (match, gap, ch) { return gap + ch.toLocaleUpperCase(); });
  }

  // Text toolkit
  $("textInput").addEventListener("input", () => setStatus("textStatus", ""));
  document.querySelectorAll("[data-action]").forEach(button => {
    button.addEventListener("click", () => {
      const source = text($("textInput"));
      const lines = source.split(/\r?\n/);
      let output = source;
      switch (button.dataset.action) {
        case "trim": output = lines.map(line => line.trim()).join("\n"); break;
        case "dedupe": {
          const seen = new Set();
          output = lines.filter(line => { const key = line.trim(); if (seen.has(key)) return false; seen.add(key); return true; }).join("\n");
          break;
        }
        case "blank": output = lines.filter(line => line.trim()).join("\n"); break;
        case "upper": output = source.toLocaleUpperCase(); break;
        case "lower": output = source.toLocaleLowerCase(); break;
        case "title": output = cleanCaseTitle(source); break;
        case "urls": {
          const matches = source.match(/https?:\/\/[^\s<>"'\])}]+/gi) || [];
          output = [...new Set(matches.map(x => x.replace(/[.,;!?]+$/, "")))].join("\n");
          break;
        }
        case "words": {
          const words = source.trim() ? (source.trim().match(/\S+/g) || []).length : 0;
          $("textOutput").value = "Words: " + words + "\nCharacters: " + source.length + "\nCharacters (without spaces): " + source.replace(/\s/g, "").length + "\nLines: " + (source ? lines.length : 0);
          setStatus("textStats", "Counted");
          setStatus("textStatus", "Counts are based on the text in the input box.");
          return;
        }
      }
      $("textOutput").value = output;
      setStatus("textStats", output.length.toLocaleString() + " characters");
      setStatus("textStatus", output === source ? "Result ready. The selected action did not change this text." : "Result ready. Copy it or use it as the next input.");
    });
  });
  $("copyTextResult").addEventListener("click", () => copyText(text($("textOutput")), "Result copied."));
  $("useTextResult").addEventListener("click", () => { $("textInput").value = text($("textOutput")); setStatus("textStatus", "Result moved to input."); $("textInput").focus(); });
  $("clearText").addEventListener("click", () => { $("textInput").value = ""; $("textOutput").value = ""; setStatus("textStats", "Ready when you are"); setStatus("textStatus", ""); $("textInput").focus(); });

  // Snippets
  function renderSnippets() {
    const query = text($("snippetSearch")).trim().toLocaleLowerCase();
    const items = state.snippets.filter(item => (safeString(item.title) + "\n" + safeString(item.content)).toLocaleLowerCase().includes(query));
    const root = $("snippetsList"); root.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("div"); empty.className = "empty-state";
      empty.textContent = query ? "No snippets match this search." : "No snippets saved yet. Add a useful reply or text block above.";
      root.appendChild(empty); return;
    }
    items.slice().sort((a,b) => String(b.updatedAt || "").localeCompare(String(a.updatedAt || ""))).forEach(item => {
      const card = document.createElement("article"); card.className = "record-card";
      const head = document.createElement("div"); head.className = "record-top";
      const metaWrap = document.createElement("div");
      const title = document.createElement("div"); title.className = "record-title"; title.textContent = safeString(item.title, 120);
      const meta = document.createElement("div"); meta.className = "record-meta"; meta.textContent = item.updatedAt ? "Updated " + formatDate(item.updatedAt) : "Saved locally";
      metaWrap.append(title, meta); head.append(metaWrap);
      const body = document.createElement("p"); body.className = "record-body"; body.textContent = safeString(item.content, 50000);
      const actions = document.createElement("div"); actions.className = "record-actions";
      actions.append(actionButton("Copy", () => copyText(item.content, "Snippet copied.")),
        actionButton("Edit", () => editSnippet(item)),
        actionButton("Delete", () => deleteSnippet(item.id), true));
      card.append(head, body, actions); root.appendChild(card);
    });
  }
  function actionButton(label, action, danger = false) {
    const button = document.createElement("button"); button.type = "button"; button.className = "mini-button" + (danger ? " danger" : "");
    button.textContent = label; button.addEventListener("click", action); return button;
  }
  $("snippetForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = text($("snippetName")).trim(), content = text($("snippetContent")).trimEnd();
    if (!title || !content) { setStatus("snippetStatus", "Add both a title and some content."); return; }
    const id = text($("snippetId"));
    const existing = state.snippets.find(item => item.id === id);
    const item = { id: id || uid(), title: title.slice(0,120), content: content.slice(0,50000), createdAt: (existing && existing.createdAt) || new Date().toISOString(), updatedAt: new Date().toISOString() };
    state.snippets = id ? state.snippets.map(x => x.id === id ? item : x) : [item, ...state.snippets];
    if (persist()) { clearSnippetForm(); renderSnippets(); setStatus("snippetStatus", "Snippet saved locally."); }
  });
  function editSnippet(item) {
    $("snippetId").value = item.id; $("snippetName").value = safeString(item.title); $("snippetContent").value = safeString(item.content);
    $("saveSnippet").textContent = "Save changes"; $("cancelSnippet").hidden = false;
    $("snippetName").focus(); window.scrollTo({top:0,behavior:"smooth"});
  }
  function deleteSnippet(id) {
    if (!window.confirm("Delete this snippet from this browser?")) return;
    state.snippets = state.snippets.filter(item => item.id !== id);
    if (persist()) { renderSnippets(); setStatus("snippetStatus", "Snippet deleted."); }
  }
  function clearSnippetForm() { $("snippetForm").reset(); $("snippetId").value = ""; $("saveSnippet").textContent = "Save snippet"; $("cancelSnippet").hidden = true; }
  $("cancelSnippet").addEventListener("click", clearSnippetForm);
  $("snippetSearch").addEventListener("input", renderSnippets);

  // Research clips
  $("clipForm").addEventListener("submit", event => {
    event.preventDefault();
    const title = text($("clipTitle")).trim(), rawUrl = text($("clipUrl")).trim(), body = text($("clipText")).trim();
    const url = escapeUrl(rawUrl);
    if (!title) { setStatus("clipStatus", "Add a title for this clip."); return; }
    if (rawUrl && !url) { setStatus("clipStatus", "Please use a complete http:// or https:// URL."); return; }
    const clip = { id: uid(), title: title.slice(0,180), url: url, text: body.slice(0,30000), createdAt: new Date().toISOString() };
    state.clips = [clip, ...state.clips];
    if (persist()) { $("clipForm").reset(); renderClips(); setStatus("clipStatus", "Research clip saved locally."); }
  });
  function renderClips() {
    const query = text($("clipSearch")).trim().toLocaleLowerCase();
    const items = state.clips.filter(item => [item.title,item.url,item.text].some(value => safeString(value).toLocaleLowerCase().includes(query)));
    const root = $("clipsList"); root.replaceChildren();
    if (!items.length) {
      const empty = document.createElement("div"); empty.className = "empty-state";
      empty.textContent = query ? "No saved clips match this search." : "No clips saved yet. Capture a source title, URL and useful excerpt or notes.";
      root.appendChild(empty); return;
    }
    items.slice().sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || ""))).forEach(item => {
      const card = document.createElement("article"); card.className = "record-card";
      const head = document.createElement("div"); head.className = "record-top";
      const wrap = document.createElement("div");
      const title = document.createElement("div"); title.className = "record-title"; title.textContent = safeString(item.title,180);
      const meta = document.createElement("div"); meta.className = "record-meta"; meta.textContent = (item.createdAt ? formatDate(item.createdAt) : "Saved locally") + (item.url ? " · " + item.url : "");
      wrap.append(title,meta); head.appendChild(wrap);
      const body = document.createElement("p"); body.className = "record-body"; body.textContent = safeString(item.text,30000);
      const actions = document.createElement("div"); actions.className = "record-actions";
      actions.append(actionButton("Copy clip", () => copyText([item.title,item.url,item.text].filter(Boolean).join("\n\n"), "Clip copied.")));
      if (escapeUrl(item.url)) {
        const link = document.createElement("a"); link.className = "mini-button"; link.textContent = "Open source"; link.href = escapeUrl(item.url); link.target = "_blank"; link.rel = "noopener noreferrer"; actions.appendChild(link);
      }
      actions.appendChild(actionButton("Delete", () => deleteClip(item.id), true));
      card.append(head); if (item.text) card.append(body); card.append(actions); root.appendChild(card);
    });
  }
  function deleteClip(id) {
    if (!window.confirm("Delete this research clip from this browser?")) return;
    state.clips = state.clips.filter(item => item.id !== id);
    if (persist()) { renderClips(); setStatus("clipStatus", "Clip deleted."); }
  }
  $("clipSearch").addEventListener("input", renderClips);
  $("shareClipText").addEventListener("click", async () => {
    const title = text($("clipTitle")).trim();
    const url = escapeUrl(text($("clipUrl")));
    const excerpt = text($("clipText")).trim();
    const shareText = [title, url, excerpt].filter(Boolean).join("\n\n");
    if (!shareText) { setStatus("clipStatus", "Add text to share first."); return; }
    try {
      if (navigator.share) { await navigator.share({ title: title || "QuickPanel clip", text: shareText, url: url || undefined }); }
      else await copyText(shareText, "Clip copied so you can share it in another app.");
    } catch (err) {
      if (err && err.name !== "AbortError") toast("Sharing is not available here. Try Copy clip from a saved item.");
    }
  });

  // Table converter: HTML is parsed into an inert document; markup is never inserted into this page.
  function parseHtmlTable(input) {
    if (!/<table\b/i.test(input)) return null;
    try {
      const doc = new DOMParser().parseFromString(input, "text/html");
      const table = doc.querySelector("table"); if (!table) return null;
      const rows = Array.from(table.querySelectorAll("tr")).map(tr => Array.from(tr.querySelectorAll("th,td")).map(cell => cell.textContent.trim()));
      return rows.filter(row => row.some(cell => cell !== ""));
    } catch (_) { return null; }
  }
  function parseDelimited(input, delimiter) {
    const rows = []; let row = [], field = "", quoted = false;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (ch === '"' && quoted && input[i+1] === '"') { field += '"'; i++; }
      else if (ch === '"') quoted = !quoted;
      else if (ch === delimiter && !quoted) { row.push(field); field = ""; }
      else if ((ch === "\n" || ch === "\r") && !quoted) {
        if (ch === "\r" && input[i+1] === "\n") i++;
        row.push(field); if (row.some(cell => cell.trim() !== "")) rows.push(row);
        row = []; field = "";
      } else field += ch;
    }
    row.push(field); if (row.some(cell => cell.trim() !== "")) rows.push(row);
    return rows.map(cells => cells.map(cell => cell.trim()));
  }
  function parseTableInput(input) {
    const htmlRows = parseHtmlTable(input); if (htmlRows && htmlRows.length) return htmlRows;
    const delimiter = input.includes("\t") ? "\t" : ",";
    return parseDelimited(input, delimiter);
  }
  function csvCell(value, delim = ",") {
    const textValue = String(value ?? "");
    return (textValue.includes(delim) || /["\r\n]/.test(textValue)) ? '"' + textValue.replace(/"/g,'""') + '"' : textValue;
  }
  function formatRows(rows, format) {
    if (format === "json") {
      const headers = (rows[0] || []).map((h,i) => h || "column_" + (i+1));
      return JSON.stringify(rows.slice(1).map(row => Object.fromEntries(headers.map((header,i) => [header, row[i] || ""]))), null, 2);
    }
    if (format === "markdown") {
      if (!rows.length) return "";
      const width = Math.max.apply(null,rows.map(row => row.length));
      const padded = rows.map(row => Array.from({length:width},(_,i) => String(row[i] ?? "").replace(/\|/g,"\\|").replace(/\r?\n/g," ")));
      const rule = Array.from({length:width},() => "---");
      return [padded[0],rule].concat(padded.slice(1)).map(row => "| " + row.join(" | ") + " |").join("\n");
    }
    const delimiter = format === "tsv" ? "\t" : ",";
    return rows.map(row => row.map(cell => csvCell(cell,delimiter)).join(delimiter)).join("\n");
  }
  function renderTablePreview(rows) {
    const root = $("tablePreview"); root.replaceChildren();
    const table = document.createElement("table"), body = document.createElement("tbody");
    rows.slice(0,500).forEach((row,index) => {
      const tr = document.createElement("tr");
      row.forEach(value => {
        const cell = document.createElement(index === 0 ? "th" : "td");
        cell.textContent = value; tr.appendChild(cell);
      });
      body.appendChild(tr);
    });
    table.appendChild(body); root.appendChild(table);
  }
  $("parseTable").addEventListener("click", () => {
    const input = text($("tableInput")).trim();
    if (!input) { setStatus("tableStatus","Paste some table content first."); return; }
    const rows = parseTableInput(input);
    if (!rows.length) { parsedRows = null; $("tablePreviewWrap").hidden = true; setStatus("tableStatus","No rows found. Check that the pasted text contains commas, tabs or an HTML table."); return; }
    parsedRows = rows.slice(0,500);
    renderTablePreview(parsedRows);
    $("tableDimensions").textContent = parsedRows.length + " rows · " + Math.max.apply(null,parsedRows.map(r => r.length)) + " columns";
    $("tablePreviewWrap").hidden = false; updateTableOutput();
    setStatus("tableStatus", rows.length > 500 ? "Preview limited to 500 rows to keep mobile devices responsive." : "Table parsed in your browser.");
  });
  function updateTableOutput() { if (parsedRows) $("tableOutput").value = formatRows(parsedRows,$("tableFormat").value); }
  $("tableFormat").addEventListener("change", updateTableOutput);
  $("copyTable").addEventListener("click", () => copyText(text($("tableOutput")),"Converted table copied."));
  $("downloadTable").addEventListener("click", () => downloadText("quickpanel-table.txt",text($("tableOutput")),"text/plain;charset=utf-8"));
  $("clearTable").addEventListener("click", () => { $("tableInput").value = ""; $("tableOutput").value = ""; $("tablePreview").replaceChildren(); $("tablePreviewWrap").hidden = true; parsedRows = null; setStatus("tableStatus",""); });

  // Local profile: copy-only in this web app. No auto-fill access to other sites.
  function readProfileForm() {
    return Object.fromEntries(PROFILE_FIELDS.map(([key]) => [key, text($(key)).trim()]));
  }
  function renderProfile() {
    PROFILE_FIELDS.forEach(([key]) => { if (document.activeElement !== $(key)) $(key).value = safeString(state.profile[key],5000); });
    const list = $("profileCopyList"); list.replaceChildren();
    PROFILE_FIELDS.forEach(([key,label]) => {
      const value = safeString(state.profile[key],5000); if (!value) return;
      const row = document.createElement("div"); row.className = "profile-copy-row";
      const name = document.createElement("b"); name.textContent = label;
      const val = document.createElement("span"); val.textContent = value;
      row.append(name,val,actionButton("Copy", () => copyText(value, label + " copied.")));
      list.appendChild(row);
    });
    if (!list.children.length) { const hint = document.createElement("div"); hint.className = "empty-state"; hint.textContent = "Save a profile to get one-tap copy buttons for individual fields."; list.appendChild(hint); }
  }
  $("profileForm").addEventListener("submit", event => {
    event.preventDefault();
    state.profile = readProfileForm();
    if (persist()) { renderProfile(); setStatus("profileStatus","Profile saved locally on this device."); }
  });
  $("copyProfile").addEventListener("click", () => {
    const profile = readProfileForm();
    const formatted = PROFILE_FIELDS.map(([key,label]) => profile[key] ? label + ": " + profile[key] : "").filter(Boolean).join("\n");
    if (!formatted) { setStatus("profileStatus","Enter at least one detail first."); return; }
    copyText(formatted,"Profile copied.");
  });
  $("exportProfile").addEventListener("click", () => {
    const profile = readProfileForm();
    downloadText("quickpanel-profile.json",JSON.stringify({version:1,profile:profile,exportedAt:new Date().toISOString()},null,2));
    setStatus("profileStatus","Profile export created.");
  });

  // Backup / restore
  function exportPayload() {
    return { source:"YorpHives QuickPanel", version:1, exportedAt:new Date().toISOString(), data:state };
  }
  $("exportAll").addEventListener("click", () => {
    downloadText("quickpanel-backup-" + new Date().toISOString().slice(0,10) + ".json",JSON.stringify(exportPayload(),null,2));
    setStatus("backupStatus","Backup download started.");
  });
  function validateImported(input) {
    const incoming = input && input.data && typeof input.data === "object" ? input.data : input;
    const snippets = Array.isArray(incoming && incoming.snippets) ? incoming.snippets.slice(0,5000).map(item => ({
      id: safeString(item && item.id,120) || uid(), title: safeString(item && item.title,120).trim(),
      content: safeString(item && item.content,50000), createdAt: safeString(item && item.createdAt,80) || new Date().toISOString(),
      updatedAt: safeString(item && item.updatedAt,80) || new Date().toISOString()
    })).filter(item => item.title && item.content) : [];
    const clips = Array.isArray(incoming && incoming.clips) ? incoming.clips.slice(0,5000).map(item => ({
      id: safeString(item && item.id,120) || uid(), title: safeString(item && item.title,180).trim(),
      url: escapeUrl(item && item.url), text: safeString(item && item.text,30000), createdAt: safeString(item && item.createdAt,80) || new Date().toISOString()
    })).filter(item => item.title) : [];
    const rawProfile = incoming && incoming.profile && typeof incoming.profile === "object" && !Array.isArray(incoming.profile) ? incoming.profile : {};
    const allowedKeys = new Set(PROFILE_FIELDS.map(([key]) => key));
    const profile = {};
    Object.keys(rawProfile).forEach(key => { if (allowedKeys.has(key)) profile[key] = safeString(rawProfile[key],5000); });
    if (!(incoming && Array.isArray(incoming.snippets)) && !(incoming && Array.isArray(incoming.clips)) && !Object.keys(profile).length) {
      throw new Error("This file does not look like a QuickPanel backup.");
    }
    return { version:1, snippets:snippets, clips:clips, profile:profile };
  }
  $("importFile").addEventListener("change", async event => {
    const file = event.target.files && event.target.files[0]; if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("The backup is larger than 10 MB.");
      const parsed = JSON.parse(await file.text());
      pendingImport = validateImported(parsed);
      $("importChoices").hidden = false;
      setStatus("backupStatus","Backup ready: " + pendingImport.snippets.length + " snippets, " + pendingImport.clips.length + " clips. Choose merge or replace.");
    } catch (err) {
      pendingImport = null; $("importChoices").hidden = true;
      setStatus("backupStatus",err.message || "Could not read that backup file.");
    }
  });
  function applyImport(mode) {
    if (!pendingImport) return;
    if (mode === "replace") {
      state = pendingImport;
    } else {
      const merge = (current, incoming) => {
        const byId = new Map(current.map(item => [item.id,item]));
        incoming.forEach(item => byId.set(item.id,item));
        return Array.from(byId.values());
      };
      state = { version:1, snippets:merge(state.snippets,pendingImport.snippets), clips:merge(state.clips,pendingImport.clips), profile:Object.assign({},state.profile,pendingImport.profile) };
    }
    if (persist()) {
      pendingImport = null; $("importFile").value = ""; $("importChoices").hidden = true;
      renderSnippets(); renderClips(); renderProfile();
      setStatus("backupStatus",mode === "replace" ? "Local data was replaced with the selected backup." : "Backup merged into this device's local data.");
      toast("Backup imported.");
    }
  }
  $("mergeImport").addEventListener("click", () => applyImport("merge"));
  $("replaceImport").addEventListener("click", () => {
    if (window.confirm("Replace all QuickPanel data on this device with the selected backup?")) applyImport("replace");
  });
  $("clearAllData").addEventListener("click", () => {
    if (!window.confirm("Delete all QuickPanel snippets, research clips and profile values from this browser? Export a backup first if you may need them.")) return;
    state = defaults();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
    persist(); clearSnippetForm(); $("clipForm").reset(); $("profileForm").reset();
    renderSnippets(); renderClips(); renderProfile();
    setStatus("backupStatus","All saved QuickPanel data was cleared from this browser.");
  });

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "recently";
    try { return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(date); } catch (_) { return date.toLocaleString(); }
  }

  // Install flow and offline status
  function showInstallHelp() {
    const ua = navigator.userAgent || "";
    let instructions;
    if (/iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) {
      instructions = "<p>On iPhone or iPad:</p><ol><li>Open this page in <b>Safari</b>.</li><li>Tap the <b>Share</b> button.</li><li>Choose <b>Add to Home Screen</b>. You may need to scroll the share-sheet actions.</li><li>Tap <b>Add</b> to place QuickPanel on your Home Screen.</li></ol><p>For best offline results, open QuickPanel once while connected before using it offline.</p>";
    } else if (/Android/i.test(ua)) {
      instructions = "<p>On Android:</p><ol><li>Open QuickPanel in a supported browser such as Chrome.</li><li>Open the browser menu and choose <b>Install app</b> or <b>Add to Home screen</b>, if offered.</li><li>Confirm the installation and launch QuickPanel from your app list.</li></ol><p>The exact wording depends on the browser.</p>";
    } else {
      instructions = "<p>On desktop:</p><ol><li>Use a compatible browser and open QuickPanel while online.</li><li>Look for an install icon in the address bar, or open the browser menu.</li><li>Choose <b>Install QuickPanel</b> or <b>Install page as app</b> if available.</li></ol><p>Other browsers may let you bookmark this page but not install it as an app.</p>";
    }
    $("installInstructions").innerHTML = instructions;
    const dialog = $("installDialog");
    if (typeof dialog.showModal === "function") dialog.showModal(); else alert($("installInstructions").textContent);
  }
  $("installButton").addEventListener("click", async () => {
    if (installPrompt) {
      installPrompt.prompt();
      await installPrompt.userChoice;
      installPrompt = null;
      $("installButton").hidden = true;
    } else showInstallHelp();
  });
  $("installHelp").addEventListener("click", showInstallHelp);
  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault(); installPrompt = event;
    $("installButton").textContent = "Install app"; $("installButton").hidden = false;
  });
  window.addEventListener("appinstalled", () => {
    installPrompt = null; $("installButton").hidden = true; toast("QuickPanel is installed.");
  });
  function updateConnection() {
    const el = $("connectionStatus");
    const online = navigator.onLine;
    el.classList.toggle("offline",!online);
    el.lastChild.textContent = online ? " Online" : " Offline-ready";
  }
  window.addEventListener("online",updateConnection);
  window.addEventListener("offline",updateConnection);
  updateConnection();
  const standalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  if (standalone) $("installButton").hidden = true;
  else { $("installButton").hidden = false; $("installButton").textContent = "Install / help"; }
  if ("serviceWorker" in navigator && window.isSecureContext) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/quickpanel/sw.js",{scope:"/quickpanel/"}).then(reg => {
        if (reg.waiting) toast("QuickPanel has an update ready. Reload to use it.");
      }).catch(err => console.warn("QuickPanel offline support could not be registered.",err));
    });
  }

  document.querySelectorAll(".nav-item").forEach(btn => btn.addEventListener("click",() => setView(btn.dataset.view)));
  updateCounts();
  renderSnippets();
  renderClips();
  renderProfile();
  const initialView = location.hash.slice(1);
  if (views.includes(initialView)) setView(initialView);
})();