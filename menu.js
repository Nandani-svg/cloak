const settingList = [
"cookies",
"javascript",
"popups",
"camera",
"microphone",
"clipboard",
"location",
"notifications",
];

let activeTabOrigin = "";

document.addEventListener("DOMContentLoaded", () => {
if (typeof chrome === "undefined" || !chrome.tabs?.query) {

activeTabOrigin = "https://example.com/*";
document.getElementById("site-host").textContent = "example.com";
document.getElementById("siteURL").textContent = activeTabOrigin;
settingList.forEach(setting => {
const el = document.getElementById(setting);
if (el) el.checked = true;
});
setupHandlers();
return;
}

chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
const activeTab = tabs?.[0];
if (!activeTab?.url) {
document.getElementById("site-host").textContent = "No active tab";
document.getElementById("siteURL").textContent = "";
return;
}

const { url } = activeTab;


if (/^(chrome|edge|chrome-extension|about|view-source):/.test(url)) {
document.getElementById("systemNotice").style.display = "block";
document.getElementById("site-host").textContent = "System Page";
document.getElementById("siteURL").textContent = url;
document.getElementById("sslBadge")?.remove();
settingList.forEach(setting => {
const el = document.getElementById(setting);
if (el) el.disabled = true;
});
return;
}

try {
const parsedUrl = new URL(url);
activeTabOrigin = `${parsedUrl.origin}/*`;

document.getElementById("site-host").textContent = parsedUrl.hostname || parsedUrl.origin;
document.getElementById("siteURL").textContent = activeTabOrigin;

if(activeTab.favIconUrl) {
const faviconWrapper = document.getElementById("siteFavicon");
if (faviconWrapper) {
faviconWrapper.innerHTML = `<img src="${activeTab.favIconUrl}" alt="favicon" onerror="this.remove()">`;
    }
}

const sslBadge = document.getElementById("sslBadge");
if (sslBadge && parsedUrl.protocol !== "https:") {
 sslBadge.textContent = "Not Secure";
 sslBadge.classList.add("insecure");
}
} catch {
 document.getElementById("site-host").textContent = url;
 document.getElementById("siteURL").textContent = url;
}


settingList.forEach(setting => {
 chrome.contentSettings[setting].get({ primaryUrl: url }, details => {
 const checkbox = document.getElementById(setting);
 if (checkbox) {
  checkbox.checked = details?.setting === "allow" || details?.setting === "session_only";
 }
 });
});

setupHandlers(activeTab.id);
});
});

function setupHandlers(tabId) {

settingList.forEach(setting => {
 const checkbox = document.getElementById(setting);
 if (!checkbox) return;

checkbox.onchange = () => {
 if (typeof chrome === "undefined" || !chrome.contentSettings || !activeTabOrigin) return;

chrome.contentSettings[setting].set(
 {
 primaryPattern: activeTabOrigin,
 setting: checkbox.checked ? "allow" : "block"
 },
 () => {
 if (tabId) {
    chrome.tabs.reload(tabId);
 } else {
    chrome.tabs.reload();
 }
 }
);
};
});


document.getElementById("btnReload")?.addEventListener("click", () => {
 if (tabId) {
 chrome.tabs.reload(tabId);
 } else if (typeof chrome !== "undefined" && chrome.tabs?.reload) {
 chrome.tabs.reload();
 }
});


document.getElementById("btnClearSiteData")?.addEventListener("click", () => {
 if(!confirm("Clear cookies and cached storage for this site?")) return;

if (typeof chrome !== "undefined" && chrome.browsingData && activeTabOrigin) {
 const originClean = activeTabOrigin.replace("/*", "");
 chrome.browsingData.remove(
 { origins: [originClean] },
 {
   cache: true,
   cookies: true,
   fileSystem: true,
   indexedDB: true,
   localStorage: true,
   serviceWorkers: true,
   webSQL: true
 },
 () => {
   if (tabId) {
   chrome.tabs.reload(tabId);
   } else if (chrome.tabs?.reload) {
      chrome.tabs.reload();
   }
 }
);
}
});
}