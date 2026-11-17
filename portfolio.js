
const OWNER = "chidinmaonyemachi";
const REPO = "chidinmaonyemachi.github.io";
const BRANCH = "main";

const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW_ROOT = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

async function getJSON(url) {
  const response = await fetch(url, {
    cache: "no-store",
    headers: { Accept: "application/vnd.github+json" }
  });

  if (!response.ok) {
    throw new Error(`Could not load ${url}: ${response.status}`);
  }

  return response.json();
}

async function getText(url) {
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Could not load ${url}: ${response.status}`);
  }

  return response.text();
}

function element(tag, className, content) {
  const node = document.createElement(tag);

  if (className) node.className = className;
  if (content !== undefined) node.textContent = content;

  return node;
}

function safeWebURL(value) {
  if (typeof value !== "string" || !value.trim()) return "";

  try {
    const url = new URL(value, window.location.origin);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return url.href;
    }
  } catch (_) {}

  return "";
}

function addLink(container, label, value) {
  const url = safeWebURL(value);
  if (!url) return;

  const link = element("a", "btn secondary", label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  container.appendChild(link);
}

function setSectionVisibility(settings) {
  const sections = {
    about: "showAbout",
    projects: "showProjects",
    skills: "showSkills",
    certifications: "showCertifications",
    experience: "showExperience",
    contact: "showContact"
  };

  Object.entries(sections).forEach(([id, setting]) => {
    const section = document.getElementById(id);
    const navLink = document.querySelector(
      `#navlinks a[href="#${id}"]`
    );

    // Experience remains hidden unless explicitly enabled.
    const defaultVisible = id !== "experience";
    const visible = settings[setting] ?? defaultVisible;

    if (section) section.hidden = !visible;
    if (navLink) navLink.hidden = !visible;
  });
}

function renderProfile(profile, settings) {
  const brand = document.querySelector(".brand");
  if (brand && profile.name) {
    brand.replaceChildren(
      document.createTextNode(profile.name),
      element("span", "", ".")
    );
  }

  const eyebrow = document.querySelector(".hero .eyebrow");
  if (eyebrow && profile.headline) {
    eyebrow.textContent = profile.headline;
  }

  const lead = document.querySelector(".hero .lead");
  if (lead && settings.introduction) {
    lead.textContent = settings.introduction;
  }

  const photo = document.querySelector(".profile-frame img");
  if (photo && profile.photo) {
    photo.src = profile.photo;
    photo.alt = `Professional portrait of ${profile.name || "the portfolio owner"}`;
  }

  const cvLink = document.getElementById("downloadCV");
  if (cvLink && profile.cv) {
    cvLink.href = profile.cv;
  }

  const aboutCopy = document.querySelector("#about .copy");
  if (aboutCopy && profile.biography) {
    aboutCopy.replaceChildren();

    profile.biography
      .split(/\n\s*\n/)
      .map(paragraph => paragraph.trim())
      .filter(Boolean)
      .forEach(paragraph => {
        const p = element("p");
        const phrase = /data analyst/ig;
        let cursor = 0;
        let match;
        while ((match = phrase.exec(paragraph)) !== null) {
          p.appendChild(document.createTextNode(paragraph.slice(cursor, match.index)));
          const strong = element("strong", "", match[0]);
          strong.style.fontWeight = "800";
          strong.style.color = "var(--text)";
          p.appendChild(strong);
          cursor = match.index + match[0].length;
        }
        p.appendChild(document.createTextNode(paragraph.slice(cursor)));
        aboutCopy.appendChild(p);
      });
  }
}

function renderProjects(projects) {
  const container = document.getElementById("projectsGrid");
  if (!container) return;

  container.replaceChildren();

  const published = projects
    .filter(project => project.published !== false)
    .sort((a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)));

  published.forEach((project, index) => {
    const card = element("article", "card project");
    const projectSlug = project.slug || String(project.title || "project").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const detailURL = "details.html?type=project&slug=" + encodeURIComponent(projectSlug);
    card.style.cursor = "pointer";
    card.addEventListener("click", event => {
      if (!event.target.closest("a")) window.location.href = detailURL;
    });

    if (project.image) {
      const image = element("img");
      image.src = project.image;
      image.alt = `${project.title || "Project"} screenshot`;
      image.loading = "lazy";
      image.style.cssText =
        "width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:12px;margin-bottom:18px";
      card.appendChild(image);
    }

    const top = element("div", "project-top");
    top.appendChild(
      element("span", "project-type", project.category || "Data analytics")
    );
    top.appendChild(
      element("span", "", String(index + 1).padStart(2, "0"))
    );

    card.appendChild(top);
    card.appendChild(
      element("h3", "", project.title || "Untitled project")
    );
    card.appendChild(
      (() => { const summary = element("p", "", project.overview || project.description || ""); summary.style.whiteSpace = "pre-line"; return summary; })()
    );

    const tags = element("div", "tags");
    (Array.isArray(project.tools) ? project.tools : []).forEach(tool => {
      tags.appendChild(element("span", "tag", tool));
    });
    card.appendChild(tags);

    const links = element("div", "project-links");
    addLink(links, "GitHub repository ↗", project.githubUrl);
    addLink(links, "Dashboard ↗", project.dashboardUrl);
    addLink(links, "Case study ↗", project.caseStudyUrl);

    if (links.children.length) card.appendChild(links);
    const detailLink = element("a", "project-links", "View project details →");
    detailLink.href = detailURL;
    detailLink.style.marginTop = "16px";
    card.appendChild(detailLink);
    container.appendChild(card);
  });
}

