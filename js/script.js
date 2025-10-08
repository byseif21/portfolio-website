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

// public assets
function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\//.test(path)) return path; // already absolute or protocol-relative
  return `${String(path).replace(/^\/+/, '')}`;
}

// Starting the typing effect (for the welcome screen)
const words2 = ['www.seifsoliman.com'];
const dynamicText2 = document.querySelector('.myweblink');
let wordIndex2 = 0;
let charIndex2 = 0;
let isDeleting2 = false;
const __hasVisitedSession = (() => {
  try {
    return sessionStorage.getItem('visited_session') === '1';
  } catch {
    return false;
  }
})();

function typeEffect2() {
  const currentWord = words2[wordIndex2];
  const displayedText = currentWord.substring(0, charIndex2);
  if (dynamicText2) dynamicText2.textContent = displayedText;

  if (!isDeleting2 && charIndex2 < currentWord.length) {
    charIndex2++;
    setTimeout(typeEffect2, 120); // Typing speed
  } else if (isDeleting2 && charIndex2 > 0) {
    charIndex2--;
    setTimeout(typeEffect2, charIndex2 === 1 ? 300 : 60); // Deleting speed
  } else if (!isDeleting2) {
    setTimeout(() => {
      isDeleting2 = true;
      typeEffect2();
    }, 1500); // Pause before deleting
  } else {
    isDeleting2 = false;
    wordIndex2 = (wordIndex2 + 1) % words2.length;
    setTimeout(typeEffect2, 300); // Move to the next word
  }
}

// Start the typing effect only if first visit in this session
if (!__hasVisitedSession) {
  typeEffect2();
}

// Wait for the welcome screen to be 70% faded (only for first visit)
if (!__hasVisitedSession) {
  setTimeout(() => {
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) welcomeScreen.style.display = 'none';

    const mainContent = document.getElementById('main-content');
    if (mainContent) mainContent.style.display = 'block';

    // Initialize the page
    if (typeof initializePage === 'function') initializePage();
  }, 3500); // 70% of 5 seconds = 3.5 seconds
}

// asset-based loading progress indicator
(() => {
  const loadingTextEl = document.querySelector('.loading-text');
  const images = Array.from(document.images);
  const total = images.length || 1;
  let loaded = 0;
  const update = () => {
    const pct = Math.round((loaded / total) * 100);
    if (loadingTextEl) loadingTextEl.textContent = `Loading ${pct}%`;
  };
  images.forEach((img) => {
    if (img.complete && img.naturalWidth) {
      loaded++;
      update();
    } else {
      img.addEventListener(
        'load',
        () => {
          loaded++;
          update();
        },
        { once: true }
      );
      img.addEventListener(
        'error',
        () => {
          loaded++;
          update();
        },
        { once: true }
      );
    }
  });
  update();
})();

// remove the loading screen after the page loads
window.addEventListener('load', () => {
  const loadingScreen = document.querySelector('.loading-screen');
  if (loadingScreen) {
    loadingScreen.style.opacity = '0'; // Fade out effect
    setTimeout(() => {
      loadingScreen.style.display = 'none'; // Remove from DOM
    }, 500); // Wait for fade effect
  }
});

