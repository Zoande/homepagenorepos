(function () {
  const projects = window.PROJECTS || [];
  const grid = document.getElementById("project-grid");
  const totalEl = document.getElementById("project-total");
  const ownersEl = document.getElementById("project-owners");

  if (!grid) {
    return;
  }

  const owners = Array.from(new Set(projects.map((p) => p.owner)));
  if (totalEl) {
    totalEl.textContent = String(projects.length);
  }
  if (ownersEl) {
    ownersEl.textContent = String(owners.length);
  }

  grid.innerHTML = projects
    .map((project, index) => {
      const tech = project.tech.slice(0, 3).map((item) => `<span class="chip">${item}</span>`).join("");
      // Stagger animation delays for cards
      const aosDelay = Math.min(index * 75, 450);
      return `
        <article 
          class="project-card" 
          aria-label="${project.title}"
          data-aos="fade-up"
          data-aos-duration="500"
          data-aos-delay="${aosDelay}"
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
})();
