const root = document.querySelector("[data-world-map]");
if (!root) throw new Error("World map root not found.");

const getJSON = async (url) => {
  const response = await fetch(url, {cache:"no-store"});
  if (!response.ok) throw new Error(`Unable to load ${url}`);
  return response.json();
};

const [destinations, events, countries, experiences, worldGeo, regionImages, destinationRegionImages] = await Promise.all([
  getJSON("/data/destinations/destinations.json"),
  getJSON("/data/destinations/events.json"),
  getJSON("/data/destinations/countries-full.json"),
  getJSON("/data/experiences/experiences.json"),
  getJSON("/data/destinations/world-geo.json"),
  getJSON("/data/destinations/region-images.json"),
  getJSON("/data/destinations/destination-region-images.json")
]);

const width=1200, height=620;
const svg=root.querySelector(".world-map-canvas");
svg.setAttribute("viewBox",`0 0 ${width} ${height}`);
svg.setAttribute("role","application");
svg.setAttribute("aria-label","Interactive world map showing countries, featured destinations, travel hubs and events.");

const mapLayer=document.createElementNS("http://www.w3.org/2000/svg","g");
const countryLayer=document.createElementNS("http://www.w3.org/2000/svg","g");
const markerLayer=document.createElementNS("http://www.w3.org/2000/svg","g");
const hitLayer=document.createElementNS("http://www.w3.org/2000/svg","g");
mapLayer.classList.add("map-world-layer"); countryLayer.classList.add("map-country-layer"); markerLayer.classList.add("map-marker-layer"); hitLayer.classList.add("map-country-hit-layer");
mapLayer.append(countryLayer); mapLayer.append(hitLayer); mapLayer.append(markerLayer); svg.append(mapLayer);

const NS="http://www.w3.org/2000/svg";
const projection=(lon,lat)=>[(lon+180)/360*width,(90-lat)/180*height];
function pathD(geometry){
  const ringPath=(ring)=>ring.map((p,i)=>{const [x,y]=projection(p[0],p[1]);return `${i?'L':'M'}${x.toFixed(2)},${y.toFixed(2)}`}).join(' ')+' Z';
  if(!geometry)return '';
  if(geometry.type==='Polygon') return geometry.coordinates.map(ringPath).join(' ');
  if(geometry.type==='MultiPolygon') return geometry.coordinates.map(poly=>poly.map(ringPath).join(' ')).join(' ');
  return '';
}

// Ocean background and a subtle graticule.
const ocean=document.createElementNS(NS,'rect'); ocean.setAttribute('class','map-ocean'); ocean.setAttribute('x','0'); ocean.setAttribute('y','0'); ocean.setAttribute('width',width); ocean.setAttribute('height',height); countryLayer.append(ocean);
for(let lon=-180;lon<=180;lon+=30){const [x]=projection(lon,0);const line=document.createElementNS(NS,'line');line.setAttribute('class','map-gridline');line.setAttribute('x1',x);line.setAttribute('x2',x);line.setAttribute('y1',0);line.setAttribute('y2',height);countryLayer.append(line)}
for(let lat=-60;lat<=60;lat+=30){const [,y]=projection(0,lat);const line=document.createElementNS(NS,'line');line.setAttribute('class','map-gridline');line.setAttribute('x1',0);line.setAttribute('x2',width);line.setAttribute('y1',y);line.setAttribute('y2',y);countryLayer.append(line)}

const countryByIso=new Map(countries.map(c=>[c.iso3,c]));
const geometryIsos=new Set();
worldGeo.features.forEach(f=>{
  geometryIsos.add(f.id);
  const p=document.createElementNS(NS,'path'); p.setAttribute('class','map-country'); p.setAttribute('d',pathD(f.geometry)); p.setAttribute('tabindex','0'); p.setAttribute('role','button'); p.dataset.iso=f.id;
  const c=countryByIso.get(f.id); const name=c?.name || f.properties?.name || f.id;
  p.setAttribute('aria-label',name); p.dataset.name=name;
  p.addEventListener('mouseenter',e=>countryHover(e,c||{name,region:'World'}));
  p.addEventListener('mousemove',e=>countryHover(e,c||{name,region:'World'}));
  p.addEventListener('mouseleave',hideTooltip); p.addEventListener('focus',()=>countryFocus(p,c||{name,region:'World'})); p.addEventListener('blur',hideTooltip);
  p.addEventListener('click',e=>{e.stopPropagation();openCountry(c||{name,region:'World',coordinates:[0,0],iso3:f.id})});
  p.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCountry(c||{name,region:'World',coordinates:[0,0],iso3:f.id})}});
  countryLayer.append(p);
});

