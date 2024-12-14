const hideElementsBySelectors = (selectors) => {
  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((el) => {
      el.style.display = "none";
    });
  });
};

// Reklamları gizlemek için kullanılan seçiciler
const selectorsToHide = [
  "section.topbar",
  'div[class^="rc"]',
  'li[class^="ra"]',
  '[data-cname^="topbar"]',
  'div[class^="rPanel nonbg"]',
  '[data-cname^="footer-ad"]',
  '[data-cname^="popup-ad"]',
  "div[class^='threadSponsor']",
];
chrome.storage.sync.get("hideAds", (data) => {
  if (data.hideAds) {
    hideElementsBySelectors(selectorsToHide);
    console.log("Reklamlar gizlendi.");
  } else {
    console.log("Reklam gizleme devre dışı.");
  }
});