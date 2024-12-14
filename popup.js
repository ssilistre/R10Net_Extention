// Popup içeriği yüklendiğinde çalışır
document.addEventListener("DOMContentLoaded", () => {
  // Ayarları yükle
  chrome.storage.sync.get(["hideAds", "sendNotifications", "pollingInterval"], (data) => {
    document.getElementById("toggleAds").checked = data.hideAds || false;
    document.getElementById("sendNotifications").checked = data.sendNotifications || false;
    document.getElementById("pollingInterval").value = data.pollingInterval || "60000";
  });

  // Okunmamış bildirim ve mesaj sayısını güncelle
  chrome.storage.sync.get(["unreadNotifications", "unreadMessages"], (data) => {
    const totalUnread = (data.unreadNotifications || 0) + (data.unreadMessages || 0);
    document.getElementById("unreadCount").textContent = totalUnread > 0 ? totalUnread : "0";
  });

  // Ayarları kaydetme
  document.getElementById("saveSettings").addEventListener("click", () => {
    const hideAds = document.getElementById("toggleAds").checked;
    const sendNotifications = document.getElementById("sendNotifications").checked;
    const pollingInterval = document.getElementById("pollingInterval").value;

    chrome.storage.sync.set({ hideAds, sendNotifications, pollingInterval }, () => {
      alert("Ayarlar kaydedildi!");
    });
  });
});