// Countries without local geometry still get an explicit, keyboard-accessible hit target.
const hitRadius=(c)=>Math.max(5,Math.min(20,6+Math.sqrt(Math.max(1,(c.population||1000000))/10000000)));
countries.filter(c=>!geometryIsos.has(c.iso3)).forEach(c=>{
  const [x,y]=projection(c.coordinates[0],c.coordinates[1]); const h=document.createElementNS(NS,'circle'); h.setAttribute('class','map-country-hit'); h.setAttribute('cx',x); h.setAttribute('cy',y); h.setAttribute('r',hitRadius(c)); h.setAttribute('tabindex','0'); h.setAttribute('role','button'); h.setAttribute('aria-label',c.name); h.dataset.name=c.name;
  h.addEventListener('mouseenter',e=>countryHover(e,c));h.addEventListener('mousemove',e=>countryHover(e,c));h.addEventListener('mouseleave',hideTooltip);h.addEventListener('focus',()=>countryFocus(h,c));h.addEventListener('blur',hideTooltip);h.addEventListener('click',()=>openCountry(c));h.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();openCountry(c)}});hitLayer.append(h);
});

const experienceById=new Map(experiences.map(x=>[x.id,x]));
const regionByName=new Map(countries.map(c=>[c.name.toLowerCase(),c.region]));
function regionForItem(item){
  if(destinationRegionImages[item.name?.toLowerCase()]) return destinationRegionImages[item.name.toLowerCase()];
  const loc=(item.location||item.name||'').toLowerCase();
  for(const [name,region] of regionByName){if(loc.includes(name))return region;}
  return item.region || 'World';
}
function imageForItem(item){
  const r=regionForItem(item); return item.image && !item.image.includes('latin-america-culture') ? item.image : (regionImages[r]||regionImages.World);
}

const preview=root.querySelector('[data-map-preview]'), previewImg=root.querySelector('[data-map-image]'), previewKicker=root.querySelector('[data-map-kicker]'), previewTitle=root.querySelector('[data-map-title]'), previewText=root.querySelector('[data-map-text]'), previewLink=root.querySelector('[data-map-link]'), previewSecondary=root.querySelector('[data-map-secondary]');
const tooltip=root.querySelector('[data-country-tooltip]'), tooltipTitle=root.querySelector('[data-country-tooltip-title]'), zoomReadout=root.querySelector('[data-map-zoom-readout]');
function showPreview({name,kicker,text,image,primaryHref='#',primaryText='Explore',secondaryHref=null,secondaryText=''}){
 previewImg.src=image||regionImages.World; previewImg.alt=name; previewKicker.textContent=kicker||''; previewTitle.textContent=name; previewText.textContent=text||''; previewLink.href=primaryHref; previewLink.textContent=primaryText;
 if(secondaryHref){previewSecondary.hidden=false;previewSecondary.href=secondaryHref;previewSecondary.textContent=secondaryText||'Explore'}else{previewSecondary.hidden=true;previewSecondary.href='#'}
 preview.classList.add('is-open');preview.setAttribute('aria-hidden','false');
}
function closePreview(){preview.classList.remove('is-open');preview.setAttribute('aria-hidden','true')}
root.querySelector('[data-map-close]')?.addEventListener('click',closePreview);
function positionTooltip(e,name){if(!tooltip)return;const rect=root.getBoundingClientRect();const x=(e.clientX??rect.left+20)-rect.left+14,y=(e.clientY??rect.top+20)-rect.top+14;tooltip.style.left=`${Math.min(Math.max(8,x),Math.max(8,rect.width-190))}px`;tooltip.style.top=`${Math.min(Math.max(8,y),Math.max(8,rect.height-55))}px`;tooltipTitle.textContent=name;tooltip.classList.add('is-visible');tooltip.setAttribute('aria-hidden','false')}
function hideTooltip(){tooltip?.classList.remove('is-visible');tooltip?.setAttribute('aria-hidden','true')}
function countryHover(e,c){document.querySelectorAll('.map-country.is-active').forEach(x=>x.classList.remove('is-active'));positionTooltip(e,c.name);if(e.currentTarget?.classList)e.currentTarget.classList.add('is-active')}
function countryFocus(el,c){el.classList.add('is-active');const r=el.getBoundingClientRect();positionTooltip({clientX:r.left+r.width/2,clientY:r.top+r.height/2},c.name)}
function openCountry(c){showPreview({name:c.name,kicker:`Country • ${c.region||'World'}`,text:`Explore ${c.name} as part of the global geography represented by Sunken Treasure Travels®. Featured markers show selected destinations, hubs and events—not the limits of where we can take you.`,image:regionImages[c.region]||regionImages.World,primaryHref:`/pages/explore.html?type=country&id=${encodeURIComponent(c.iso3||c.id)}`,primaryText:'Explore country'})}

