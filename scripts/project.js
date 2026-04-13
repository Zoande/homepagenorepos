(function () {
  const projects = Array.isArray(window.PROJECTS) ? window.PROJECTS : [];
  const pageId = document.body && document.body.dataset ? document.body.dataset.projectId : "";

  const project = projects.find((item) => item.id === pageId);
  const liveUrl = project && typeof project.liveUrl === "string" ? project.liveUrl.trim() : "";
  const params = new URLSearchParams(window.location.search);
  const fromParam = params.get("from");
  const referrer = document.referrer || "";
  const sourceKey = "elitedevs:return-source";
  const explicitSource = fromParam === "projects" || fromParam === "home" ? fromParam : "";

  let storedSource = "";
  try {
    storedSource = window.sessionStorage.getItem(sourceKey) || "";
  } catch (_) {
    storedSource = "";
  }

  let resolvedSource = explicitSource;
  if (!resolvedSource) {
    if (/\/projects\.html(?:[?#]|$)/i.test(referrer)) {
      resolvedSource = "projects";
    } else if (/\/index\.html(?:[?#]|$)/i.test(referrer) || /\/$/.test(referrer)) {
      resolvedSource = "home";
    } else if (storedSource === "projects" || storedSource === "home") {
      resolvedSource = storedSource;
    } else {
      resolvedSource = "home";
    }
  }

  try {
    window.sessionStorage.setItem(sourceKey, resolvedSource);
  } catch (_) {
    // Ignore storage errors and continue.
  }

  const cameFromProjects = resolvedSource === "projects";
  const returnHref = cameFromProjects ? "../projects.html" : "../index.html";
  const returnLabel = cameFromProjects ? "Back to all projects" : "Back to home";

  if (!project) {
    const root = document.getElementById("project-page");
    if (root) {
      root.innerHTML = "<h1>Project not found</h1><p>The project definition is missing.</p>";
    }
    return;
  }

  document.title = `${project.title} | EliteDevs`;

  const titleEl = document.getElementById("project-title");
  const ownerEl = document.getElementById("project-owner");
  const summaryEl = document.getElementById("project-summary");
  const stageEl = document.getElementById("project-stage");
  const statusEl = document.getElementById("project-status");
  const techEl = document.getElementById("project-tech");
  const detailsEl = document.getElementById("project-details");
  const stepsEl = document.getElementById("project-steps");
  const repoLinkEl = document.getElementById("project-repo");
  const repoLinkEl2 = document.getElementById("project-repo-link");
  const localPathEl = document.getElementById("project-local-path");
  const actionsWrap = document.querySelector(".project-hero .actions");

  if (titleEl) titleEl.textContent = project.title || "Untitled project";
  if (ownerEl) ownerEl.textContent = project.owner || "Unknown owner";
  if (summaryEl) summaryEl.textContent = project.summary || "Summary coming soon.";
  if (stageEl) stageEl.textContent = project.stage || "Stage not set";
  if (statusEl) statusEl.textContent = project.status || "Status details coming soon.";

  const backLink = document.querySelector(".back-link");
  if (backLink) {
    backLink.href = returnHref;
    backLink.textContent = returnLabel;
  }

  const viewAllButton = document.querySelector(".project-hero .actions .button.ghost");
  if (viewAllButton) {
    viewAllButton.href = returnHref;
    viewAllButton.textContent = cameFromProjects ? "View All Projects" : "Back Home";
  }

  const navProjectsLink = document.querySelector('.nav-menu a[href*="#projects"]');
  if (navProjectsLink) {
    navProjectsLink.href = "../projects.html";
    navProjectsLink.classList.add("active");
  }

  if (repoLinkEl) {
    repoLinkEl.href = project.repoUrl || "#";
    if (!project.repoUrl) {
      repoLinkEl.setAttribute("aria-disabled", "true");
    }
  }

  if (repoLinkEl2) {
    repoLinkEl2.href = project.repoUrl || "#";
    if (!project.repoUrl) {
      repoLinkEl2.setAttribute("aria-disabled", "true");
    }
    repoLinkEl2.textContent = "Visit Repository ->";
  }

  if (localPathEl) {
    localPathEl.textContent = project.localPath || "Not provided";
  }

  if (techEl) {
    const tech = Array.isArray(project.tech) ? project.tech : [];
    techEl.innerHTML = tech.map((item) => `<span class="chip">${item}</span>`).join("");
  }

  if (detailsEl) {
    const details = Array.isArray(project.details) ? project.details : [];
    detailsEl.innerHTML = details.map((item) => `<li>${item}</li>`).join("");
  }

  if (stepsEl) {
    const deliverableSteps = Array.isArray(project.deliverableSteps) ? project.deliverableSteps : [];
    stepsEl.innerHTML = deliverableSteps.map((item) => `<li>${item}</li>`).join("");
  }

  if (actionsWrap) {
    if (liveUrl) {
      const launchLink = document.createElement("a");
      launchLink.className = "button launch-button";
      launchLink.href = liveUrl;
      launchLink.target = "_blank";
      launchLink.rel = "noopener noreferrer";
      launchLink.textContent = "Open Live App";
      actionsWrap.insertBefore(launchLink, actionsWrap.firstChild);
    } else {
      const launchButton = document.createElement("button");
      launchButton.type = "button";
      launchButton.className = "button launch-button";
      launchButton.disabled = true;
      launchButton.setAttribute("aria-disabled", "true");
      launchButton.title = "Live deployment is not configured yet.";
      launchButton.textContent = "Live App (Soon)";
      actionsWrap.insertBefore(launchButton, actionsWrap.firstChild);
    }
  }

  if (!liveUrl && localPathEl && localPathEl.parentElement) {
    const launchNote = document.createElement("p");
    launchNote.className = "small-note launch-note";
    launchNote.textContent = "Live app link is not configured yet.";
    localPathEl.parentElement.appendChild(launchNote);
  }
})();

// Add AOS attributes to elements for smooth animations
document.addEventListener('DOMContentLoaded', function() {
  const projectTab = document.querySelector('.nav-menu a[href*="#projects"]');
  if (projectTab) {
    projectTab.classList.add('active');
  }

  const projectHero = document.querySelector('.project-hero');
  const panels = document.querySelectorAll('.panel');

  // Keep project content visible regardless of AOS state.
  [projectHero, ...panels].forEach((el) => {
    if (!el) {
      return;
    }

    el.removeAttribute('data-aos');
    el.removeAttribute('data-aos-duration');
    el.removeAttribute('data-aos-delay');
    el.style.opacity = '1';
    el.style.transform = 'none';
  });
});
