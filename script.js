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
  fetch("te.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("te-placeholder").innerHTML = data;
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




  document.addEventListener('DOMContentLoaded', function() {
  // For date inputs that don't support placeholder
  const dateInputs = document.querySelectorAll('input[type="date"]');
  dateInputs.forEach(input => {
    // Check if the placeholder is shown (some browsers will show it)
    if (!input.hasAttribute('placeholder')) {
      const label = input.nextElementSibling;
      if (label && label.classList.contains('placeholder')) {
        // Show the label as placeholder
        label.style.display = 'block';
      }
    }
  });

  // For time inputs that don't support placeholder
  const timeInputs = document.querySelectorAll('input[type="time"]');
  timeInputs.forEach(input => {
    if (!input.hasAttribute('placeholder')) {
      const label = input.nextElementSibling;
      if (label && label.classList.contains('placeholder')) {
        label.style.display = 'block';
      }
    }
  });
});