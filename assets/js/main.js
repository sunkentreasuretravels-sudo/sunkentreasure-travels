const heroImages=[
"/assets/images/hero/private-jet-night-arrival.jpg",
"/assets/images/hero/wedding-limo.jpg",
"/assets/images/hero/champagne-limo.jpg"
];
let heroIndex=0;
const heroImage=document.querySelector("[data-hero-image]");
if(heroImage && heroImages.length>1){
 setInterval(()=>{heroIndex=(heroIndex+1)%heroImages.length;heroImage.style.opacity="0";setTimeout(()=>{heroImage.src=heroImages[heroIndex];heroImage.style.opacity="1"},350)},5200);
}
document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener("click",e=>{
 const target=document.querySelector(a.getAttribute("href")); if(target){e.preventDefault();target.scrollIntoView({behavior:"smooth"});}
}));
