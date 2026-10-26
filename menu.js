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
if (typeof chrome === "undefined" || !chrome.tab?.query) {

activeTabOrigin = "https://example.com/*";
document.getElementById("siteHost").textContent = "example.com";
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
document.getElementById("siteHost").textContent = "No active tab";
document.getElementById("siteURL").textContent = "";
return;
}

const { url } = activeTab;


if (/^(chrome|edge|chrome-extension|about|view-source):/.test(url)) {
document.getElementById("systemNotice").style.display = "block";
document.getElementById("siteHost").textContent = "System Page";
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

document.getElementById("siteHost").textContent = parsedUrl.hostname || parsedUrl.origin;
document.getElementById("siteURL").textContent = activeTabOrigin;

if(activeTab.favIconUrl) {
const faviconWrapper = document.getElementById("siteFavicon");
if (faviconWrapper) {
faviconWrapper.innerHTML = `<img src="${activeTab.favIconUrl}" alt="favicon" onerror="this.remove()">`;
    }
}