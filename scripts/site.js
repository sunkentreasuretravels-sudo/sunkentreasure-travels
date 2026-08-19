
const upload = document.querySelector("#storyFiles");
const preview = document.querySelector("#preview");
if (upload) {
  upload.addEventListener("change", () => {
    const files = [...upload.files];
    preview.style.display = files.length ? "block" : "none";
    preview.innerHTML = files.length
      ? `<strong>${files.length} file(s) selected.</strong><br>${files.map(f => f.name).join("<br>")}<br><br><span>In production these enter the moderation envelope. Nothing publishes automatically.</span>`
      : "";
  });
}
document.querySelector("#storyForm")?.addEventListener("submit", e => {
  e.preventDefault();
  const result = document.querySelector("#submitResult");
  result.textContent = "Your story is prepared for review. The production upload service will route it through screening and approval before publication.";
  result.style.display = "block";
});
