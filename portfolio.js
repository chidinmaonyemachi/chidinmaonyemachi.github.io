const OWNER = "chidinmaonyemachi";
const REPO = "chidinmaonyemachi.github.io";
const BRANCH = "main";
const API_ROOT = `https://api.github.com/repos/${OWNER}/${REPO}`;
const RAW_ROOT = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;

async function getJSON(url) {
  const response = await fetch(url, {cache:"no-store",headers:{Accept:"application/vnd.github+json"}});
  if (!response.ok) throw new Error(`Could not load ${url}: ${response.status}`);
  return response.json();
}
function element(tag,className,content){const node=document.createElement(tag);if(className)node.className=className;if(content!==undefined)node.textContent=content;return node;}
function safeWebURL(value){if(typeof value!=="string"||!value.trim())return "";try{const url=new URL(value,window.location.origin);return url.protocol==="https:"||url.protocol==="http:"?url.href:"";}catch(_){return "";}}
function addLink(container,label,value){const url=safeWebURL(value);if(!url)return;const link=element("a","btn secondary",label);link.href=url;link.target="_blank";link.rel="noreferrer";container.appendChild(link);}
function setSectionVisibility(settings){
  const sections={about:"showAbout",projects:"showProjects",skills:"showSkills",certifications:"showCertifications",experience:"showExperience",contact:"showContact"};
  Object.entries(sections).forEach(([id,setting])=>{const section=document.getElementById(id);const navLink=document.querySelector(`#navlinks a[href="#${id}"]`);const visible=settings[setting]??(id!=="experience");if(section)section.hidden=!visible;if(navLink)navLink.hidden=!visible;});
}
function appendHighlightedText(container,text,phrase){
  const regex=new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"ig");let cursor=0,match;
  while((match=regex.exec(text))!==null){container.appendChild(document.createTextNode(text.slice(cursor,match.index)));const strong=element("strong","about-highlight",match[0]);container.appendChild(strong);cursor=match.index+match[0].length;}
  container.appendChild(document.createTextNode(text.slice(cursor)));
}
function renderProfile(profile,settings){
  const brand=document.querySelector(".brand");if(brand&&profile.name)brand.replaceChildren(document.createTextNode(profile.name),element("span","","."));
  const eyebrow=document.querySelector(".hero .eyebrow");if(eyebrow&&profile.headline)eyebrow.textContent=profile.headline;
  const lead=document.querySelector(".hero .lead");if(lead&&settings.introduction)lead.textContent=settings.introduction;
  const photo=document.querySelector(".profile-frame img");if(photo&&profile.photo){photo.src=profile.photo;photo.alt=`Professional portrait of ${profile.name||"the portfolio owner"}`;}
  const aboutCopy=document.querySelector("#about .copy");
  if(aboutCopy&&profile.biography){aboutCopy.replaceChildren();profile.biography.split(/\n\s*\n/).map(p=>p.trim()).filter(Boolean).forEach(paragraph=>{const p=element("p");appendHighlightedText(p,paragraph,"data analyst");aboutCopy.appendChild(p);});}
}
function slugify(value){return String(value||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function renderProjects(projects){
  const container=document.getElementById("projectsGrid");if(!container)return;container.replaceChildren();
  projects.filter(p=>p.published!==false).sort((a,b)=>Number(Boolean(b.featured))-Number(Boolean(a.featured))).forEach((project,index)=>{
    const card=element("article","card project");
    if(project.image){const image=element("img","project-preview");image.src=project.image;image.alt=`${project.title||"Project"} dashboard screenshot preview`;image.loading="lazy";card.appendChild(image);}
    const top=element("div","project-top");top.appendChild(element("span","project-type",project.category||"Data analytics"));top.appendChild(element("span","",String(index+1).padStart(2,"0")));card.appendChild(top);
    card.appendChild(element("h3","",project.title||"Untitled project"));card.appendChild(element("p","",project.description||""));
    const tags=element("div","tags");(Array.isArray(project.tools)?project.tools:[]).forEach(tool=>tags.appendChild(element("span","tag",tool)));card.appendChild(tags);
    const slug=project.slug||slugify(project.title);const details=element("a","project-cta","View project details →");details.href=`details.html?type=project&slug=${encodeURIComponent(slug)}`;card.appendChild(details);
    const links=element("div","project-links");addLink(links,"GitHub repository ↗",project.githubUrl);addLink(links,"Dashboard ↗",project.dashboardUrl);if(links.children.length)card.appendChild(links);
    container.appendChild(card);
  });
}
function renderSkills(skills){
  const container=document.querySelector("#skills .skills-grid");if(!container)return;container.replaceChildren();
  skills.forEach(skill=>{const card=element("article","card skill-card");card.appendChild(element("div","skill-icon",(skill.name||"S").trim().slice(0,3)));card.appendChild(element("h3","",skill.name||"Skill"));card.appendChild(element("p","",[skill.category,skill.proficiency].filter(Boolean).join(" · ")));container.appendChild(card);});
}
function renderCertifications(certifications){
  const container=document.querySelector("#certifications .cert-list");if(!container)return;container.replaceChildren();
  certifications.forEach(cert=>{const card=element("article","card cert");
    if(cert.image){const image=element("img","cert-image-thumb");image.src=cert.image;image.alt=`${cert.name||"Certificate"} preview`;image.loading="lazy";card.appendChild(image);}else card.appendChild(element("div","cert-mark",(cert.name||"C").slice(0,2)));
    const details=element("div");details.appendChild(element("h3","",cert.name||"Certificate"));
    const date=cert.date?new Date(`${cert.date}T00:00:00`).toLocaleDateString(undefined,{month:"long",year:"numeric"}):"";
    details.appendChild(element("p","",[cert.issuer,date].filter(Boolean).join(" · ")));
    const slug=cert.slug||slugify(cert.name);const link=element("a","cert-cta","View certificate details →");link.href=`details.html?type=certification&slug=${encodeURIComponent(slug)}`;details.appendChild(link);
    card.appendChild(details);container.appendChild(card);
  });
}
function renderContact(contact){
  const actions=document.querySelector("#contact .actions");if(!actions)return;actions.replaceChildren();
  if(contact.email){const email=element("a","btn primary","Email me");email.href=`mailto:${contact.email}`;actions.appendChild(email);}
  addLink(actions,"LinkedIn ↗",contact.linkedin);addLink(actions,"GitHub ↗",contact.github);addLink(actions,"Tableau ↗",contact.tableau);
  if(Array.isArray(contact.otherLinks))contact.otherLinks.forEach((link,index)=>addLink(actions,`Other link ${index+1} ↗`,link));
}
async function loadCollection(tree,folder){
  const files=tree.filter(item=>item.type==="blob"&&item.path.startsWith(`${folder}/`)&&item.path.endsWith(".json")&&!item.path.slice(folder.length+1).includes("/"));
  const records=await Promise.all(files.map(async file=>{try{const data=await getJSON(`${RAW_ROOT}/${file.path}`);const slug=file.path.split("/").pop().replace(/\.json$/,"");return (Array.isArray(data)?data:[data]).filter(Boolean).map(record=>({...record,slug}));}catch(error){console.error(`Could not load ${file.path}`,error);return [];}}));
  return records.flat();
}
async function loadPortfolio(){
  try{
    const [profile,contact,settings,repositoryTree]=await Promise.all([getJSON(`${RAW_ROOT}/data/profile.json`),getJSON(`${RAW_ROOT}/data/contact.json`),getJSON(`${RAW_ROOT}/data/settings.json`),getJSON(`${API_ROOT}/git/trees/${BRANCH}?recursive=1`)]);
    if(repositoryTree.truncated)throw new Error("GitHub returned an incomplete repository file list.");
    const tree=repositoryTree.tree||[];
    const [projects,skills,certifications]=await Promise.all([loadCollection(tree,"content/projects"),loadCollection(tree,"content/skills"),loadCollection(tree,"content/certifications")]);
    setSectionVisibility(settings);renderProfile(profile,settings);renderProjects(projects);renderSkills(skills);renderCertifications(certifications);renderContact(contact);
    console.info("Portfolio content loaded from Pages CMS files.");
  }catch(error){console.error("The portfolio could not load CMS content:",error);}
}
loadPortfolio();
