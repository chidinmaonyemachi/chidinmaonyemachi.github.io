const OWNER="chidinmaonyemachi",REPO="chidinmaonyemachi.github.io",BRANCH="main";
const API_ROOT=`https://api.github.com/repos/${OWNER}/${REPO}`,RAW_ROOT=`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const params=new URLSearchParams(location.search),type=params.get("type"),slug=params.get("slug"),root=document.getElementById("detailContent");
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function safeURL(value){if(typeof value!=="string"||!value.trim())return "";try{const u=new URL(value,location.origin);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch(_){return "";}}
function addSection(container,title,value,full=false){if(!value||(!Array.isArray(value)&&!String(value).trim()))return;const box=node("section",`detail-section${full?" full":""}`);box.appendChild(node("h2","",title));if(Array.isArray(value)){const ul=node("ul");value.filter(item=>item!==null&&item!==undefined&&String(item).trim()).forEach(item=>ul.appendChild(node("li","",String(item))));if(!ul.children.length)return;box.appendChild(ul);}else box.appendChild(node("p","",String(value)));container.appendChild(box);}
function addAction(container,label,url,primary=false){const href=safeURL(url);if(!href)return;const a=node("a",primary?"btn primary":"btn",label);a.href=href;a.target="_blank";a.rel="noreferrer";container.appendChild(a);}
function addPreview(container,src,alt,caption,isCert=false){const url=safeURL(src);if(!url){const empty=node("div","no-image",isCert?"Certificate image has not been added yet.":"Dashboard screenshot has not been added yet.");container.appendChild(empty);return;}const frame=node("div",isCert?"preview cert-preview":"preview");const image=node("img");image.src=url;image.alt=alt;image.loading="eager";image.addEventListener("click",()=>window.open(url,"_blank","noopener,noreferrer"));image.addEventListener("error",()=>{frame.replaceChildren(node("div","no-image","The image could not be loaded. Please check the image in Pages CMS."));});frame.appendChild(image);frame.appendChild(node("p","preview-caption",caption));container.appendChild(frame);}
function addGallery(container,images){const valid=images.map(safeURL).filter(Boolean);if(!valid.length)return;const box=node("section","detail-section full");box.appendChild(node("h2","","Additional project visuals"));const gallery=node("div","gallery");valid.forEach((url,index)=>{const link=node("a");link.href=url;link.target="_blank";link.rel="noreferrer";const image=node("img");image.src=url;image.alt=`Additional project visual ${index+1}`;image.loading="lazy";link.appendChild(image);gallery.appendChild(link);});box.appendChild(gallery);container.appendChild(box);}
function addDashboardPages(container,pages){if(!Array.isArray(pages)||!pages.length)return;const box=node("section","detail-section full");box.appendChild(node("h2","","Dashboard Pages"));const gallery=node("div","gallery");pages.forEach((page,index)=>{if(!page)return;const card=node("article","dashboard-page");const url=safeURL(page.image);if(url){const link=node("a");link.href=url;link.target="_blank";link.rel="noreferrer";const image=node("img");image.src=url;image.alt=`Dashboard page ${index+1}`;image.loading="lazy";link.appendChild(image);card.appendChild(link);}if(page.description)card.appendChild(node("p","preview-caption",page.description));if(card.children.length)gallery.appendChild(card);});if(gallery.children.length){box.appendChild(gallery);container.appendChild(box);}}
function addTags(container,title,items){if(!Array.isArray(items)||!items.length)return;const box=node("section","detail-section full");box.appendChild(node("h2","",title));const tags=node("div","tags");items.filter(Boolean).forEach(item=>tags.appendChild(node("span","tag",String(item))));if(tags.children.length){box.appendChild(tags);container.appendChild(box);}}
async function load(){
  if(!slug||!["project","certification"].includes(type))throw new Error("This detail page link is incomplete.");
  const isProject=type==="project",folder=isProject?"content/projects":"content/certifications";
  document.getElementById("backLink").href=isProject?"index.html#projects":"index.html#certifications";
  document.getElementById("backLink").textContent=isProject?"← Back to projects":"← Back to certifications";
  const response=await fetch(`${RAW_ROOT}/${folder}/${encodeURIComponent(slug)}.json`,{cache:"no-store"});
  if(!response.ok)throw new Error(response.status===404?"This entry could not be found. Check that it has been saved and published in Pages CMS.":"Could not load this entry. Please try again shortly.");
  const raw=await response.json(),record=Array.isArray(raw)?raw[0]:raw;if(!record)throw new Error("This portfolio entry is empty.");
  const title=record.title||record.name||"Portfolio details";document.title=`${title} | Chidinma Onyemachi`;root.replaceChildren();
  root.appendChild(node("div","eyebrow",isProject?(record.category||"Project case study"):"Certificate"));
  root.appendChild(node("h1","",title));
  const meta=node("div","meta-row");if(isProject){if(record.category)meta.appendChild(node("span","meta-chip",record.category));(Array.isArray(record.tools)?record.tools:[]).slice(0,5).forEach(tool=>meta.appendChild(node("span","meta-chip",tool)));}else{if(record.issuer)meta.appendChild(node("span","meta-chip",record.issuer));if(record.date)meta.appendChild(node("span","meta-chip",record.date));}
  if(meta.children.length)root.appendChild(meta);
  const summary=isProject?(record.overview||record.description):record.description;if(summary)root.appendChild(node("p","intro",summary));
  addPreview(root,record.image,isProject?`${title} dashboard screenshot`:`${title} certificate preview`,isProject?"Dashboard preview · Select the image to view it at full size.":"Certificate preview · Select the image to view it at full size.",!isProject);
  const grid=node("div","detail-grid");
  if(isProject){
    addSection(grid,"Business problem",record.businessProblem);
    addSection(grid,"Dataset and scope",record.dataset);
    addSection(grid,"Project objectives",record.objectives);
    addSection(grid,"Methodology and workflow",record.methodology);
    addSection(grid,"Key findings",record.keyFindings);
    addSection(grid,"Recommendations",record.recommendations);
    addSection(grid,"Outcome and learning",record.outcome,true);
    addSection(grid,"Business Value",record.businessValue,true);
    if(grid.children.length)root.appendChild(grid);
    addDashboardPages(root,Array.isArray(record.dashboardPages)?record.dashboardPages:[]);
    addGallery(root,Array.isArray(record.additionalImages)?record.additionalImages:[]);
    addTags(root,"Tools and technologies",record.tools);
  }else{
    addSection(grid,"About this certification",record.description,true);
    addSection(grid,"Skills and topics covered",record.skillsGained,true);
    if(grid.children.length)root.appendChild(grid);
  }
  const actions=node("div","actions");
  if(isProject){addAction(actions,"View GitHub repository ↗",record.githubUrl,true);addAction(actions,"Open live dashboard ↗",record.dashboardUrl);addAction(actions,"Read full case study ↗",record.caseStudyUrl);}
  else addAction(actions,"Verify credential ↗",record.credentialUrl,true);
  if(actions.children.length)root.appendChild(actions);
}
load().catch(error=>{root.replaceChildren(node("h1","","Details unavailable"),node("p","error",error.message));const back=node("a","btn","← Return to portfolio");back.href=type==="certification"?"index.html#certifications":"index.html#projects";root.appendChild(back);});