function renderSkills(skills) {
  const container = document.querySelector("#skills .skills-grid");
  if (!container) return;

  container.replaceChildren();

  skills.forEach(skill => {
    if (!skill) return;
    const coreSkill = skill.coreSkill || skill.name || "";
    const toolsUsed = Array.isArray(skill.toolsUsed) ? skill.toolsUsed : [];
    if (!coreSkill && !toolsUsed.length) return;

    const card = element("article", "card skill-card");
    card.appendChild(element("h3", "", coreSkill || "Core Skill"));

    const tools = element("div", "skill-tools");
    toolsUsed.forEach(tool => {
      tools.appendChild(element("span", "tag", tool));
    });
    if (toolsUsed.length) card.appendChild(tools);
    container.appendChild(card);
  });
}
function renderCertifications(certifications) {
  const container = document.querySelector("#certifications .cert-list");
  if (!container) return;

  container.replaceChildren();

  certifications.forEach(certification => {
    const card = element("article", "card cert");
    const certSlug = certification.slug || String(certification.name || "certificate").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const detailURL = "details.html?type=certification&slug=" + encodeURIComponent(certSlug);
    card.style.cursor = "pointer";
    card.addEventListener("click", event => {
      if (!event.target.closest("a")) window.location.href = detailURL;
    });

    if (certification.image) {
      const image = element("img");
      image.src = certification.image;
      image.alt = `${certification.name || "Certificate"} image`;
      image.loading = "lazy";
      image.style.cssText =
        "width:64px;height:64px;object-fit:contain;border-radius:8px";
      card.appendChild(image);
    } else {
      const mark = element(
        "div",
        "cert-mark",
        (certification.name || "C").slice(0, 2)
      );
      card.appendChild(mark);
    }

    const details = element("div");
    const title = element("h3", "", certification.name || "Certificate");
    const credentialURL = safeWebURL(certification.credentialUrl);

    if (credentialURL) {
      const link = element("a", "", certification.name || "Certificate");
      link.href = credentialURL;
      link.target = "_blank";
      link.rel = "noreferrer";
      title.replaceChildren(link);
    }

    details.appendChild(title);

    const date = certification.date || "";

    const issuerAndDate = [
      certification.issuer,
      date
    ].filter(Boolean).join(" · ");

    details.appendChild(element("p", "", issuerAndDate));
    const detailLink = element("a", "", "View certificate →");
    detailLink.href = detailURL;
    detailLink.style.cssText = "display:inline-block;margin-top:9px;color:var(--accent);font-size:12px;font-weight:700";
    details.appendChild(detailLink);
    card.appendChild(details);
    container.appendChild(card);
  });
}

function renderContact(contact) {
  const actions = document.querySelector("#contact .actions");
  if (!actions) return;

  actions.replaceChildren();

  if (contact.email) {
    const email = element("a", "btn primary", "Email me");
    email.href = `mailto:${contact.email}`;
    actions.appendChild(email);
  }

  addLink(actions, "LinkedIn ↗", contact.linkedin);
  addLink(actions, "GitHub ↗", contact.github);
  addLink(actions, "Tableau ↗", contact.tableau);
  addLink(actions, "YouTube ↗", contact.youtube);

  if (Array.isArray(contact.otherLinks)) {
    contact.otherLinks.forEach((link, index) => {
      addLink(actions, `Other link ${index + 1} ↗`, link);
    });
  }
}

async function loadCollection(tree, folder) {
  const files = tree.filter(item =>
    item.type === "blob" &&
    item.path.startsWith(`${folder}/`) &&
    item.path.endsWith(".json") &&
    !item.path.slice(folder.length + 1).includes("/")
  );

  const records = await Promise.all(
    files.map(async file => {
      try {
        const data = await getJSON(`${RAW_ROOT}/${file.path}`);
        const slug = file.path.split("/").pop().replace(/\.json$/, "");
        return (Array.isArray(data) ? data : [data]).filter(Boolean).map(record => ({ ...record, slug }));
      } catch (error) {
        console.error(`Could not load ${file.path}`, error);
        return null;
      }
    })
  );

  // Pages CMS entries may be stored as one object or as an array of records.
  // Flatten both shapes so projects and certifications render consistently.
  return records.filter(Boolean).flat();
}

async function loadPortfolio() {
  try {
    // Apply CMS section visibility as soon as settings load, independently
    // of the other portfolio content requests.
    const settings = await getJSON(`${RAW_ROOT}/data/settings.json`);
    setSectionVisibility(settings);

    const [profile, contact, repositoryTree] = await Promise.all([
      getJSON(`${RAW_ROOT}/data/profile.json`),
      getJSON(`${RAW_ROOT}/data/contact.json`),
      getJSON(`${API_ROOT}/git/trees/${BRANCH}?recursive=1`)
    ]);

    if (repositoryTree.truncated) {
      throw new Error("GitHub returned an incomplete repository file list.");
    }

    const tree = repositoryTree.tree || [];

    const [projects, skills, certifications] = await Promise.all([
      loadCollection(tree, "content/projects"),
      loadCollection(tree, "content/skills"),
      loadCollection(tree, "content/certifications")
    ]);

    renderProfile(profile, settings);
    renderProjects(projects);
    renderSkills(skills);
    renderCertifications(certifications);
    renderContact(contact);

    console.info("Portfolio content loaded from Pages CMS files.");
  } catch (error) {
    console.error("The portfolio could not load CMS content:", error);
  }
}

loadPortfolio();
