document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const title = params.get("title");

  const projectData = {
    "Photography Club Landing Page": {
      image: "img/css-5a-preview.avif",
      description: "A landing page for a photography club created with Tailwind CSS.",
      tech: ["Tailwind", "JS", "Node.js"]
    },
    "Arc'teryx Clone": {
      image: "img/wordpress-5a-preview.avif",
      description: "An Arc'teryx clone with a functioning shop using WordPress and WooCommerce.",
      tech: ["WordPress", "PHP", "CSS"]
    },
    // Add other projects here
  };

  const project = projectData[title];
  if (project) {
    document.getElementById("project-title").textContent = title;
    document.getElementById("project-image").src = project.image;
    document.getElementById("project-image").alt = `Preview of ${title}`;
    document.getElementById("project-description").textContent = project.description;
    document.getElementById("project-tech").innerHTML = project.tech
      .map(t => `<span class="language">${t}</span>`)
      .join(" ");
  } else {
    document.getElementById("project-title").textContent = "Project not found";
  }
});
