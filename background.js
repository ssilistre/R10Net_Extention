let securityToken = null;

// SECURITYTOKEN alma ve güncelleme fonksiyonu
function fetchSecurityToken(callback) {
  chrome.tabs.create({ url: "https://www.r10.net", active: false }, (tab) => {
    chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
      if (tabId === tab.id && changeInfo.status === "complete") {
        chrome.scripting.executeScript(
          {
            target: { tabId: tab.id },
            func: () => {
              const scriptContent = Array.from(document.scripts)
                .map((script) => script.textContent || script.innerText)
                .find((text) => text.includes("var SECURITYTOKEN"));
              if (scriptContent) {
                const match = scriptContent.match(/var SECURITYTOKEN = "(.*?)";/);
                return match ? match[1] : null;
              }
              return null;
            },
          },
          (results) => {
            if (results && results[0] && results[0].result) {
              securityToken = results[0].result;
              console.log("SECURITYTOKEN alındı:", securityToken);
              if (callback) callback();
            } else {
              console.error("SECURITYTOKEN alınamadı.");
            }
            chrome.tabs.remove(tab.id);
            chrome.tabs.onUpdated.removeListener(listener);
          }
        );
      }
    });
  });
}

// Bildirimleri ve mesajları kontrol eden fonksiyon
async function fetchNotifications() {
  if (!securityToken) {
    console.log("Güvenlik tokeni alınamadı, yenileniyor...");
    fetchSecurityToken(fetchNotifications);
    return;
  }

  try {
    const response = await fetch("https://www.r10.net/ajax.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: new URLSearchParams({
        do: "bildirimlerx",
        detail: 1,
        securitytoken: securityToken,
      }),
    });

    if (response.ok) {
      const xmlText = await response.text();
      console.log("XML Verisi Alındı:", xmlText);

      // Okunmamış sayıları ayrıştır
      const unreadNotifications = parseInt(
        (xmlText.match(/<okunmamisBildirimSayi>(\d+)<\/okunmamisBildirimSayi>/) || [])[1] || 0
      );
      const unreadMessages = parseInt(
        (xmlText.match(/<okunmamisOzelMesajSayi>(\d+)<\/okunmamisOzelMesajSayi>/) || [])[1] || 0
      );

      chrome.storage.sync.set({ unreadNotifications, unreadMessages });

      // Bildirim gönderme ayarı etkinse bildirim oluştur
      chrome.storage.sync.get("sendNotifications", (data) => {
        if (data.sendNotifications) {
          const totalUnread = unreadNotifications + unreadMessages;
          if (totalUnread > 0) {
            chrome.notifications.create({
              type: "basic",
              iconUrl: "icons/icon48.png",
              title: "R10 Yardımcısı",
              message: `Okunmamış: ${totalUnread} mesaj ve bildirim var.`,
            });
          }
        }
      });

      // Badge güncelle
      updateBadge(unreadNotifications, unreadMessages);
    } else {
      console.error(`HTTP Hatası: ${response.status}`);
    }
  } catch (error) {
    console.error("Bildirim kontrolü sırasında hata:", error.message);
  }
}

// Badge güncelleme
function updateBadge(unreadNotifications, unreadMessages) {
  const totalUnread = unreadNotifications + unreadMessages;
  chrome.action.setBadgeText({ text: totalUnread > 0 ? totalUnread.toString() : "" });
  chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
}

// Bildirimleri düzenli aralıklarla kontrol et
function startPolling() {
  chrome.storage.sync.get("pollingInterval", (data) => {
    const interval = parseInt(data.pollingInterval) || 60000;
    setInterval(fetchNotifications, interval);
    console.log(`Bildirim kontrol aralığı: ${interval} ms`);
  });
}

// Başlangıç işlemleri
function initialize() {
  fetchSecurityToken(() => {
    fetchNotifications();
    startPolling();
  });
}

// İlk başlatma
initialize();