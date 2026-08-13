import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm";
import { MAP_CONFIG } from "./map-config.js";

const root = document.querySelector("[data-world-map]");
if (!root) throw new Error("World map root not found.");

const getJSON = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
};

const [destinations, events, countryNames, experiences] = await Promise.all([
  getJSON("/data/destinations/destinations.json"),
  getJSON("/data/destinations/events.json"),
  getJSON("/data/destinations/countries.json"),
  getJSON("/data/experiences/experiences.json")
]);

const experienceById = new Map(experiences.map(item => [item.id, item]));
const width = 1200;
const height = 620;
const svg = d3.select(root.querySelector(".world-map-canvas"))
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("role", "application")
  .attr("aria-label", "Interactive world map of countries, Sunken Treasure Travels destinations, hubs and events.");

const projection = d3.geoNaturalEarth1().fitExtent([[24, 80], [width - 24, height - 38]], { type: "Sphere" });
const path = d3.geoPath(projection);
const world = await getJSON(MAP_CONFIG.worldAtlas);
const countries = feature(world, world.objects.countries);

const geographyLayer = svg.append("g").attr("class", "map-geography-layer");
const countryLayer = geographyLayer.append("g").attr("class", "map-country-layer");
const pointLayer = svg.append("g").attr("class", "map-point-layer");
const clusterLayer = svg.append("g").attr("class", "map-cluster-layer");

geographyLayer.append("path").datum({ type: "Sphere" }).attr("class", "map-ocean").attr("d", path);

const countryPaths = countryLayer.selectAll("path")
  .data(countries.features)
  .join("path")
  .attr("class", "map-country")
  .attr("d", path)
  .attr("tabindex", 0)
  .attr("role", "button");

const preview = root.querySelector("[data-map-preview]");
const previewImg = root.querySelector("[data-map-image]");
const previewKicker = root.querySelector("[data-map-kicker]");
const previewTitle = root.querySelector("[data-map-title]");
const previewText = root.querySelector("[data-map-text]");
const previewLink = root.querySelector("[data-map-link]");
const previewSecondary = root.querySelector("[data-map-secondary]");
const countryTooltip = root.querySelector("[data-country-tooltip]");
const countryTooltipTitle = root.querySelector("[data-country-tooltip-title]");
const zoomReadout = root.querySelector("[data-map-zoom-readout]");

function relatedExperience(item) {
  const ids = item.experienceIds || [];
  return ids.map(id => experienceById.get(id)).find(Boolean) || null;
}

function openPreview(item, pointType = "destination") {
  const isCountry = pointType === "country";
  const isCluster = pointType === "cluster";
  const experience = !isCountry && !isCluster ? relatedExperience(item) : null;
  previewKicker.textContent = isCountry
    ? `Country • ${item.region || "World"}`
    : isCluster
      ? `Map cluster • ${item.items.length} highlights`
      : pointType === "event"
        ? `Event • ${item.location || ""}`
        : `${item.markerType === "hub" ? "Hub" : "Destination"} • ${item.category || "Travel"}`;
  previewTitle.textContent = item.name;
  previewText.textContent = isCluster
    ? item.items.map(d => d.name).join(" • ")
    : item.description || `${item.name} is part of the Sunken Treasure Travels® world map.`;
  previewImg.src = item.image || "/assets/images/destinations/latin-america-culture.png";
  previewImg.alt = item.name;

  if (previewSecondary) {
    previewSecondary.hidden = true;
    previewSecondary.href = "#";
  }

  if (isCountry) {
    previewLink.href = `/pages/explore.html?type=country&id=${encodeURIComponent(item.id)}`;
    previewLink.textContent = "Explore country";
  } else if (isCluster) {
    previewLink.href = "#map";
    previewLink.textContent = "Zoom to separate";
  } else if (experience) {
    previewLink.href = experience.route;
    previewLink.textContent = `Explore ${experience.name}`;
    if (previewSecondary) {
      previewSecondary.hidden = false;
      previewSecondary.href = item.url || `/pages/explore.html?type=${pointType}&id=${encodeURIComponent(item.id)}`;
      previewSecondary.textContent = `Explore ${item.markerType === "event" ? "event" : "destination"}`;
    }
  } else {
    previewLink.href = item.url || `/pages/explore.html?type=${pointType}&id=${encodeURIComponent(item.id)}`;
    previewLink.textContent = "Explore";
  }
  preview.classList.add("is-open");
  preview.setAttribute("aria-hidden", "false");
}

