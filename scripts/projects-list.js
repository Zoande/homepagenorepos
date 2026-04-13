// Projects List Rendering Script
(function () {
  // Get projects from global PROJECTS array
  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const grid = document.getElementById('projects-grid');
  
  if (!grid) return;

  // Project type mapping for filtering
  const projectTypes = {
    'zoande-brokersim': 'game',
    'zoande-ahhh': 'strategy',
    'zoande-onlineagent': 'tool',
    'zoande-call-of-idk': 'strategy',
    'dh-polymarket-bot': 'trading',
    'dh-typing-platformer': 'game',
    'dh-citybuilder': 'game',
    'dh-task-sorter-app': 'tool',
    'dh-isrlo-ibdp-subject': 'tool',
    'dh-sticky-notes-app': 'tool',
    'dh-studymaster': 'tool',
    'dh-swapspot': 'game'
  };

  // Get media icons based on project type
  const getMediaIcon = (projectId) => {
    const type = projectTypes[projectId];
    const icons = {
      'game': '🎮',
      'strategy': '♟️',
      'trading': '📈',
      'tool': '⚙️'
    };
    return icons[type] || '🚀';
  };

  // Render a single project card
  const renderProjectCard = (project) => {
    const type = projectTypes[project.id] || 'tool';
    const hasTech = Array.isArray(project.tech) && project.tech.length > 0;
    const detailItems = Array.isArray(project.details) ? project.details.slice(0, 2) : [];
    const projectPageUrl = `projects/${project.id}.html?from=projects`;
    
    return `
      <div class="project-card" data-type="${type}" data-aos="fade-up" data-aos-duration="500">
        <div class="project-media">
          <span class="media-icon">${getMediaIcon(project.id)}</span>
        </div>
        <div class="project-content">
          <div class="project-header">
            <h3 class="project-title">${project.title}</h3>
            <p class="project-owner">👤 ${project.owner}</p>
            <span class="project-stage">${project.stage}</span>
          </div>
          
          <p class="project-summary">${project.summary}</p>

          ${detailItems.length ? `
            <ul class="project-details">
              ${detailItems.map(item => `<li>${item}</li>`).join('')}
            </ul>
          ` : ''}
          
          ${hasTech ? `
            <div class="project-tech">
              ${project.tech.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
            </div>
          ` : ''}
          
          <div class="project-actions">
            ${project.liveUrl ? `
              <a href="${project.liveUrl}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn-primary">
                ▶ Open
              </a>
            ` : `
              <button class="action-btn action-btn-primary" disabled style="cursor: not-allowed; opacity: 0.5;">
                ▶ Soon
              </button>
            `}
            
            ${project.repoUrl ? `
              <a href="${project.repoUrl}" target="_blank" rel="noopener noreferrer" class="action-btn action-btn-secondary">
                ⭐ Repo
              </a>
            ` : `
              <button class="action-btn action-btn-secondary" disabled style="cursor: not-allowed; opacity: 0.5;">
                ⭐ Repo
              </button>
            `}

            <a href="${projectPageUrl}" class="action-btn action-btn-secondary action-btn-full project-page-link">
              📄 Project Page
            </a>
          </div>
        </div>
      </div>
    `;
  };

  // Render all projects
  const renderProjects = (projectsToRender = projects) => {
    grid.innerHTML = projectsToRender.map(renderProjectCard).join('');
    
    // Re-trigger AOS for new elements
    if (window.AOS && window.AOS.refresh) {
      setTimeout(() => window.AOS.refresh(), 100);
    }
  };

  // Initialize filters
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter and render
      if (filter === 'all') {
        renderProjects(projects);
      } else {
        const filtered = projects.filter(p => projectTypes[p.id] === filter);
        renderProjects(filtered);
      }
    });
  });

  grid.addEventListener('click', (event) => {
    const link = event.target.closest('.project-page-link');
    if (!link) {
      return;
    }

    try {
      window.sessionStorage.setItem('elitedevs:return-source', 'projects');
    } catch (_) {
      // Ignore storage errors and continue with query-param fallback.
    }
  });

  // Initial render
  renderProjects();
})();
