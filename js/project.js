function assetUrl(path) {
  if (!path) return '';
  if (/^(https?:)?\//.test(path)) return path;
  return String(path).replace(/^\/+/, '');
}

(function setupPageTransitions() {
  document.body.classList.remove('page-leaving');
  document.body.classList.add('page-loaded');

  function attachTransition(el) {
    const href = el.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('javascript:') || el.target === '_blank')
      return;
    el.addEventListener('click', (e) => {
      const url = new URL(href, window.location.href);
      if (url.origin !== window.location.origin) return;
      e.preventDefault();
      document.body.classList.add('page-leaving');
      setTimeout(() => {
        window.location.href = url.href;
      }, 250);
    });
  }

  document.querySelectorAll('a[href]').forEach(attachTransition);
  window._attachTransition = attachTransition;
})();

async function loadProject() {
  const id = Number(new URLSearchParams(window.location.search).get('id'));

  let projects = null;
  try {
    const cached = localStorage.getItem('projects');
    if (cached) projects = JSON.parse(cached);
  } catch {}

  if (!projects) {
    try {
      projects = await fetch('/data/projects.json').then((r) => r.json());
    } catch {
      showNotFound();
      return;
    }
  }

  const project = projects.find((p) => p.id === id);
  if (!project) {
    showNotFound();
    return;
  }

  renderProject(project);
}

function statusBadge(status) {
  if (!status) return '';
  const map = {
    live: { cls: 'badge-live', icon: 'fa-circle', label: 'Live' },
    private: { cls: 'badge-private', icon: 'fa-lock', label: 'Private' },
    archived: { cls: 'badge-archived', icon: 'fa-archive', label: 'Archived' },
    'open source': { cls: 'badge-opensource', icon: 'fa-code-branch', label: 'Open Source' },
  };
  const key = status.toLowerCase();
  const s = map[key] || { cls: 'badge-private', icon: 'fa-tag', label: status };
  return `<span class="badge ${s.cls}"><i class="fas ${s.icon}"></i> ${s.label}</span>`;
}

function renderProject(project) {
  document.title = `${project.title} — Seif Soliman Mohammed`;

  // Hero
  const img = document.getElementById('project-img');
  img.src = assetUrl(project.image);
  img.alt = project.title;
  document.getElementById('project-breadcrumb-title').textContent = project.title;

  // Meta row: status, year, role
  const metaRow = document.getElementById('project-meta-row');
  let metaHTML = '';
  if (project.status) metaHTML += statusBadge(project.status);
  if (project.year)
    metaHTML += `<span class="badge badge-year"><i class="fas fa-calendar-alt"></i> ${project.year}</span>`;
  if (project.role)
    metaHTML += `<span class="badge badge-role"><i class="fas fa-user-cog"></i> ${project.role}</span>`;
  metaRow.innerHTML = metaHTML;

  // Title
  document.getElementById('project-title').textContent = project.title;

  // Tech stack
  document.getElementById('project-tech-stack').innerHTML = (project.techStack || [])
    .map((t) => `<span>${t}</span>`)
    .join('');

  // Description: prefer longDescription
  document.getElementById('project-description').textContent =
    project.longDescription || project.description || '';

  // Features
  if (project.features && project.features.length) {
    const featuresSection = document.getElementById('project-features-section');
    const featuresList = document.getElementById('project-features');
    featuresList.innerHTML = project.features.map((f) => `<li>${f}</li>`).join('');
    featuresSection.style.display = '';
  }

  // Info card — type, duration, team, tech count (not duplicating the badges)
  const infoRows = [
    project.type && ['fa-layer-group', 'Type', project.type],
    project.duration && ['fa-clock', 'Dev Time', project.duration],
    project.team && ['fa-users', 'Team', project.team],
    project.techStack?.length && ['fa-code', 'Technologies', `${project.techStack.length} tools`],
  ].filter(Boolean);

  if (infoRows.length) {
    document.getElementById('project-info-card').innerHTML = infoRows
      .map(
        ([icon, label, value]) => `
        <div class="info-row">
          <span class="info-label"><i class="fas ${icon}"></i> ${label}</span>
          <span class="info-value">${value}</span>
        </div>`
      )
      .join('');
  }

  // Action buttons
  const demoDomains = ['github.io', 'netlify.app', 'vercel.app', 'herokuapp.com'];
  const hasLink = project.link && project.link !== '#' && !project.link.startsWith('javascript:');
  const isDemo = hasLink && demoDomains.some((d) => project.link.includes(d));

  let buttonsHTML = '';
  if (hasLink) {
    buttonsHTML += `<a href="${project.link}" class="btn-project btn-primary" target="_blank" rel="noopener noreferrer">
      <i class="fas fa-external-link-alt"></i> ${isDemo ? 'Live Demo' : 'Visit Site'}
    </a>`;
  }
  if (project.github) {
    buttonsHTML += `<a href="${project.github}" class="btn-project btn-secondary" target="_blank" rel="noopener noreferrer">
      <i class="fab fa-github"></i> View on GitHub
    </a>`;
  }
  buttonsHTML += `<a href="/#portfolio" class="btn-ghost"><i class="fas fa-arrow-left"></i> Back to Projects</a>`;

  const actionsEl = document.getElementById('project-actions');
  actionsEl.innerHTML = buttonsHTML;
  actionsEl.querySelectorAll('a[href]').forEach(window._attachTransition);

  // Screenshots gallery
  const shots = (project.screenshots || []).filter(Boolean);
  if (shots.length) {
    const gallerySection = document.getElementById('project-gallery-section');
    const gallery = document.getElementById('project-gallery');
    gallery.innerHTML = shots
      .map(
        (src, i) => `
        <div class="gallery-thumb" data-index="${i}">
          <img src="${assetUrl(src)}" alt="${project.title} screenshot ${i + 1}" loading="lazy" />
        </div>`
      )
      .join('');
    gallerySection.style.display = '';
    setupLightbox(shots.map(assetUrl));
  }

  // Show content
  document.getElementById('project-detail').style.display = '';
  requestAnimationFrame(() => {
    document.getElementById('project-main').classList.add('visible');
  });
}

function setupLightbox(shots) {
  let current = 0;
  const lb = document.getElementById('lightbox');
  const lbImg = document.getElementById('lightbox-img');

  function open(index) {
    current = index;
    lbImg.src = shots[current];
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prev() {
    open((current - 1 + shots.length) % shots.length);
  }
  function next() {
    open((current + 1) % shots.length);
  }

  document.getElementById('project-gallery').addEventListener('click', (e) => {
    const thumb = e.target.closest('.gallery-thumb');
    if (thumb) open(Number(thumb.dataset.index));
  });

  document.getElementById('lightbox-close').addEventListener('click', close);
  document.getElementById('lightbox-prev').addEventListener('click', prev);
  document.getElementById('lightbox-next').addEventListener('click', next);

  lb.addEventListener('click', (e) => {
    if (e.target === lb) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
  });
}

function showNotFound() {
  document.getElementById('project-not-found').style.display = '';
  requestAnimationFrame(() => {
    document.getElementById('project-main').classList.add('visible');
  });
}

export function initSiteHeader() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('scrolled', window.scrollY > 0);
  window.addEventListener('scroll', update, { passive: true });
  update();
}
initSiteHeader();

loadProject();
