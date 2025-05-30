// Sample property data
const properties = {
  "pipers-meadow": {
    title: "Pipers Meadow",
    location: "San Antonio, TX",
    specs: "3 Br · 2 Ba",
    description: "One-story with a spacious backyard.",
    image: "../images/properties/PipersMeadow",
    extraInfo: "Built in 2010 · 1,600 sqft · Large backyard · Quiet neighborhood",
    beforeAfter: [
      { after: "../images/properties/pipersmeadow/after1", before: "../images/properties/pipersmeadow/before1" },
      { after: "../images/properties/pipersmeadow/after2", before: "../images/properties/pipersmeadow/before2" },
      { after: "../images/properties/pipersmeadow/after3", before: "../images/properties/pipersmeadow/before3" },
      { after: "../images/properties/pipersmeadow/after4", before: "../images/properties/pipersmeadow/before4" }
    ]
  },
  "castle-hills": {
    title: "Castle Hills",
    location: "San Antonio, TX",
    specs: "4 Br · 2.5 Ba",
    description: "Two-story in a family-oriented neighborhood.",
    image: "../images/properties/CastleHills",
    extraInfo: "Built in 2015 · 2,200 sqft · Walkable to schools · Updated kitchen",
    beforeAfter: [
      { after: "../images/properties/castlehills/after1", before: "../images/properties/placeholder/before1" },
      { after: "../images/properties/castlehills/after2", before: "../images/properties/placeholder/before2" },
      { after: "../images/properties/castlehills/after3", before: "../images/properties/placeholder/before3" },
      { after: "../images/properties/castlehills/after4", before: "../images/properties/placeholder/before4" }
    ]
  },
  "high-country": {
    title: "High Country",
    location: "San Antonio, TX",
    specs: "3 Br · 2 Ba",
    description: "Open layout with easy access to main routes - 1604 and I-35.",
    image: "../images/properties/HighCountry",
    extraInfo: "Built in 2012 · 1,800 sqft · Open-concept design · Near shopping centers",
    beforeAfter: [
      { after: "../images/properties/highcountry/after1", before: "../images/properties/placeholder/before1" },
      { after: "../images/properties/highcountry/after2", before: "../images/properties/placeholder/before2" },
      { after: "../images/properties/highcountry/after3", before: "../images/properties/placeholder/before3" },
      { after: "../images/properties/highcountry/after4", before: "../images/properties/placeholder/before4" }
    ]
  },
  // Add more properties here...
};

// Order of properties from projects.html - for the arrows
const propertyOrder = ["pipers-meadow", "castle-hills", "high-country"];


// Helper to get URL parameter
function getPropertyIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function populatePropertyDetails() {
  const propertyId = getPropertyIdFromURL();
  const property = properties[propertyId];

  if (!property) {
    document.getElementById("property-title").textContent = "Property Not Found";
    return;
  }

  // Set data
  document.getElementById("property-title").textContent = property.title;
  document.getElementById("property-location").textContent = property.location;
  document.getElementById("property-specs").textContent = property.specs;
  document.getElementById("property-description").textContent = property.description;
  document.getElementById("property-extra").textContent = property.extraInfo;
  document.getElementById("property-image").src = property.image;
  document.getElementById("property-image").alt = property.title;

  // Add this line to inject the Before & After section
  renderBeforeAfterImages(property);
}


// for the arrows
function renderNavigationArrows(currentId) {
  const index = propertyOrder.indexOf(currentId);
  if (index === -1) return;

  const container = document.createElement("div");
  container.className = "nav-arrows";

  // Previous arrow (wrap from first to last)
  const prevId = index === 0
    ? propertyOrder[propertyOrder.length - 1]  // go to last
    : propertyOrder[index - 1];

  const leftArrow = document.createElement("a");
  leftArrow.href = `details.html?id=${prevId}`;
  leftArrow.className = "nav-arrow left-arrow";
  leftArrow.innerHTML = "&#10094;";
  container.appendChild(leftArrow);

  // Next arrow (wrap from last to first)
  const nextId = index === propertyOrder.length - 1
    ? propertyOrder[0]  // go to first
    : propertyOrder[index + 1];

  const rightArrow = document.createElement("a");
  rightArrow.href = `details.html?id=${nextId}`;
  rightArrow.className = "nav-arrow right-arrow";
  rightArrow.innerHTML = "&#10095;";
  container.appendChild(rightArrow);

  document.body.appendChild(container);
}


// Modify your DOMContentLoaded event
document.addEventListener("DOMContentLoaded", () => {
  const propertyId = getPropertyIdFromURL();
  populatePropertyDetails();
  renderNavigationArrows(propertyId);
});



// for before and after images
function renderBeforeAfterImages(property) {
  if (!property.beforeAfter || !property.beforeAfter.length) return;

  const section = document.createElement("section");
  section.className = "before-after-section";

  const heading = document.createElement("h2");
  heading.textContent = "Before & After";
  section.appendChild(heading);

  // Add this small note under the heading
  const note = document.createElement("p");
  note.textContent = "Hover over image to view Before";
  note.className = "before-after-note";
  section.appendChild(note);

  const gallery = document.createElement("div");
  gallery.className = "before-after-gallery";

  property.beforeAfter.forEach(pair => {
    const wrapper = document.createElement("div");
    wrapper.className = "before-after-item";

    const img = document.createElement("img");
    img.src = pair.after;
    img.dataset.before = pair.before;
    img.alt = "Before and After";
    img.className = "before-after-img";

    // Hover logic
    img.addEventListener("mouseenter", () => {
      img.src = img.dataset.before;
    });
    img.addEventListener("mouseleave", () => {
      img.src = pair.after;
    });

    wrapper.appendChild(img);
    gallery.appendChild(wrapper);
  });

  section.appendChild(gallery);

  // Append to body or below .property-details
  document.querySelector(".property-details").after(section);
}



