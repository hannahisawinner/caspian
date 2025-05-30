// Sample property data
const properties = {
  "pipers-meadow": {
    title: "Pipers Meadow",
    location: "San Antonio, TX",
    specs: "3 Br · 2 Ba",
    description: "One-story with a spacious backyard.",
    image: "../images/PipersMeadow",
    extraInfo: "Built in 2010 · 1,600 sqft · Large backyard · Quiet neighborhood",
    beforeAfter: [
      { after: "../images/pipersmeadow-after1", before: "../images/pipersmeadow-before1" },
      { after: "../images/pipersmeadow-after2", before: "../images/pipersmeadow-before2" },
      { after: "../images/pipersmeadow-after3", before: "../images/pipersmeadow-before3" }
    ]
  },
  "castle-hills": {
    title: "Castle Hills",
    location: "San Antonio, TX",
    specs: "4 Br · 2.5 Ba",
    description: "Two-story in a family-oriented neighborhood.",
    image: "../images/CastleHills",
    extraInfo: "Built in 2015 · 2,200 sqft · Walkable to schools · Updated kitchen",
    beforeAfter: [
      { after: "../images/castlehills-after1", before: "../images/castlehills-before1" },
      { after: "../images/castlehills-after2", before: "../images/castlehills-before2" },
      { after: "../images/castlehills-after3", before: "../images/castlehills-before3" }
    ]
  },
  "high-country": {
    title: "High Country",
    location: "San Antonio, TX",
    specs: "3 Br · 2 Ba",
    description: "Open layout with easy access to main routes - 1604 and I-35.",
    image: "../images/HighCountry",
    extraInfo: "Built in 2012 · 1,800 sqft · Open-concept design · Near shopping centers",
    beforeAfter: [
      { after: "../images/highcountry-after1", before: "../images/highcountry-before1" },
      { after: "../images/highcountry-after2", before: "../images/highcountry-before2" },
      { after: "../images/highcountry-after3", before: "../images/highcountry-before3" }
    ]
  },
  // Add more properties here...
};

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

  // ✅ Add this line to inject the Before & After section
  renderBeforeAfterImages(property);
}

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


// Run on page load
document.addEventListener("DOMContentLoaded", populatePropertyDetails);
