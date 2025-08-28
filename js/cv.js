// Intersection observer for animating timeline nodes
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  },
  { threshold: 0.2 }
);

// Subtle wobble effect on scroll for cards
window.addEventListener('scroll', () => {
  const scrolled = window.scrollY;
  document.querySelectorAll('.node .card').forEach((card, i) => {
    const offset = Math.sin((scrolled + i * 120) / 400) * 6;
    card.style.setProperty('--offsetY', `${offset}px`);
  });
});

// Fetch utility
async function fetchJSONData(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  return res.json();
}

// Initialize CV rendering
(async function initCV() {
  try {
    const experience = await fetchJSONData('/data/experience.json');
    renderTimeline(experience);
  } catch (e) {
    console.error('Error initializing CV page:', e);
  }
})();

// Render the timeline using the HTML template
function renderTimeline(items) {
  const mapSection = document.querySelector('.map.container');
  const tpl = document.getElementById('timeline-node-template');
  if (!mapSection || !tpl) return;

  // Preserve the timeline line if it exists
  const line = mapSection.querySelector('.map-line');

  // Clear and re-append preserved elements
  mapSection.innerHTML = '';
  if (line) mapSection.appendChild(line);
  mapSection.appendChild(tpl);

  const fragment = document.createDocumentFragment();

  items.forEach((item, idx) => {
    const clone = tpl.content.cloneNode(true);

    const node = clone.querySelector('.node');
    const eyebrow = clone.querySelector('.eyebrow');
    const titleEl = clone.querySelector('h3');
    const locationEl = clone.querySelector('.location');
    const chips = clone.querySelector('.chips');
    const details = clone.querySelector('.details');

    // Guard against template structure mismatch
    if (!node || !eyebrow || !titleEl || !locationEl || !chips || !details) {
      return;
    }

    if (idx === 0) node.classList.add('in-view');

    eyebrow.textContent = item.period || '';
    const titleParts = [item.role, item.organization].filter(Boolean);
    titleEl.textContent = titleParts.join(' — ');
    locationEl.textContent = item.location || '';

    // Skills chips (unique, limited)
    const skills = Array.from(new Set((item.projects || []).flatMap((p) => p.skills || []))).slice(
      0,
      8
    );

    chips.innerHTML = '';
    skills.forEach((skill) => {
      const li = document.createElement('li');
      li.textContent = skill;
      chips.appendChild(li);
    });

    // Project details and achievements
    details.innerHTML = '';
    (item.projects || []).forEach((pr) => {
      const t = document.createElement('p');
      t.classList.add('detail');
      const title = pr.title ? `<strong>${pr.title}:</strong> ` : '';
      t.innerHTML = `${title}${pr.description || ''}`;
      details.appendChild(t);

      if (Array.isArray(pr.achievements) && pr.achievements.length) {
        const ul = document.createElement('ul');
        ul.classList.add('achievements');
        pr.achievements.forEach((a) => {
          const li = document.createElement('li');
          li.textContent = a;
          ul.appendChild(li);
        });
        details.appendChild(ul);
      }
    });

    fragment.appendChild(clone);
  });

  mapSection.appendChild(fragment);

  // Observe nodes for animation
  mapSection.querySelectorAll('.node').forEach((n) => io.observe(n));
}
