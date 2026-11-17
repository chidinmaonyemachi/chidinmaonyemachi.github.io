const OWNER="chidinmaonyemachi",REPO="chidinmaonyemachi.github.io",BRANCH="main";
const API_ROOT=`https://api.github.com/repos/${OWNER}/${REPO}`,RAW_ROOT=`https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}`;
const params=new URLSearchParams(location.search),type=params.get("type"),slug=params.get("slug"),root=document.getElementById("detailContent");
function node(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function safeURL(value){if(typeof value!=="string"||!value.trim())return "";try{const u=new URL(value,location.origin);return ["https:","http:"].includes(u.protocol)?u.href:"";}catch(_){return "";}}
function section(title,value,full=false){if(!value||(!Array.isArray(value)&&!String(value).trim()))return null;const box=node("section",`detail-section${full?" full":""}`);box.appendChild(node("h2","",title));if(Array.isArray(value)){const ul=node("ul");value.filter(Boolean).forEach(item=>ul.appendChild(node("li","",item)));box.appendChild(ul);}else box.appendChild(node("p","",value));return box;}
function addAction(container,label,url){const href=safeURL(url);if(!href)return;const a=node("a","btn",label);a.href=href;a.target="_blank";a.rel="noreferrer";container.appendChild(a);}
async function load(){
  if(!slug||!["project","certification"].includes(type)){throw new Error("This detail page link is incomplete.");}
  const folder=type==="project"?"content/projects":"content/certifications";
  const treeResponse=await fetch(`${API_ROOT}/git/trees/${BRANCH}?recursive=1`,{cache:"no-store"});if(!treeResponse.ok)throw new Error("Could not retrieve portfolio records.");const tree=await treeResponse.json();
  const file=(tree.tree||[]).find(item=>item.type==="blob"&&item.path.startsWith(folder+"/")&&item.path.endsWith(`/${slug}.json`)&&item.path.split("/").length===3);
  if(!file)throw new Error("The requested portfolio entry could not be found.");
  const response=await fetch(`${RAW_ROOT}/${file.path}`,{cache:"no-store"});if(!response.ok)throw new Error("Could not load this portfolio entry.");
  const raw=await response.json(),record=Array.isArray(raw)?raw[0]:raw;if(!record)throw new Error("This portfolio entry is empty.");
  const isProject=type==="project";document.title=`${record.title||record.name} | Chidinma Onyemachi`;
  root.replaceChildren();root.appendChild(node("div","eyebrow",isProject?(record.category||"Project case study"):"Certification"));
  root.appendChild(node("h1","",record.title||record.name||"Portfolio details"));
  const meta=[record.issuer,record.date?new Date(`${record.date}T00:00:00`).toLocaleDateString(undefined,{month:"long",year:"numeric"}):""].filter(Boolean).join(" · ");
  if(meta)root.appendChild(node("p","meta",meta));
  if(record.image){const image=node("img","hero-image");image.src=record.image;image.alt=isProject?`${record.title} dashboard screenshot`:`${record.name} certificate preview`;root.appendChild(image);root.appendChild(node("p","image-caption",isProject?"Dashboard screenshot preview — select the image to open it at full size.":"Certificate preview — select the image to open it at full size."));image.style.cursor="zoom-in";image.addEventListener("click",()=>window.open(safeURL(record.image),"_blank","noopener"));}
  const grid=node("div","detail-grid");
  if(isProject){
    [["Project overview",record.overview||record.description,true],["Problem or business question",record.businessProblem,false],["Dataset and scope",record.dataset,false],["Project objectives",record.objectives,false],["Methodology and workflow",record.methodology,false],["Key findings",record.keyFindings,false],["Recommendations",record.recommendations,false],["Outcome and learning",record.outcome,false]].forEach(([title,value,full])=>{const s=section(title,value,full);if(s)grid.appendChild(s);});
    if(Array.isArray(record.additionalImages)&&record.additionalImages.length){const s=node("section","detail-section full");s.appendChild(node("h2","","Additional project visuals"));const list=node("div","tags");record.additionalImages.forEach(src=>{const a=node("a","btn","Open image ↗");a.href=safeURL(src)||"#";a.target="_blank";a.rel="noreferrer";list.appendChild(a);});s.appendChild(list);grid.appendChild(s);}
    if(Array.isArray(record.tools)&&record.tools.length){const s=node("section","detail-section full");s.appendChild(node("h2","","Tools and technologies"));const tags=node("div","tags");record.tools.forEach(tool=>tags.appendChild(node("span","tag",tool)));s.appendChild(tags);grid.appendChild(s);}
  }else{
    [["About this certification",record.description,true],["Skills and topics covered",record.skillsGained,false]].forEach(([title,value,full])=>{const s=section(title,value,full);if(s)grid.appendChild(s);});
  }
  if(grid.children.length)root.appendChild(grid);
  const actions=node("div","actions");if(isProject){addAction(actions,"GitHub repository ↗",record.githubUrl);addAction(actions,"Open dashboard ↗",record.dashboardUrl);addAction(actions,"External case study ↗",record.caseStudyUrl);}else addAction(actions,"Verify credential ↗",record.credentialUrl);
  if(actions.children.length)root.appendChild(actions);
  if(!grid.children.length&&!record.image&&!actions.children.length)root.appendChild(node("p","meta","More information for this entry will appear here when it is added in Pages CMS."));
}
load().catch(error=>{root.replaceChildren(node("h1","","Details unavailable"),node("p","error",error.message),node("a","btn","← Return to portfolio"));root.querySelector("a").href="index.html";});