const markerData=[...destinations.map(x=>({...x,markerType:x.type||'destination'})),...events.filter(x=>x.approved!==false).map(x=>({...x,markerType:'event'}))];
const markers=[];
function relatedExperience(item){return (item.experienceIds||[]).map(id=>experienceById.get(id)).find(Boolean)||null}
function createMarker(item){const [x,y]=projection(item.coordinates[0],item.coordinates[1]);const g=document.createElementNS(NS,'g');g.setAttribute('class',`map-marker map-marker-${item.markerType}`);g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',item.name);g.dataset.baseX=x;g.dataset.baseY=y;const pulse=document.createElementNS(NS,'circle');pulse.setAttribute('class','map-point-pulse');pulse.setAttribute('r',item.markerType==='hub'?10:item.markerType==='event'?9:8);const dot=document.createElementNS(NS,'circle');dot.setAttribute('class','map-point');dot.setAttribute('r',item.markerType==='hub'?6:item.markerType==='event'?5.5:5);g.append(pulse,dot);if(item.markerType==='hub'){const ring=document.createElementNS(NS,'circle');ring.setAttribute('class','map-hub-ring');ring.setAttribute('r',10);g.append(ring)}
 const open=()=>{const exp=relatedExperience(item);showPreview({name:item.name,kicker:`${item.markerType==='hub'?'Hub':item.markerType==='event'?'Event':'Destination'} • ${item.location||''}`,text:item.description||`Explore ${item.name}.`,image:imageForItem(item),primaryHref:exp?.route||item.url||`/pages/explore.html?type=${item.markerType==='event'?'event':'destination'}&id=${encodeURIComponent(item.id)}`,primaryText:exp?`Explore ${exp.name}`:'Explore',secondaryHref:exp?(item.url||`/pages/explore.html?type=${item.markerType==='event'?'event':'destination'}&id=${encodeURIComponent(item.id)}`):null,secondaryText:exp?`Explore ${item.markerType==='event'?'event':'destination'}`:''})};
 g.addEventListener('mouseenter',open);g.addEventListener('focus',open);g.addEventListener('click',e=>{e.stopPropagation();open()});g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}});markerLayer.append(g);markers.push({item,g,x,y})}
markerData.forEach(createMarker);

