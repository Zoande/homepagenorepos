(function () {
  const projects = window.PROJECTS || [];
  const aosActive = window.__AOS_ACTIVE__ === true;
  const grid = document.getElementById("project-grid");
  const totalEl = document.getElementById("project-total");
  const ownersEl = document.getElementById("project-owners");
  const sectionLead = document.querySelector(".section-title-wrap p");

  if (!grid) {
    return;
  }

  const featuredOrder = [
    "zoande-brokersim",
    "zoande-call-of-idk",
    "dh-swapspot",
    "dh-citybuilder",
    "dh-polymarket-bot",
    "dh-studymaster",
    "dh-task-sorter-app",
    "zoande-ahhh"
  ];

  const byId = new Map(projects.map((project) => [project.id, project]));
  const featured = featuredOrder
    .map((id) => byId.get(id))
    .filter(Boolean);

  const visibleProjects = featured.slice(0, 8);

  const owners = Array.from(new Set(visibleProjects.map((p) => p.owner)));
  if (totalEl) {
    totalEl.textContent = String(visibleProjects.length);
  }
  if (ownersEl) {
    ownersEl.textContent = String(owners.length);
  }

  if (sectionLead) {
    sectionLead.textContent = `Curated top ${visibleProjects.length} projects selected for polish, playability, and technical depth.`;
  }

  grid.innerHTML = visibleProjects
    .map((project, index) => {
      const tech = project.tech.slice(0, 3).map((item) => `<span class="chip">${item}</span>`).join("");
      // Stagger animation delays for cards
      const aosDelay = Math.min(index * 75, 450);
      const cardAosAttrs = aosActive
        ? `data-aos="fade-up" data-aos-duration="500" data-aos-delay="${aosDelay}"`
        : "";
      return `
        <article 
          class="project-card" 
          aria-label="${project.title}"
          ${cardAosAttrs}
        >
          <p class="owner">${project.owner}</p>
          <h3>${project.title}</h3>
          <p class="summary">${project.summary}</p>
          <div class="chip-row">${tech}</div>
          <div class="card-actions">
            <a class="button ghost" href="${project.repoUrl}" target="_blank" rel="noopener noreferrer">Repo</a>
            <a class="button" href="projects/${project.id}.html">Open Page</a>
          </div>
        </article>
      `;
    })
    .join("");

  if (aosActive && window.AOS && typeof window.AOS.refreshHard === "function") {
    window.AOS.refreshHard();
  }
})();
