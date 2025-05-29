// Sample property data
const properties = {
  "pipers-meadow": {
    title: "Pipers Meadow",
    location: "San Antonio, TX",
    specs: "3 Br · 2 Ba",
    description: "One-story with a spacious backyard.",
    image: "../images/PipersMeadow.jpg",
    extraInfo: "Built in 2010 · 1,600 sqft · Large backyard · Quiet neighborhood"
  },
  "castle-hills": {
    title: "Castle Hills",
    location: "San Antonio, TX",
    specs: "4 Br · 2.5 Ba",
    description: "Two-story in a family-oriented neighborhood.",
    image: "../images/CastleHills.jpg",
    extraInfo: "Built in 2015 · 2,200 sqft · Walkable to schools · Updated kitchen"
  },
  "high-country": {
    title: "High Country",
    location: "San Antonio, TX",
    specs: "3 Br · 2 Ba",
    description: "Open layout with easy access to main routes - 1604 and I-35.",
    image: "../images/HighCountry.jpg",
    extraInfo: "Built in 2012 · 1,800 sqft · Open-concept design · Near shopping centers"
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
}

// Run on page load
document.addEventListener("DOMContentLoaded", populatePropertyDetails);
