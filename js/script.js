document.addEventListener('DOMContentLoaded', () => {
  const blobs = document.querySelectorAll('.blob');
  let currentScroll = 0;

  function handleScroll() {
    currentScroll = window.pageYOffset;
    blobs.forEach((blob, index) => {
      const xOffset = Math.sin(currentScroll / 100 + index * 0.5) * 340;
      const yOffset = Math.cos(currentScroll / 100 + index * 0.5) * 40;
      blob.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
    });
    requestAnimationFrame(handleScroll);
  }

  window.addEventListener('scroll', handleScroll);
});

function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\//.test(path)) return path;
  return String(path).replace(/^\/+/, '');
}

// Welcome screen — single source of truth for first vs. return visits
(function manageWelcomeScreen() {
  const welcomeScreen = document.getElementById('welcome-screen');
  const mainContent = document.getElementById('main-content');

  let hasVisited = false;
  try {
    hasVisited = sessionStorage.getItem('visited_session') === '1';
    if (!hasVisited) sessionStorage.setItem('visited_session', '1');
  } catch {}

  function revealContent() {
    if (welcomeScreen) {
      welcomeScreen.style.opacity = '0';
      welcomeScreen.style.pointerEvents = 'none';
      setTimeout(() => {
        if (welcomeScreen) welcomeScreen.style.display = 'none';
        if (mainContent) mainContent.style.display = 'block';
        if (typeof initializePage === 'function') initializePage();
      }, 600);
    } else {
      if (mainContent) mainContent.style.display = 'block';
      if (typeof initializePage === 'function') initializePage();
    }
  }

  if (hasVisited) {
    // Return visit: skip welcome screen entirely
    if (welcomeScreen) welcomeScreen.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    if (typeof initializePage === 'function') initializePage();
    return;
  }

  // First visit: run typing effect on the welcome screen
  const words2 = ['www.seifsoliman.com'];
  const dynamicText2 = document.querySelector('.myweblink');
  let wordIndex2 = 0,
    charIndex2 = 0,
    isDeleting2 = false;

  function typeEffect2() {
    const currentWord = words2[wordIndex2];
    if (dynamicText2) dynamicText2.textContent = currentWord.substring(0, charIndex2);
    if (!isDeleting2 && charIndex2 < currentWord.length) {
      charIndex2++;
      setTimeout(typeEffect2, 120);
    } else if (isDeleting2 && charIndex2 > 0) {
      charIndex2--;
      setTimeout(typeEffect2, charIndex2 === 1 ? 300 : 60);
    } else if (!isDeleting2) {
      setTimeout(() => {
        isDeleting2 = true;
        typeEffect2();
      }, 1500);
    } else {
      isDeleting2 = false;
      wordIndex2 = (wordIndex2 + 1) % words2.length;
      setTimeout(typeEffect2, 300);
    }
  }
  typeEffect2();

  // Gate 1: all static assets loaded
  const windowLoadPromise = new Promise((resolve) => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });

  // Gate 2: minimum display time so the welcome screen is always seen
  const minTimePromise = new Promise((resolve) => setTimeout(resolve, 3500));

  // Gate 3: pre-fetch JSON data and preload all card images in the background
  const cardImagesPromise = Promise.all([
    fetch('/data/projects.json')
      .then((r) => r.json())
      .catch(() => []),
    fetch('/data/certificates.json')
      .then((r) => r.json())
      .catch(() => []),
    fetch('/data/techStack.json')
      .then((r) => r.json())
      .catch(() => []),
  ]).then(([projects, certs, tech]) => {
    const urls = [
      ...(projects || []).map((p) => assetUrl(p.image)),
      ...(certs || []).map((c) => assetUrl(c.image)),
      ...(tech || []).map((t) => assetUrl(t.icon)),
    ].filter(Boolean);
    return Promise.all(
      urls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new Image();
            img.onload = img.onerror = resolve;
            img.src = url;
          })
      )
    );
  });

  Promise.all([windowLoadPromise, minTimePromise, cardImagesPromise]).then(revealContent);
})();

