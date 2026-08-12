import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { feature } from "https://cdn.jsdelivr.net/npm/topojson-client@3.1.0/+esm";
import { MAP_CONFIG } from "./map-config.js";

const root = document.querySelector("[data-world-map]");
if (!root) throw new Error("World map root not found.");

const destinations = await fetch("/data/destinations/destinations.json").then(r => r.json());
const events = await fetch("/data/destinations/events.json").then(r => r.json());

const width = 1200, height = 620;
const svg = d3.select(root.querySelector(".world-map-canvas"))
  .attr("viewBox", `0 0 ${width} ${height}`)
  .attr("role","img")
  .attr("aria-label","Interactive world map of Sunken Treasure Travels destinations and travel events.");

const projection = d3.geoNaturalEarth1().fitExtent([[24,80],[width-24,height-38]], {type:"Sphere"});
const path = d3.geoPath(projection);

const world = await fetch(MAP_CONFIG.worldAtlas).then(r => r.json());
const countries = feature(world, world.objects.countries);

svg.append("path").datum({type:"Sphere"}).attr("d",path).attr("fill","#071a2b");

svg.append("g").selectAll("path")
  .data(countries.features)
  .join("path")
  .attr("class","map-country")
  .attr("d",path);

const pointLayer = svg.append("g");
const destinationPoints = Object.fromEntries(destinations.map(item => [item.id, item.coordinates]));

const preview = root.querySelector("[data-map-preview]");
const previewImg = root.querySelector("[data-map-image]");
const previewKicker = root.querySelector("[data-map-kicker]");
const previewTitle = root.querySelector("[data-map-title]");
const previewText = root.querySelector("[data-map-text]");
const previewLink = root.querySelector("[data-map-link]");

function openPreview(item, pointType="destination"){
  previewKicker.textContent = pointType === "event" ? `Event • ${item.location || ""}` : item.category;
  previewTitle.textContent = item.name;
  previewText.textContent = item.description;
  previewImg.src = item.image || "/assets/images/destinations/latin-america-culture.png";
  previewImg.alt = item.name;
  previewLink.href = item.url || "#";
  preview.classList.add("is-open");
  preview.setAttribute("aria-hidden","false");
}
function closePreview(){
  preview.classList.remove("is-open");
  preview.setAttribute("aria-hidden","true");
}
root.querySelector("[data-map-close]").addEventListener("click",closePreview);

destinations.forEach(item=>{
  const coords=destinationPoints[item.id]; if(!coords) return;
  const [x,y]=projection(coords), type=item.type||"destination";
  const g=pointLayer.append("g").attr("transform",`translate(${x},${y})`);
  g.append("circle").attr("class",`map-point-pulse ${type}-pulse`).attr("r",type==="hub"?15:11);
  g.append("circle").attr("class",`map-point ${type}-point`).attr("r",type==="hub"?7:5.5)
   .attr("tabindex",0).attr("aria-label",item.name)
   .on("mouseenter",()=>openPreview(item)).on("focus",()=>openPreview(item)).on("click",()=>openPreview(item));
  if(type==="hub") g.append("circle").attr("r",11).attr("fill","none").attr("stroke","#8bd7ec").attr("stroke-width",1.5);
});
events.forEach(event=>{
  const [x,y]=projection(event.coordinates); if(!Number.isFinite(x)||!Number.isFinite(y)) return;
  const g=pointLayer.append("g").attr("transform",`translate(${x},${y})`);
  g.append("circle").attr("class","map-point-pulse event-pulse").attr("r",13);
  g.append("circle").attr("class","map-point event-point").attr("r",6).attr("tabindex",0).attr("aria-label",event.name)
   .on("mouseenter",()=>openPreview(event,"event")).on("focus",()=>openPreview(event,"event")).on("click",()=>openPreview(event,"event"));
});
const zoom = d3.zoom().scaleExtent([1,4]).on("zoom",e=>pointLayer.attr("transform",e.transform));
svg.call(zoom);

const soundButton=root.querySelector("[data-map-sound]");
let audio=null;
soundButton?.addEventListener("click",()=>{
  if(!audio){
    audio=new Audio("/assets/audio/ambient-travel.mp3");
    audio.loop=true;
  }
  if(audio.paused){audio.play().catch(()=>{});soundButton.textContent="Sound On";}else{audio.pause();soundButton.textContent="Sound Off";}
});
