// Mobile nav toggle
const navToggle = document.querySelector('.nav-toggle');
const nav = document.getElementById('nav');
if (navToggle && nav) {
  navToggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
  });
}

// Smooth scroll for in-page links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Close mobile nav after click
      nav?.classList.remove('open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });
});

// Contact form (demo only)
const form = document.getElementById('contactForm');
form?.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(form);
  const name = data.get('name') || 'there';
  alert(`Thanks, ${name}! We received your message and will reach out shortly.`);
  form.reset();
});

// Footer year
const y = document.getElementById('year');
if (y) y.textContent = String(new Date().getFullYear());