function initializePage() {
  if (window.__pageInitialized) return;
  window.__pageInitialized = true;

  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => entry.target.classList.toggle('in-view', entry.isIntersecting)),
    { threshold: 0.1 }
  );
  sections.forEach((section) => observer.observe(section));

  async function fetchJSONData(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  let projects = [];
  let certificates = [];
  let techStack = [];

  Promise.all([
    fetchJSONData('/data/projects.json'),
    fetchJSONData('/data/certificates.json'),
    fetchJSONData('/data/techStack.json'),
  ])
    .then((data) => {
      projects = (data[0] || []).slice().sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      certificates = (data[1] || []).slice().sort((a, b) => (b.id ?? 0) - (a.id ?? 0));
      techStack = data[2];

      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('certificates', JSON.stringify(certificates));
      localStorage.setItem('techStack', JSON.stringify(techStack));

      renderProjects(projects, 2);
      renderCertificates(certificates);
      renderTechStack(techStack);
      updateCounts(projects.length, certificates.length);
    })
    .catch((error) => console.error('Error fetching data:', error));

  function updateCounts(projectsCount, certificatesCount) {
    document.getElementById('projects-count').textContent = `${projectsCount} Projects`;
    document.getElementById('certificates-count').textContent = `${certificatesCount} Certificates`;
    const yearsOfExperience = new Date().getFullYear() - 2022;
    document.getElementById('years-experience').textContent =
      `${yearsOfExperience}+ Years Experience`;
  }

  function updateLoadMoreBtn(isExpanded) {
    const btn = document.getElementById('load-more-projects');
    if (!btn) return;
    const span = btn.querySelector('span');
    if (span) span.textContent = isExpanded ? 'Show Less' : 'See All Projects';
    btn.classList.toggle('expanded', isExpanded);
  }

  const loadMoreButton = document.getElementById('load-more-projects');
  if (loadMoreButton) {
    loadMoreButton.addEventListener('click', () => {
      const projectsGrid = document.querySelector('#projects .projects-grid');
      const isExpanded = visibleProjects >= projects.length;

      // Block double-clicks without touching opacity (opacity changes cause a visible flash)
      loadMoreButton.style.pointerEvents = 'none';

      if (isExpanded) {
        // Scroll up immediately so the user isn't left stranded below the fold
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection)
          portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

        const cards = [...projectsGrid.querySelectorAll('.project-card')];
        const extras = cards.slice(2);
        const gridRect = projectsGrid.getBoundingClientRect();
        const secondCard = cards[1] || cards[0];
        const twoCardHeight = secondCard.getBoundingClientRect().bottom - gridRect.top;
        const collapseAmount = projectsGrid.offsetHeight - twoCardHeight;

        extras.forEach((card, i) => {
          card.style.transition = `opacity 0.45s ease ${i * 70}ms`;
          card.style.opacity = '0';
        });

        loadMoreButton.style.transition = 'transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        loadMoreButton.style.transform = `translateY(-${collapseAmount}px)`;

        setTimeout(() => {
          extras.forEach((card) => card.remove());
          visibleProjects = 2;
          updateLoadMoreBtn(false);
          // Layout has now moved the button up by collapseAmount naturally,
          // so clearing the transform keeps it visually in the same spot
          loadMoreButton.style.transition = 'none';
          void loadMoreButton.offsetWidth;
          loadMoreButton.style.transform = '';
          requestAnimationFrame(() => {
            loadMoreButton.style.transition = '';
          });
          loadMoreButton.style.pointerEvents = '';
        }, 750);
      } else {
        const prevCount = visibleProjects;
        visibleProjects = projects.length;
        renderProjects(projects, visibleProjects);
        updateLoadMoreBtn(true);
        const cards = [...projectsGrid.querySelectorAll('.project-card')];
        const newCards = cards.slice(prevCount);
        newCards.forEach((card, i) => {
          const delay = i * 90;
          card.style.opacity = '0';
          card.style.transform = 'translateY(24px)';
          requestAnimationFrame(() => {
            card.style.transition = `opacity 0.4s ease ${delay}ms, transform 0.4s ease ${delay}ms`;
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
          // Clear inline styles after animation so CSS hover effects aren't blocked
          setTimeout(
            () => {
              card.style.transition = '';
              card.style.opacity = '';
              card.style.transform = '';
            },
            400 + delay + 20
          );
        });
        setTimeout(
          () => {
            loadMoreButton.style.pointerEvents = '';
          },
          400 + (newCards.length - 1) * 90 + 20
        );
      }
    });
  }

  const words = [
    'ROBUST .NET APPLICATIONS.',
    'SCALABLE CLOUD SOLUTIONS.',
    'FORTIFIED BACKENDS.',
    'ADVANCED MVC PLATFORMS.',
    'ENGAGING INTERFACES.',
    'HIGH-PERFORMANCE DATABASES.',
    'SEAMLESS E-COMMERCE.',
    'TRANSFORMATIVE ENTERPRISE.',
  ];

  const dynamicText = document.querySelector('.dynamic-text');
  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;

  function typeEffect() {
    const currentWord = words[wordIndex];
    dynamicText.textContent = currentWord.substring(0, charIndex);

    if (!isDeleting && charIndex < currentWord.length) {
      charIndex++;
      setTimeout(typeEffect, 120);
    } else if (isDeleting && charIndex > 0) {
      charIndex--;
      setTimeout(typeEffect, charIndex === 1 ? 300 : 60);
    } else if (!isDeleting) {
      setTimeout(() => {
        isDeleting = true;
        typeEffect();
      }, 1500);
    } else {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      setTimeout(typeEffect, 300);
    }
  }

  typeEffect();
}

let visibleProjects = 2;

function renderProjects(projectsToRender, limit) {
  const projectsGrid = document.querySelector('#projects .projects-grid');
  if (!Array.isArray(projectsToRender)) {
    console.error('renderProjects expected an array but got:', projectsToRender);
    if (projectsGrid) projectsGrid.innerHTML = '';
    return;
  }
  projectsGrid.innerHTML = projectsToRender
    .slice(0, limit)
    .map(
      (project) => `
      <div class="project-card" onclick='openModal(${JSON.stringify(project)})'>
        <img src="${assetUrl(project.image)}" alt="${project.title}" />
        <h3>${project.title}</h3>
        <p>${project.description}</p>
      </div>
    `
    )
    .join('');
}

function renderCertificates(certificatesToRender) {
  const certificatesGrid = document.querySelector('#certificates .certificates-grid');
  certificatesGrid.innerHTML = certificatesToRender
    .map(
      (cert) => `
      <div class="certificate-card" onclick="openCertificateModal(${JSON.stringify(cert).replace(/"/g, '&quot;')})">
        <img src="${assetUrl(cert.image)}" alt="${cert.title}" />
        <h3>${cert.title}</h3>
        <p>${cert.description}</p>
      </div>
    `
    )
    .join('');
}

function renderTechStack(techStackToRender) {
  const techStackGrid = document.querySelector('#tech-stack .tech-stack-grid');
  techStackGrid.innerHTML = techStackToRender
    .map(
      (tech) => `
      <div class="tech-stack-item">
        <img src="${assetUrl(tech.icon)}" alt="${tech.name}" />
        <span>${tech.name}</span>
      </div>
    `
    )
    .join('');
}

function openModal(project) {
  const modal = document.getElementById('project-modal');
  modal.querySelector('.modal-image').src = assetUrl(project.image);
  modal.querySelector('.modal-title').textContent = project.title;
  modal.querySelector('.modal-description').textContent = project.description;
  modal.querySelector('.modal-tech-stack').innerHTML = project.techStack
    .map((tech) => `<span>${tech}</span>`)
    .join('');

  const demoDomains = ['github.io', 'netlify.app', 'vercel.app', 'herokuapp.com'];
  const isInvalid = !project.link || project.link === '#' || project.link.startsWith('javascript:');
  const isDemo = project.link && demoDomains.some((d) => project.link.includes(d));

  const liveDemoButton = isInvalid
    ? ''
    : `<a href="${project.link}" class="btn" target="_blank">${isDemo ? 'Live Demo' : 'Visit Site'}</a>`;
  const githubButton = project.github
    ? `<a href="${project.github}" class="btn" target="_blank">GitHub</a>`
    : '';

  modal.querySelector('.modal-links').innerHTML = `${liveDemoButton}${githubButton}`;
  modal.classList.add('open');
  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
}

function getFileType(url) {
  if (!url) return 'unknown';
  const ext = url.split('.').pop().toLowerCase();
  if (ext === 'pdf' || url.includes('drive.google.com')) return 'pdf';
  return 'image';
}

function openCertificateModal(certificate) {
  const modal = document.getElementById('certificate-modal');
  const imageElement = modal.querySelector('.certificate-image');
  const pdfElement = modal.querySelector('.certificate-pdf');

  modal.querySelector('.modal-links').innerHTML =
    `<a href="${certificate.link}" class="btn" target="_blank">View Original</a>`;

  if (getFileType(certificate.image) === 'pdf') {
    imageElement.style.display = 'none';
    pdfElement.style.display = 'block';
    pdfElement.src = assetUrl(certificate.image);
  } else {
    pdfElement.style.display = 'none';
    imageElement.style.display = 'block';
    imageElement.src = assetUrl(certificate.image);
  }

  modal.classList.add('open');
  document.body.classList.add('modal-open');
  document.documentElement.classList.add('modal-open');
}

// Expose to global scope for inline onclick handlers in rendered HTML
window.openModal = openModal;
window.openCertificateModal = openCertificateModal;

window.addEventListener('click', (event) => {
  const projectModal = document.getElementById('project-modal');
  const certificateModal = document.getElementById('certificate-modal');

  if (event.target === projectModal || event.target.classList.contains('close-modal')) {
    projectModal.classList.remove('open');
  }
  if (event.target === certificateModal || event.target.classList.contains('close-modal')) {
    certificateModal.classList.remove('open');
  }
  if (!document.querySelector('.modal.open')) {
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
  }
});

const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const tabContainerEl = document.querySelector('.tab-container');
let currentTabIndex = Array.from(tabButtons).findIndex((btn) => btn.classList.contains('active'));
if (currentTabIndex < 0) currentTabIndex = 0;
let isAnimatingTabs = false;

function switchTab(newTabIndex) {
  if (isAnimatingTabs || newTabIndex === currentTabIndex) return;

  const newButton = tabButtons[newTabIndex];
  const newTabId = newButton.getAttribute('data-tab');
  const newTab = document.getElementById(newTabId);
  const currentTab = document.querySelector('.tab-content.active');
  if (!newTab || !currentTab) return;

  // Higher index = going right → current exits left, new enters from right
  const goingRight = newTabIndex > currentTabIndex;
  const exitX = goingRight ? '-100%' : '100%';
  const enterX = goingRight ? '100%' : '-100%';
  const DURATION = 380;
  const transition = `transform ${DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`;

  tabButtons.forEach((b) => b.classList.remove('active'));
  newButton.classList.add('active');
  isAnimatingTabs = true;

  // Lock the container height so it doesn't collapse while both tabs are absolute
  if (tabContainerEl) tabContainerEl.style.height = `${currentTab.offsetHeight}px`;

  // Lock the current tab's visible state inline BEFORE removing .active —
  // otherwise .tab-content { opacity: 0 } would snap it invisible immediately.
  currentTab.style.opacity = '1';
  currentTab.style.transform = 'translateX(0)';
  currentTab.style.position = 'absolute';
  currentTab.style.top = '0';
  currentTab.style.left = '0';
  currentTab.style.width = '100%';
  currentTab.classList.remove('active');

  // Snap new tab off-screen, fully visible, no transition yet
  newTab.style.transition = 'none';
  newTab.style.transform = `translateX(${enterX})`;
  newTab.style.opacity = '1';
  newTab.style.position = 'absolute';
  newTab.style.top = '0';
  newTab.style.left = '0';
  newTab.style.width = '100%';
  newTab.style.pointerEvents = 'none';

  // Force browser to paint the off-screen start position before animating
  void newTab.offsetWidth;

  currentTab.style.transition = transition;
  newTab.style.transition = transition;
  currentTab.style.transform = `translateX(${exitX})`;
  newTab.style.transform = 'translateX(0)';

  setTimeout(() => {
    ['transition', 'transform', 'opacity', 'position', 'top', 'left', 'width'].forEach((p) => {
      currentTab.style[p] = '';
    });
    [
      'transition',
      'transform',
      'opacity',
      'position',
      'top',
      'left',
      'width',
      'pointerEvents',
    ].forEach((p) => {
      newTab.style[p] = '';
    });
    newTab.classList.add('active');
    if (tabContainerEl) tabContainerEl.style.height = '';
    currentTabIndex = newTabIndex;
    isAnimatingTabs = false;
  }, DURATION + 60);
}

if (tabButtons.length) {
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => switchTab(index));
  });

  const navbar = document.getElementById('navbar');
  function updateNavbarBg() {
    if (!navbar) return;
    navbar.classList.toggle('scrolled', window.scrollY > 0);
  }
  window.addEventListener('scroll', updateNavbarBg, { passive: true });
  updateNavbarBg();

  // Smooth page transitions on cross-page navigation
  (function setupPageTransitions() {
    document.body.classList.remove('page-leaving');
    document.body.classList.add('page-loaded');

    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
      link.addEventListener('click', (e) => {
        if (link.target === '_blank') return;
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        e.preventDefault();
        const originalHref = window.location.href;
        document.body.classList.add('page-leaving');
        setTimeout(() => {
          window.location.href = url.href;
        }, 250);
        // Fallback: restore state if navigation fails
        setTimeout(() => {
          if (window.location.href === originalHref) {
            document.body.classList.remove('page-leaving');
          }
        }, 3000);
      });
    });
  })();
}

// Contact form
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(form);
    try {
      const response = await fetch('/', { method: 'POST', body: formData });
      typeFormStatus(
        response.ok
          ? 'Thank you! Your message has been sent.'
          : 'Oops! Something went wrong. Please try again.',
        response.ok ? 'success' : 'error'
      );
      if (response.ok) form.reset();
    } catch {
      typeFormStatus('Network error. Please check your connection.', 'error');
    }
  }

  if (form) form.addEventListener('submit', handleSubmit);

  function typeFormStatus(message, statusClass) {
    formStatus.textContent = '';
    formStatus.className = statusClass;
    let i = 0;
    function type() {
      if (i < message.length) {
        formStatus.textContent += message.charAt(i++);
        setTimeout(type, 80);
      }
    }
    type();
  }
});