function closePreview() {
  preview.classList.remove("is-open");
  preview.setAttribute("aria-hidden", "true");
}
root.querySelector("[data-map-close]")?.addEventListener("click", closePreview);

function countryName(featureDatum) {
  const id = String(featureDatum.id).replace(/^0+/, "") || "0";
  return countryNames[id] || `Country ${featureDatum.id}`;
}
function countryData(featureDatum) {
  const name = countryName(featureDatum);
  return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name, region: "World", description: `${name} is part of the global geography represented on the Sunken Treasure Travels® map.` };
}
function positionTooltip(event, name) {
  if (!countryTooltip) return;
  const rect = root.getBoundingClientRect();
  const x = event.clientX - rect.left + 14;
  const y = event.clientY - rect.top + 14;
  countryTooltip.style.left = `${Math.min(Math.max(8, x), Math.max(8, rect.width - 190))}px`;
  countryTooltip.style.top = `${Math.min(Math.max(8, y), Math.max(8, rect.height - 70))}px`;
  countryTooltipTitle.textContent = name;
  countryTooltip.classList.add("is-visible");
  countryTooltip.setAttribute("aria-hidden", "false");
}
function hideTooltip() {
  countryTooltip?.classList.remove("is-visible");
  countryTooltip?.setAttribute("aria-hidden", "true");
}

countryPaths
  .attr("aria-label", d => countryName(d))
  .on("mouseenter", function(event,d){ countryPaths.classed("is-active",false); d3.select(this).classed("is-active",true); positionTooltip(event,countryName(d)); })
  .on("mousemove", (event,d)=>positionTooltip(event,countryName(d)))
  .on("mouseleave", function(){ d3.select(this).classed("is-active",false); hideTooltip(); })
  .on("focus", function(event,d){ d3.select(this).classed("is-active",true); const r=this.getBoundingClientRect(); positionTooltip({clientX:r.left+r.width/2,clientY:r.top+r.height/2},countryName(d)); })
  .on("blur", function(){ d3.select(this).classed("is-active",false); hideTooltip(); })
  .on("click", (event,d)=>{ event.stopPropagation(); openPreview(countryData(d),"country"); })
  .on("keydown", (event,d)=>{ if(event.key==="Enter"||event.key===" "){event.preventDefault();openPreview(countryData(d),"country");}});

const markerData = [
  ...destinations.map(item => ({...item, markerType:item.type||"destination"})),
  ...events.filter(event=>event.approved!==false).map(item=>({...item,markerType:"event"}))
];
const projected = markerData.map(item=>({...item,base:projection(item.coordinates)})).filter(item=>item.base.every(Number.isFinite));
const markerGroups = new Map();
const markerElements = new Map();
function markerRadius(type){ return type==="hub"?6.5:type==="event"?6:5.2; }
function pulseRadius(type){ return type==="hub"?11:type==="event"?10:9; }
function createMarker(item){
  const g=pointLayer.append("g").attr("class",`map-marker map-marker-${item.markerType}`).attr("tabindex",0).attr("role","button").attr("aria-label",item.name).style("cursor","pointer");
  g.append("circle").attr("class","map-point-pulse").attr("r",pulseRadius(item.markerType));
  g.append("circle").attr("class","map-point").attr("r",markerRadius(item.markerType));
  if(item.markerType==="hub")g.append("circle").attr("class","map-hub-ring").attr("r",10);
  const handler=()=>openPreview(item,item.markerType==="event"?"event":"destination");
  g.on("mouseenter focus",handler).on("click",event=>{event.stopPropagation();handler();}).on("keydown",event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();handler();}});
  markerGroups.set(item.id,g); markerElements.set(item.id,item);
}
projected.forEach(createMarker);