// Function to initialize the page
function initializePage() {
  if (window.__pageInitialized) return;
  window.__pageInitialized = true;
  // Intersection Observer for scroll animations
  const sections = document.querySelectorAll('.section');
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
        } else {
          entry.target.classList.remove('in-view');
        }
      });
    },
    { threshold: 0.1 }
  );
  sections.forEach((section) => observer.observe(section));

  // Fetch data from JSON files
  async function fetchJSONData(url) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
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
      projects = data[0];
      certificates = data[1];
      techStack = data[2];

      // Save data to local storage
      localStorage.setItem('projects', JSON.stringify(projects));
      localStorage.setItem('certificates', JSON.stringify(certificates));
      localStorage.setItem('techStack', JSON.stringify(techStack));

      // Render projects, certificates, and tech stack
      renderProjects(projects, 2); // Initial load with 2 projects
      renderCertificates(certificates);
      renderTechStack(techStack);

      // Update counts
      updateCounts(projects.length, certificates.length);
    })
    .catch((error) => {
      console.error('Error fetching data:', error);
    });

  function updateCounts(projectsCount, certificatesCount) {
    document.getElementById('projects-count').textContent = `${projectsCount} Projects`;
    document.getElementById('certificates-count').textContent = `${certificatesCount} Certificates`;

    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const yearsOfExperience = currentYear - startYear;
    document.getElementById('years-experience').textContent =
      `${yearsOfExperience}+ Years Experience`;
  }
  // Add event listener to the "See More" / "Show Less" button
  const loadMoreButton = document.querySelector('#projects .btn');
  loadMoreButton.addEventListener('click', () => {
    visibleProjects = visibleProjects >= projects.length ? 2 : visibleProjects + 2;
    renderProjects(projects, visibleProjects);

    // Smoothly update container height after project list changes
    const tabContainer = document.querySelector('.tab-container');
    const activeTab = document.querySelector('.tab-content.active');
    if (tabContainer && activeTab) {
      const targetHeight = activeTab.offsetHeight;
      tabContainer.style.height = `${tabContainer.offsetHeight}px`;
      requestAnimationFrame(() => {
        tabContainer.style.height = `${targetHeight}px`;
        setTimeout(() => {
          tabContainer.style.height = '';
        }, 500);
      });
    }
  });

  // Dynamic typing effect for the main text
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
    const displayedText = currentWord.substring(0, charIndex);
    dynamicText.textContent = displayedText;

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
                    <h3 style="padding: 1rem; margin: 0;">${cert.title}</h3>
                    <p style="padding: 0 1rem 1rem; color: #94a3b8;">${cert.description}</p>
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
                    <img src="${assetUrl(tech.icon)}" alt="${assetUrl(tech.name)}" />
                    <span>${assetUrl(tech.name)}</span>
                </div>
            `
    )
    .join('');
}

// Function to open modal with project details
function openModal(project) {
  const modal = document.getElementById('project-modal');
  modal.querySelector('.modal-image').src = assetUrl(project.image);
  modal.querySelector('.modal-title').textContent = project.title;
  modal.querySelector('.modal-description').textContent = project.description;
  modal.querySelector('.modal-tech-stack').innerHTML = project.techStack
    .map((tech) => `<span>${tech}</span>`)
    .join('');
  const links = modal.querySelector('.modal-links');
  links.innerHTML = `
        <a href="${project.link}" class="btn" target="_blank">Live Demo</a>
        <a href="${project.github}" class="btn" target="_blank">GitHub</a>
    `;

  modal.classList.add('open');
}

// detect PDF or image
function getFileType(url) {
  if (!url) return 'unknown';
  const extension = url.split('.').pop().toLowerCase();
  if (['pdf'].includes(extension)) return 'pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)) return 'image';
  // check if it's a Google Drive link
  if (url.includes('drive.google.com')) {
    // For Google Drive links, we'll treat them as PDFs by default
    // but we could also check the file ID and make an API call if needed
    return 'pdf';
  }
  return 'image'; // Default to image for local files
}

// open modal
function openCertificateModal(certificate) {
  const modal = document.getElementById('certificate-modal');
  const imageElement = modal.querySelector('.certificate-image');
  const pdfElement = modal.querySelector('.certificate-pdf');

  // "View Original" link
  const links = modal.querySelector('.modal-links');
  links.innerHTML = `
    <a href="${certificate.link}" class="btn" target="_blank">View Original</a>
  `;

  // file type
  const fileType = getFileType(certificate.image);

  if (fileType === 'pdf') {
    // Show PDF iframe, hide image
    imageElement.style.display = 'none';
    pdfElement.style.display = 'block';
    pdfElement.src = assetUrl(certificate.image);
  } else {
    // Show image, hide PDF iframe
    pdfElement.style.display = 'none';
    imageElement.style.display = 'block';
    imageElement.src = assetUrl(certificate.image);
  }

  modal.classList.add('open');
}

// Expose functions to global for inline onclick usage
window.openModal = openModal;
window.openCertificateModal = openCertificateModal;

// Close modal when clicking outside or on the close button
window.addEventListener('click', (event) => {
  const projectModal = document.getElementById('project-modal');
  const certificateModal = document.getElementById('certificate-modal');

  if (event.target === projectModal || event.target.classList.contains('close-modal')) {
    projectModal.classList.remove('open');
  }

  if (event.target === certificateModal || event.target.classList.contains('close-modal')) {
    certificateModal.classList.remove('open');
  }
});

// Session-based skip for welcome/loading screens
(function manageSessionScreens() {
  try {
    const sessionKey = 'visited_session';
    const hasVisited = sessionStorage.getItem(sessionKey) === '1';
    const welcomeScreen = document.getElementById('welcome-screen');
    const loadingScreen = document.querySelector('.loading-screen');
    if (hasVisited) {
      if (welcomeScreen) welcomeScreen.style.display = 'none';
      if (loadingScreen) loadingScreen.style.display = 'none';
      const mainContent = document.getElementById('main-content');
      if (mainContent) mainContent.style.display = 'block';
      // Initialize immediately if skipping
      if (typeof initializePage === 'function') {
        initializePage();
      }
    } else {
      sessionStorage.setItem(sessionKey, '1');
    }
  } catch (e) {}
})();

// Tabs functionality
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

  // Update button states
  tabButtons.forEach((b) => b.classList.remove('active'));
  newButton.classList.add('active');

  // Height management
  const startHeight = currentTab.offsetHeight;
  if (tabContainerEl) {
    const activeTab = document.querySelector('.tab-content.active');
    if (activeTab) {
      tabContainerEl.style.height = `${activeTab.offsetHeight}px`;
      requestAnimationFrame(() => {
        tabContainerEl.style.height = '';
      });
    }
  }

  // Direction based on index (restore original mapping)
  const goingRight = newTabIndex > currentTabIndex;
  const exitDirection = goingRight ? 'left' : 'right';
  const enterDirection = goingRight ? 'right' : 'left';

  // cleanup
  tabContents.forEach((tab) => {
    if (tab !== currentTab && tab !== newTab) {
      tab.classList.remove('active', 'exit-left', 'exit-right', 'enter-left', 'enter-right');
      tab.style.transform = '';
      tab.style.opacity = '';
    }
  });

  // Animate out current tab
  currentTab.classList.remove('active');
  currentTab.classList.add(`exit-${exitDirection}`);

  // new tab
  newTab.classList.remove('exit-left', 'exit-right', 'enter-left', 'enter-right');
  newTab.style.transform = enterDirection === 'right' ? 'translateX(100%)' : 'translateX(-100%)';
  newTab.style.opacity = '0';

  isAnimatingTabs = true;

  setTimeout(() => {
    newTab.classList.add(`enter-${enterDirection}`);
    newTab.classList.add('active');

    // Animate container height to fit new tab
    if (tabContainerEl) {
      const targetHeight = newTab.offsetHeight;
      requestAnimationFrame(() => {
        tabContainerEl.style.height = `${targetHeight}px`;
      });
    }
  }, 20);

  // Cleanup
  setTimeout(() => {
    newTab.classList.remove(`enter-${enterDirection}`);
    currentTab.classList.remove(`exit-${exitDirection}`);
    currentTab.style.transform = '';
    currentTab.style.opacity = '';
    newTab.style.transform = '';
    newTab.style.opacity = '';
    if (tabContainerEl) {
      tabContainerEl.style.height = '';
    }
    currentTabIndex = newTabIndex;
    isAnimatingTabs = false;
  }, 550);
}

if (tabButtons.length) {
  tabButtons.forEach((button, index) => {
    button.addEventListener('click', () => switchTab(index));
  });
}

// Contact form functionality
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');

  async function handleSubmit(event) {
    event.preventDefault(); // Prevent page reload

    let formData = new FormData(form);

    try {
      let response = await fetch('/', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        typeEffect('Thank you! Your message has been sent.', 'success');
        form.reset();
      } else {
        typeEffect('Oops! Something went wrong. Please try again.', 'error');
      }
    } catch (error) {
      typeEffect('Network error. Please check your connection.', 'error');
    }
  }

  if (form) form.addEventListener('submit', handleSubmit);

  function typeEffect(message, statusClass) {
    formStatus.textContent = '';
    formStatus.className = statusClass;

    let charIndex = 0;
    function type() {
      if (charIndex < message.length) {
        formStatus.textContent += message.charAt(charIndex);
        charIndex++;
        setTimeout(type, 80); // Typing speed
      }
    }
    type();
  }
});
