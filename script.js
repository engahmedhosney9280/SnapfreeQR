(function () {
  // Mobile nav toggle — runs on every page, even ones without the QR tool
  var navToggle = document.getElementById("nav-toggle");
  var topNav = document.getElementById("top-nav");

  if (navToggle && topNav) {
    navToggle.addEventListener("click", function () {
      var isOpen = topNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    topNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        topNav.classList.remove("is-open");
        navToggle.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // FAQ accordion: close others when one opens, for a tidier list
  document.querySelectorAll(".faq-item").forEach(function (item) {
    item.addEventListener("toggle", function () {
      if (item.open) {
        document.querySelectorAll(".faq-item").forEach(function (other) {
          if (other !== item) other.open = false;
        });
      }
    });
  });

  // Everything below only applies on the page that has the QR generator
  var input = document.getElementById("qr-input");
  if (!input) return;

  var colorPicker = document.getElementById("qr-color");
  var sizeSelect = document.getElementById("qr-size");
  var downloadBtn = document.getElementById("qr-download");
  var wrap = document.getElementById("qr-canvas-wrap");
  var encodedPreview = document.getElementById("qr-encoded-preview");
  var swatches = document.querySelectorAll(".swatch");

  var qrInstance = null;
  var debounceTimer = null;

  function showPlaceholder() {
    wrap.innerHTML = '<div class="qr-placeholder">Your QR code will appear here as you type</div>';
    downloadBtn.disabled = true;
  }

  function render() {
    var text = input.value.trim();

    if (!text) {
      showPlaceholder();
      encodedPreview.textContent = "";
      return;
    }

    wrap.innerHTML = "";
    var size = parseInt(sizeSelect.value, 10) || 260;

    qrInstance = new QRCode(wrap, {
      text: text,
      width: size,
      height: size,
      colorDark: colorPicker.value,
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H
    });

    downloadBtn.disabled = false;
    encodedPreview.textContent = text.length > 60 ? text.slice(0, 60) + "…" : text;
  }

  function scheduleRender() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 180);
  }

  function getImageDataUrl() {
    var canvas = wrap.querySelector("canvas");
    if (canvas) return canvas.toDataURL("image/png");
    var img = wrap.querySelector("img");
    if (img) return img.src;
    return null;
  }

  function download() {
    var dataUrl = getImageDataUrl();
    if (!dataUrl) return;
    var link = document.createElement("a");
    link.href = dataUrl;
    link.download = "qr-code.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  input.addEventListener("input", scheduleRender);
  colorPicker.addEventListener("input", render);
  sizeSelect.addEventListener("change", render);
  downloadBtn.addEventListener("click", download);

  swatches.forEach(function (sw) {
    sw.addEventListener("click", function () {
      colorPicker.value = sw.dataset.color;
      render();
    });
  });

  showPlaceholder();
})();