function screenPoint(item,transform){return [transform.x+item.base[0]*transform.k,transform.y+item.base[1]*transform.k];}
function buildClusters(items,transform){
  const threshold=transform.k<1.55?34:transform.k<2.05?24:transform.k<2.8?14:0;
  if(!threshold)return items.map(item=>({items:[item],...Object.fromEntries(["x","y"].map((_,i)=>[_,screenPoint(item,transform)[i]]))}));
  const clusters=[];
  for(const item of items){const [x,y]=screenPoint(item,transform);let target=null;for(const c of clusters){if(Math.hypot(x-c.x,y-c.y)<=threshold){target=c;break;}}if(!target)clusters.push({items:[item],x,y});else{target.items.push(item);target.x=target.items.reduce((s,m)=>s+screenPoint(m,transform)[0],0)/target.items.length;target.y=target.items.reduce((s,m)=>s+screenPoint(m,transform)[1],0)/target.items.length;}}
  return clusters;
}
function renderMarkers(transform){
  markerGroups.forEach((g,id)=>{const item=markerElements.get(id);const [x,y]=screenPoint(item,transform);g.attr("transform",`translate(${x},${y})`).style("display",null);});
  clusterLayer.selectAll("g.map-cluster").remove();
  buildClusters(projected,transform).filter(c=>c.items.length>1).forEach(cluster=>{
    cluster.items.forEach(item=>markerGroups.get(item.id)?.style("display","none"));
    const g=clusterLayer.append("g").attr("class","map-cluster").attr("transform",`translate(${cluster.x},${cluster.y})`).attr("tabindex",0).attr("role","button").attr("aria-label",`${cluster.items.length} highlighted places`).on("mouseenter focus click",()=>openPreview({id:`cluster-${cluster.x}-${cluster.y}`,name:`${cluster.items.length} highlighted places`,items:cluster.items,description:"Zoom in to separate these highlighted destinations, hubs and events."},"cluster"));
    g.append("circle").attr("r",14);g.append("text").attr("dy",".35em").text(cluster.items.length);
  });
  zoomReadout.textContent=`${Math.round(transform.k*100)}%`;
}

let currentTransform=d3.zoomIdentity;
const zoom=d3.zoom().scaleExtent([1,4.5]).translateExtent([[0,0],[width,height]]).extent([[0,0],[width,height]]).on("zoom",event=>{currentTransform=event.transform;geographyLayer.attr("transform",currentTransform);renderMarkers(currentTransform);});
svg.call(zoom); renderMarkers(currentTransform);
root.querySelector("[data-map-zoom-in]")?.addEventListener("click",()=>svg.transition().duration(350).call(zoom.scaleBy,1.35));
root.querySelector("[data-map-zoom-out]")?.addEventListener("click",()=>svg.transition().duration(350).call(zoom.scaleBy,1/1.35));
root.querySelector("[data-map-reset]")?.addEventListener("click",()=>svg.transition().duration(350).call(zoom.transform,d3.zoomIdentity));
svg.on("click",event=>{if(event.target===svg.node())closePreview();});

const soundButton=root.querySelector("[data-map-sound]");
let audio=null;
soundButton?.addEventListener("click",()=>{if(!audio){audio=new Audio("/assets/audio/ambient-travel.mp3");audio.loop=true;}if(audio.paused){audio.play().catch(()=>{});soundButton.textContent="Sound On";}else{audio.pause();soundButton.textContent="Sound Off";}});