let transform={x:0,y:0,k:1};
function clampTransform(t){const k=t.k;const minX=width*(1-k),maxX=0,minY=height*(1-k),maxY=0;return {k,x:Math.min(maxX,Math.max(minX,t.x)),y:Math.min(maxY,Math.max(minY,t.y))}}
function applyTransform(){transform=clampTransform(transform);countryLayer.setAttribute('transform',`translate(${transform.x},${transform.y}) scale(${transform.k})`);hitLayer.setAttribute('transform',`translate(${transform.x},${transform.y}) scale(${transform.k})`);renderMarkers();zoomReadout.textContent=`${Math.round(transform.k*100)}%`}
function renderMarkers(){const threshold=transform.k<1.35?32:transform.k<1.8?22:transform.k<2.5?14:0;const cells=[];for(const m of markers){const sx=transform.x+m.x*transform.k,sy=transform.y+m.y*transform.k;m.g.setAttribute('transform',`translate(${sx},${sy})`);m.g.style.display='';if(threshold){let cell=cells.find(c=>Math.hypot(sx-c.x,sy-c.y)<=threshold);if(!cell){cell={x:sx,y:sy,items:[m]};cells.push(cell)}else{cell.items.push(m);cell.x=cell.items.reduce((s,z)=>s+transform.x+z.x*transform.k,0)/cell.items.length;cell.y=cell.items.reduce((s,z)=>s+transform.y+z.y*transform.k,0)/cell.items.length}}}else cells.push({x:sx,y:sy,items:[m]});}
 // hide clustered markers and build cluster bubbles
 markerLayer.querySelectorAll('.map-cluster').forEach(x=>x.remove());
 cells.filter(c=>c.items.length>1).forEach(c=>{c.items.forEach(m=>m.g.style.display='none');const g=document.createElementNS(NS,'g');g.setAttribute('class','map-cluster');g.setAttribute('transform',`translate(${c.x},${c.y})`);g.setAttribute('tabindex','0');g.setAttribute('role','button');g.setAttribute('aria-label',`${c.items.length} highlighted places`);const circle=document.createElementNS(NS,'circle');circle.setAttribute('r',14);const text=document.createElementNS(NS,'text');text.setAttribute('dy','.35em');text.textContent=c.items.length;g.append(circle,text);const open=()=>showPreview({name:`${c.items.length} highlighted places`,kicker:'Map cluster',text:c.items.map(m=>m.item.name).join(' • '),image:imageForItem(c.items[0].item),primaryHref:'#map',primaryText:'Zoom to separate'});g.addEventListener('mouseenter',open);g.addEventListener('focus',open);g.addEventListener('click',open);markerLayer.append(g)})}
applyTransform();

// Pointer pan and wheel zoom.
let drag=null;
svg.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,x:e.clientX,y:e.clientY,tx:transform.x,ty:transform.y};svg.setPointerCapture(e.pointerId)});
svg.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;transform.x=drag.tx+(e.clientX-drag.x);transform.y=drag.ty+(e.clientY-drag.y);applyTransform()});
svg.addEventListener('pointerup',()=>{drag=null});svg.addEventListener('pointercancel',()=>{drag=null});
svg.addEventListener('wheel',e=>{e.preventDefault();const rect=svg.getBoundingClientRect();const px=(e.clientX-rect.left)/rect.width*width,py=(e.clientY-rect.top)/rect.height*height;const factor=e.deltaY<0?1.18:1/1.18;const nk=Math.max(1,Math.min(5,transform.k*factor));const ratio=nk/transform.k;transform.x=px-(px-transform.x)*ratio;transform.y=py-(py-transform.y)*ratio;transform.k=nk;applyTransform()},{passive:false});
root.querySelector('[data-map-zoom-in]')?.addEventListener('click',()=>{transform.k=Math.min(5,transform.k*1.35);transform.x=width/2-(width/2-transform.x)*(transform.k/(transform.k/1.35));transform.y=height/2-(height/2-transform.y)*(transform.k/(transform.k/1.35));applyTransform()});
root.querySelector('[data-map-zoom-out]')?.addEventListener('click',()=>{const nk=Math.max(1,transform.k/1.35);const r=nk/transform.k;transform.x=width/2-(width/2-transform.x)*r;transform.y=height/2-(height/2-transform.y)*r;transform.k=nk;applyTransform()});
root.querySelector('[data-map-reset]')?.addEventListener('click',()=>{transform={x:0,y:0,k:1};applyTransform();closePreview()});
svg.addEventListener('click',e=>{if(e.target===svg)closePreview()});

const soundButton=root.querySelector('[data-map-sound]');let audio=null;soundButton?.addEventListener('click',()=>{if(!audio){audio=new Audio('/assets/audio/ambient-travel.mp3');audio.loop=true}if(audio.paused){audio.play().catch(()=>{});soundButton.textContent='Sound On'}else{audio.pause();soundButton.textContent='Sound Off'}});
