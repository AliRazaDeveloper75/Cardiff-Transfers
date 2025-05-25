// Load header and footer
document.addEventListener("DOMContentLoaded", function () {
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header-placeholder").innerHTML = data;
      initScrollEffect();
    });

  fetch("footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer-placeholder").innerHTML = data;
    });
});

// Sticky header scroll effect
function initScrollEffect() {
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
}

 function toggleMenu() {
    document.getElementById("mainNav").classList.toggle("show");
  }
