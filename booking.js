// Global variables

// Booking data structure
const bookingData = {
  step: 1,
  vehicleType: "",
  basePrice: 0,
  price: 0,
  passengers: 0,
  bags: 0,
  transferType: "one-way",
  pickupDate: "",
  pickupTime: "",
  pickupLocation: "",
  dropoffLocation: "",
  returnDate: "",
  returnTime: "",
  fullName: "",
  email: "",
  phone: "",
  specialRequests: "",
  bookingRef: generateBookingRef(),
  distance: "",
  duration: "",
  routePolyline: "",
};

// Initialize the booking form
document.addEventListener("DOMContentLoaded", function () {
  // Load from localStorage if available
  const savedBooking = localStorage.getItem("currentBooking");
  if (savedBooking) {
    Object.assign(bookingData, JSON.parse(savedBooking));
    restoreFormData();
  }

  // Initialize map
  initMap();

  // Transfer type toggle
  const returnFields = document.getElementById("returnFields");
  document.querySelectorAll('input[name="transferType"]').forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      if (this.value === "round-trip" && this.checked) {
        returnFields.style.display = "flex";
        bookingData.transferType = "round-trip";
        document.querySelector('input[name="transferType"][value="one-way"]').checked = false;
      } else if (this.value === "one-way" && this.checked) {
        returnFields.style.display = "";
        bookingData.transferType = "one-way";
        document.querySelector('input[name="transferType"][value="round-trip"]').checked = false;
      }
    });
  });

  // Initialize vehicle selection in Step 1
  initVehicleSelection();

  // Form navigation
  const forms = document.querySelectorAll(".step-content");
  const steps = document.querySelectorAll(".step");

  function showStep(step) {
    steps.forEach((s) => {
      if (parseInt(s.dataset.step) <= step) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });

    forms.forEach((form) => {
      if (parseInt(form.dataset.step) === step) {
        form.classList.add("active");
      } else {
        form.classList.remove("active");
      }
    });

    bookingData.step = step;

    // Update summary before showing payment step
    if (step === 3) {
      updateSummary();
    }

    // Scroll to top of the form container
    const formContainer = document.querySelector('.booking-form-container') || document.body;
    formContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Next button
  document.querySelectorAll(".btn-next").forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentStep = parseInt(this.closest(".step-content").dataset.step);
      if (validateStep(currentStep)) {
        saveStepData(currentStep);
        showStep(currentStep + 1);
      }
    });
  });

  // Previous button
  document.querySelectorAll(".btn-prev").forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentStep = parseInt(this.closest(".step-content").dataset.step);
      showStep(currentStep - 1);
    });
  });

  // Form submission
  document.getElementById("paymentForm").addEventListener("submit", function (e) {
    e.preventDefault();
    saveStepData(3);

    // Save complete booking
    localStorage.setItem("currentBooking", JSON.stringify(bookingData));

    // Generate and download PDF
    generateBookingPdf();

    // Redirect to confirmation
    window.location.href = "confirmation.html";
  });

  // Initialize with first step
  showStep(1);
});

// Initialize vehicle selection in Step 1
function initVehicleSelection() {
  const vehicleOptions = [
    {
      type: "sedan",
      name: "Sedan: Octavia",
      price: 555,
      passengers: 3,
      bags: 2,
      image: "./Assets/4.png"
    },
    {
      type: "van",
      name: "Van: Mercedes V-Class",
      price: 600,
      passengers: 5,
      bags: 3,
      image: "./Assets/108.png"
    },
    {
      type: "minibus",
      name: "Minibus: Mercedes Sprinter",
      price: 750,
      passengers: 8,
      bags: 5,
      image: "./Assets/car.png"
    },
    {
      type: "large-sedan",
      name: "Sedan: Octavia (Large)",
      price: 850,
      passengers: 10,
      bags: 7,
      image: "./Assets/4.png"
    },
    {
      type: "large-van",
      name: "Van: Mercedes V-Class (Large)",
      price: 950,
      passengers: 12,
      bags: 8,
      image: "./Assets/107.png"
    },
    {
      type: "large-minibus",
      name: "Minibus: Mercedes Sprinter (Large)",
      price: 1050,
      passengers: 14,
      bags: 10,
      image: "./Assets/8.png"
    }
  ];

  const vehicleContainer = document.querySelector("#vehicleSelectionStep1 .vehicle-options");
  
  vehicleOptions.forEach(vehicle => {
    const vehicleCard = document.createElement("div");
    vehicleCard.className = "vehicle-card";
    vehicleCard.dataset.type = vehicle.type;
    vehicleCard.dataset.price = vehicle.price;
    vehicleCard.dataset.passengers = vehicle.passengers;
    vehicleCard.dataset.bags = vehicle.bags;

    vehicleCard.innerHTML = `
      <img src="${vehicle.image}" alt="${vehicle.type}" />
      <div class="vehicle-details">
        <div class="vehicle-type">${vehicle.name}</div>
        <div class="vehicle-actions">
          <div class="price">€${vehicle.price.toFixed(2)}</div>
          <div class="price">€${(vehicle.price * 2).toFixed(2)}</div>
        </div>
        <ul class="specs">
          <li class="spec-item"><i class="fas fa-user"></i> ${vehicle.passengers} passengers</li>
          <li class="spec-item"><i class="fas fa-glass-whiskey"></i> ${vehicle.bags}</li>
        </ul>
        <div class="vehicle-actions">
          <button type="button" class="btn-select" data-trip-type="one-way">
            One Way
          </button>
          <button type="button" class="btn-select" data-trip-type="round-trip">
            Round Trip
          </button>
        </div>
      </div>
    `;

    vehicleContainer.appendChild(vehicleCard);
  });

  // Vehicle selection
  document.querySelectorAll(".btn-select").forEach((button) => {
    button.addEventListener("click", function () {
      const vehicleCard = this.closest(".vehicle-card");
      const tripType = this.dataset.tripType;

      // Update UI
      document.querySelectorAll(".vehicle-card").forEach((card) => {
        card.classList.remove("selected");
        card.querySelectorAll(".btn-select").forEach((btn) => {
          btn.textContent =
            btn.dataset.tripType === "one-way" ? "One Way" : "Round Trip";
        });
      });

      vehicleCard.classList.add("selected");
      this.textContent = tripType === "one-way" ? "One Way ✓" : "Round Trip ✓";

      // Update booking data
      bookingData.vehicleType = vehicleCard.querySelector(".vehicle-type").textContent;
      bookingData.basePrice = parseFloat(vehicleCard.dataset.price);
      bookingData.passengers = vehicleCard.dataset.passengers;
      bookingData.bags = vehicleCard.dataset.bags;
      bookingData.transferType = tripType;
      bookingData.price = tripType === "round-trip" ? bookingData.basePrice * 2 : bookingData.basePrice;
    });
  });
}

// Rest of your existing functions (validateStep, saveStepData, restoreFormData, etc.) remain the same
// ...











// Global variables
let routeMap;
let directionsService;
let directionsRenderer;
let pickupMarker;
let dropoffMarker;
let autocompletePickup;
let autocompleteDropoff;
let mapInitialized = false;

function initMap() {
  // Check if already initialized or if Google Maps API isn't loaded yet
  if (mapInitialized) return;
  if (!window.google || !window.google.maps) {
    loadGoogleMapsAPI();
    return;
  }

  const routeMapContainer = document.getElementById("route-map");

  // Create map instance with default center (choose a location relevant to your business)
  routeMap = new google.maps.Map(routeMapContainer, {
    center: { lat: 51.505, lng: -0.09 }, // Default center (London)
    zoom: 10, // Slightly zoomed out
    gestureHandling: "greedy",
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  });

  // Initialize directions service and renderer
  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: routeMap,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#3b82f6",
      strokeOpacity: 0.8,
      strokeWeight: 5,
    },
  });

  // Add a welcome message to the route info
  updateRouteInfoWithWelcome();

  // Initialize autocomplete for location inputs
  initAutocomplete();

  mapInitialized = true;
}

function updateRouteInfoWithWelcome() {
  const routeInfo = document.getElementById("routeInfo");
  if (!routeInfo) return;

  routeInfo.innerHTML = `
    <div class="route-header"><strong>Your Transfer Route</strong></div>
    <div class="route-detail">
      <span class="marker-icon pickup-marker"></span>
      <div>
        <strong>Pickup:</strong> 
        <span class="location-text">Enter pickup location above</span>
      </div>
    </div>
    <div class="route-stats">
      <div><strong>Distance:</strong> Will calculate when locations entered</div>
      <div><strong>Duration:</strong> Will calculate when locations entered</div>
    </div>
    <div class="route-detail">
      <span class="marker-icon dropoff-marker"></span>
      <div>
        <strong>Drop-off:</strong> 
        <span class="location-text">Enter drop-off location above</span>
      </div>
    </div>
    <div class="map-instructions">
      <p><i class="fas fa-info-circle"></i> Enter locations to see the route and pricing</p>
    </div>
  `;
}

// Load Google Maps API if not already loaded
function loadGoogleMapsAPI() {
  if (document.querySelector('script[src*="maps.googleapis.com"]')) return;

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBh1KQfw1e4u8SRfQuDkC2G5rjhd_nxlI8&libraries=places&callback=initMap`;
  script.async = true;
  script.defer = true;
  script.onerror = () => console.error("Google Maps API failed to load");
  document.head.appendChild(script);
}

// Initialize autocomplete functionality
function initAutocomplete() {
  const pickupInput = document.getElementById("pickupLocation");
  const dropoffInput = document.getElementById("dropoffLocation");

  if (!pickupInput || !dropoffInput) return;

  // Create autocomplete instances
  autocompletePickup = new google.maps.places.Autocomplete(pickupInput, {
    types: ["geocode"],
    fields: ["geometry", "name", "formatted_address"],
  });

  autocompleteDropoff = new google.maps.places.Autocomplete(dropoffInput, {
    types: ["geocode"],
    fields: ["geometry", "name", "formatted_address"],
  });

  // Add place_changed listeners
  autocompletePickup.addListener("place_changed", () => {
    onPlaceChanged(autocompletePickup, true);
  });

  autocompleteDropoff.addListener("place_changed", () => {
    onPlaceChanged(autocompleteDropoff, false);
  });

  // Also listen to manual input changes with debounce
  pickupInput.addEventListener(
    "input",
    debounce(() => {
      if (!pickupInput.value && pickupMarker) {
        pickupMarker.setMap(null);
        pickupMarker = null;
        updateMapVisibility();
      }
    }, 500)
  );

  dropoffInput.addEventListener(
    "input",
    debounce(() => {
      if (!dropoffInput.value && dropoffMarker) {
        dropoffMarker.setMap(null);
        dropoffMarker = null;
        updateMapVisibility();
      }
    }, 500)
  );
}

// Handle place selection from autocomplete
function onPlaceChanged(autocomplete, isPickup) {
  const place = autocomplete.getPlace();
  if (!place || !place.geometry) {
    // Invalid selection - clear the marker
    if (isPickup && pickupMarker) {
      pickupMarker.setMap(null);
      pickupMarker = null;
    } else if (!isPickup && dropoffMarker) {
      dropoffMarker.setMap(null);
      dropoffMarker = null;
    }
    updateMapVisibility();
    return;
  }

  updateMapWithPlace(place, isPickup);
}

// Update map with a new place (pickup or dropoff)
function updateMapWithPlace(place, isPickup) {
  // Remove existing marker
  if (isPickup && pickupMarker) {
    pickupMarker.setMap(null);
  } else if (!isPickup && dropoffMarker) {
    dropoffMarker.setMap(null);
  }

  // Create new marker
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map: routeMap,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isPickup ? "#4285F4" : "#EA4335",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 10,
    },
    title: place.name || place.formatted_address,
    zIndex: isPickup ? 1 : 2,
  });

  // Store reference to marker
  if (isPickup) {
    pickupMarker = marker;
    bookingData.pickupLocation =
      place.formatted_address ||
      document.getElementById("pickupLocation").value;
  } else {
    dropoffMarker = marker;
    bookingData.dropoffLocation =
      place.formatted_address ||
      document.getElementById("dropoffLocation").value;
  }

  // Update map visibility and route
  updateMapVisibility();

  // If both markers exist, show route
  if (pickupMarker && dropoffMarker) {
    showRoute();
  } else {
    // Center on the single marker
    routeMap.setCenter(marker.getPosition());
    routeMap.setZoom(15);
  }
}

// Show/hide map based on marker presence
function updateMapVisibility() {
  const routeMapContainer = document.getElementById("route-map");
  const routeInfo = document.getElementById("routeInfo");

  if (pickupMarker || dropoffMarker) {
    routeMapContainer.style.display = "block";
    routeInfo.style.display = "block";
  } else {
    routeMapContainer.style.display = "";
    routeInfo.style.display = "";
  }
}

// Show the route between locations
function showRoute() {
  if (!pickupMarker || !dropoffMarker) return;

  const request = {
    origin: pickupMarker.getPosition(),
    destination: dropoffMarker.getPosition(),
    travelMode: google.maps.TravelMode.DRIVING,
    provideRouteAlternatives: false,
    avoidHighways: false,
    avoidTolls: false,
    unitSystem: google.maps.UnitSystem.METRIC,
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      const route = result.routes[0].legs[0];

      // Store route data
      bookingData.distance = route.distance.text;
      bookingData.duration = route.duration.text;
      bookingData.routePolyline = result.routes[0].overview_polyline;

      updateRouteInfo();

      // Fit bounds to show the entire route
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupMarker.getPosition());
      bounds.extend(dropoffMarker.getPosition());
      routeMap.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else {
      console.error("Directions request failed:", status);
      // Fallback: show both markers even if route fails
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupMarker.getPosition());
      bounds.extend(dropoffMarker.getPosition());
      routeMap.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });

      // Show basic info
      bookingData.distance = "Calculating...";
      bookingData.duration = "Calculating...";
      updateRouteInfo();
    }
  });
}

// Update the route information display
function updateRouteInfo() {
  const routeInfo = document.getElementById("routeInfo");
  if (!routeInfo) return;

  routeInfo.innerHTML = `
    <div class="route-header"><strong>Your Transfer Route</strong></div>
    <div class="route-detail">
      <span class="marker-icon pickup-marker"></span>
      <div>
        <strong>Pickup:</strong> 
        <span class="location-text">${
          bookingData.pickupLocation || "Not specified"
        }</span>
      </div>
    </div>
    <div class="route-stats">
      <div><strong>Distance:</strong> ${
        bookingData.distance || "Calculating..."
      }</div>
      <div><strong>Duration:</strong> ${
        bookingData.duration || "Calculating..."
      }</div>
    </div>
    <div class="route-detail">
      <span class="marker-icon dropoff-marker"></span>
      <div>
        <strong>Drop-off:</strong> 
        <span class="location-text">${
          bookingData.dropoffLocation || "Not specified"
        }</span>
      </div>
    </div>
  `;
}

// Simple debounce function
function debounce(func, wait) {
  let timeout;
  return function () {
    const context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

// Initialize when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
  localStorage.removeItem("currentBooking");

  // Load the map automatically if the container exists
  if (document.getElementById("route-map")) {
    initMap();
  }

  // You can also add manual triggers if needed
  document.getElementById("showMapBtn")?.addEventListener("click", initMap);
});



// Initialize the map
function initMap() {
  if (mapInitialized) return;

  const routeMapContainer = document.getElementById("route-map");
  routeMapContainer.style.display = "";

  routeMap = new google.maps.Map(routeMapContainer, {
    center: { lat: 51.505, lng: -0.09 },
    zoom: 13,
  });

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer({
    map: routeMap,
    suppressMarkers: true,
    polylineOptions: {
      strokeColor: "#3b82f6",
      strokeOpacity: 0.7,
      strokeWeight: 5,
    },
  });

  // Initialize autocomplete
  autocompletePickup = new google.maps.places.Autocomplete(
    document.getElementById("pickupLocation"),
    { types: ["geocode"] }
  );

  autocompleteDropoff = new google.maps.places.Autocomplete(
    document.getElementById("dropoffLocation"),
    { types: ["geocode"] }
  );

  // Add place_changed listeners
  autocompletePickup.addListener("place_changed", () => {
    updateMap(document.getElementById("pickupLocation"), true);
  });

  autocompleteDropoff.addListener("place_changed", () => {
    updateMap(document.getElementById("dropoffLocation"), false);
  });

  mapInitialized = true;
}

// Update the map with new location
function updateMap(locationInput, isPickup) {
  const place = isPickup
    ? autocompletePickup.getPlace()
    : autocompleteDropoff.getPlace();
  if (!place || !place.geometry) return;

  // Remove existing marker
  if (isPickup && pickupMarker) {
    pickupMarker.setMap(null);
  } else if (!isPickup && dropoffMarker) {
    dropoffMarker.setMap(null);
  }

  // Create new marker
  const marker = new google.maps.Marker({
    position: place.geometry.location,
    map: routeMap,
    icon: {
      path: google.maps.SymbolPath.CIRCLE,
      fillColor: isPickup ? "#4285F4" : "#EA4335",
      fillOpacity: 1,
      strokeColor: "#FFFFFF",
      strokeWeight: 2,
      scale: 10,
    },
    title: place.name,
  });

  if (isPickup) {
    pickupMarker = marker;
    bookingData.pickupLocation = locationInput.value;
  } else {
    dropoffMarker = marker;
    bookingData.dropoffLocation = locationInput.value;
  }

  // Show map when both addresses are set
  if (pickupMarker && dropoffMarker) {
    document.getElementById("route-map").style.display = "block";
    document.getElementById("routeInfo").style.display = "block";
    showRoute();
  }
}

// Show the route between locations
function showRoute() {
  const request = {
    origin: pickupMarker.getPosition(),
    destination: dropoffMarker.getPosition(),
    travelMode: google.maps.TravelMode.DRIVING,
  };

  directionsService.route(request, (result, status) => {
    if (status === google.maps.DirectionsStatus.OK) {
      directionsRenderer.setDirections(result);
      const route = result.routes[0].legs[0];

      // Store route data
      bookingData.distance = route.distance.text;
      bookingData.duration = route.duration.text;
      bookingData.routePolyline = result.routes[0].overview_polyline;

      updateRouteInfo();

      // Fit bounds to show the entire route
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(pickupMarker.getPosition());
      bounds.extend(dropoffMarker.getPosition());
      routeMap.fitBounds(bounds);
    } else {
      console.error("Directions request failed:", status);
    }
  });
}

function updateRouteInfo() {
  document.getElementById("routeInfo").innerHTML = `
    <div><strong>Your Transfer:</strong></div>
    <div class="route-detail">
      <span class="pickup-marker"></span>
      <strong>Pickup:</strong> ${bookingData.pickupLocation}
    </div>
    <div class="route-stats" style="padding-left: 4%;margin-left:8px; border-left:2px solid black;">
      <div><strong>Distance:</strong> ${bookingData.distance}</div>
      <div><strong>Duration:</strong> ${bookingData.duration}</div>
    </div>
    <div class="route-detail">
      <span class="dropoff-marker"></span>
      <strong>Drop-off:</strong> ${bookingData.dropoffLocation}
    </div>
  `;
}

// Initialize the booking form
document.addEventListener("DOMContentLoaded", function () {
  // Load from localStorage if available
  const savedBooking = localStorage.getItem("currentBooking");
  if (savedBooking) {
    Object.assign(bookingData, JSON.parse(savedBooking));
    restoreFormData();
  }

  // Transfer type toggle
  const returnFields = document.getElementById("returnFields");
  document
    .querySelectorAll('input[name="transferType"]')
    .forEach((checkbox) => {
      checkbox.addEventListener("change", function () {
        if (this.value === "round-trip" && this.checked) {
          returnFields.style.display = "flex";
          bookingData.transferType = "round-trip";
          document.querySelector(
            'input[name="transferType"][value="one-way"]'
          ).checked = false;
        } else if (this.value === "one-way" && this.checked) {
          returnFields.style.display = "";
          bookingData.transferType = "one-way";
          document.querySelector(
            'input[name="transferType"][value="round-trip"]'
          ).checked = false;
        }
      });
    });

  // Vehicle selection
  document.querySelectorAll(".btn-select").forEach((button) => {
    button.addEventListener("click", function () {
      const vehicleCard = this.closest(".vehicle-card");
      const tripType = this.dataset.tripType;

      // Update UI
      document.querySelectorAll(".vehicle-card").forEach((card) => {
        card.classList.remove("selected");
        card.querySelectorAll(".btn-select").forEach((btn) => {
          btn.textContent =
            btn.dataset.tripType === "one-way" ? "One Way" : "Round Trip";
        });
      });

      vehicleCard.classList.add("selected");
      this.textContent = tripType === "one-way" ? "One Way ✓" : "Round Trip ✓";

      // Update booking data
      bookingData.vehicleType =
        vehicleCard.querySelector(".vehicle-type").textContent;
      bookingData.basePrice = parseFloat(vehicleCard.dataset.price);
      bookingData.passengers = vehicleCard.dataset.passengers;
      bookingData.bags = vehicleCard.dataset.bags;
      bookingData.transferType = tripType;
      bookingData.price =
        tripType === "round-trip"
          ? bookingData.basePrice * 2
          : bookingData.basePrice;
    });
  });

  // Form navigation
  const forms = document.querySelectorAll(".step-content");
  const steps = document.querySelectorAll(".step");

  function showStep(step) {
    steps.forEach((s) => {
      if (parseInt(s.dataset.step) <= step) {
        s.classList.add("active");
      } else {
        s.classList.remove("active");
      }
    });

    forms.forEach((form) => {
      if (parseInt(form.dataset.step) === step) {
        form.classList.add("active");
      } else {
        form.classList.remove("active");
      }
    });

    bookingData.step = step;

    // Update summary before showing payment step
    if (step === 4) {
      updateSummary();
    }

    // Scroll to top of the form container
    const formContainer =
      document.querySelector(".booking-form-container") || document.body;
    formContainer.scrollIntoView({ behavior: "smooth", block: "start" });

    // Alternative if you want instant scroll:
    // window.scrollTo(0, 0);
  }

  // Next button
  document.querySelectorAll(".btn-next").forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentStep = parseInt(this.closest(".step-content").dataset.step);
      if (validateStep(currentStep)) {
        saveStepData(currentStep);
        showStep(currentStep + 1);
      }
    });
  });

  // Previous button
  document.querySelectorAll(".btn-prev").forEach((btn) => {
    btn.addEventListener("click", function () {
      const currentStep = parseInt(this.closest(".step-content").dataset.step);
      showStep(currentStep - 1);
    });
  });

  // Form submission
  document
    .getElementById("paymentForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      saveStepData(4);

      // Save complete booking
      localStorage.setItem("currentBooking", JSON.stringify(bookingData));

      // Generate and download PDF
      generateBookingPdf();

      // Redirect to confirmation
      window.location.href = "confirmation.html";
    });

  // Initialize with first step
  showStep(1);
});

// Helper functions
function generateBookingRef() {
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `CT-${new Date().getFullYear()}-${randomNum}`;
}

function validateStep(step) {
  if (step === 1) {
    if (!document.getElementById("pickupDate").value) {
      alert("Please select pickup date");
      return false;
    }
    if (!document.getElementById("pickupLocation").value) {
      alert("Please enter pickup location");
      return false;
    }
    if (!document.getElementById("dropoffLocation").value) {
      alert("Please enter drop-off location");
      return false;
    }
  }

  if (step === 2 && !bookingData.vehicleType) {
    alert("Please select a vehicle");
    return false;
  }

  if (step === 3) {
    if (!document.getElementById("fullName").value) {
      alert("Please enter your full name");
      return false;
    }
    if (!document.getElementById("email").value) {
      alert("Please enter your email");
      return false;
    }
    if (!document.getElementById("phone").value) {
      alert("Please enter your phone number");
      return false;
    }
  }

  return true;
}

function saveStepData(step) {
  if (step === 1) {
    bookingData.pickupDate = document.getElementById("pickupDate").value;
    bookingData.pickupTime = document.getElementById("pickupTime").value;
    bookingData.pickupLocation =
      document.getElementById("pickupLocation").value;
    bookingData.dropoffLocation =
      document.getElementById("dropoffLocation").value;

    if (bookingData.transferType === "round-trip") {
      bookingData.returnDate = document.getElementById("returnDate").value;
      bookingData.returnTime = document.getElementById("returnTime").value;
    }
  }

  if (step === 3) {
    bookingData.fullName = document.getElementById("fullName").value;
    bookingData.email = document.getElementById("email").value;
    bookingData.phone = document.getElementById("phone").value;
    bookingData.specialRequests =
      document.getElementById("specialRequests").value;
  }
}

function restoreFormData() {
  // Restore form values from bookingData
  document.getElementById("pickupDate").value = bookingData.pickupDate || "";
  document.getElementById("pickupTime").value = bookingData.pickupTime || "";
  document.getElementById("pickupLocation").value =
    bookingData.pickupLocation || "";
  document.getElementById("dropoffLocation").value =
    bookingData.dropoffLocation || "";

  if (bookingData.transferType === "round-trip") {
    document.getElementById("returnDate").value = bookingData.returnDate || "";
    document.getElementById("returnTime").value = bookingData.returnTime || "";
    document.getElementById("returnFields").style.display = "flex";
    document.querySelector(
      'input[name="transferType"][value="round-trip"]'
    ).checked = true;
  } else {
    document.querySelector(
      'input[name="transferType"][value="one-way"]'
    ).checked = true;
  }

  document.getElementById("fullName").value = bookingData.fullName || "";
  document.getElementById("email").value = bookingData.email || "";
  document.getElementById("phone").value = bookingData.phone || "";
  document.getElementById("specialRequests").value =
    bookingData.specialRequests || "";
}

function updateSummary() {
  document.getElementById("summaryVehicle").textContent =
    bookingData.vehicleType || "Not selected";
  document.getElementById("summaryPickup").textContent =
    bookingData.pickupLocation || "Not specified";
  document.getElementById("summaryPickupDate").textContent =
    formatDate(bookingData.pickupDate) +
    " at " +
    formatTime(bookingData.pickupTime);
  document.getElementById("summaryTransferType").textContent =
    bookingData.transferType === "one-way" ? "One Way" : "Round Trip";
  document.getElementById(
    "summaryTotal"
  ).textContent = `€${bookingData.price.toFixed(2)}`;
}

function formatDate(dateString) {
  if (!dateString) return "Not specified";
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-GB", options);
}

function formatTime(timeString) {
  if (!timeString) return "Not specified";
  return timeString.substring(0, 5);
}

function generateBookingPdf() {
  const pdfContent = document.createElement("div");
  pdfContent.id = "pdf-content";
  pdfContent.style.width = "100%";
  pdfContent.style.padding = "20px";
  pdfContent.style.fontFamily = "Arial, sans-serif";

  pdfContent.innerHTML = `
    <div style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #005aaa;">Booking Confirmation</h1>
        <p>Reference: ${bookingData.bookingRef}</p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
        <div style="flex: 1; padding: 15px; background: #f8f9fb; border-radius: 8px; margin-right: 10px;">
          <h2 style="color: #005aaa; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Transfer Details</h2>
          <p><strong>Vehicle:</strong> ${bookingData.vehicleType}</p>
          <p><strong>Pickup:</strong> ${bookingData.pickupLocation}</p>
          <p><strong>Date/Time:</strong> ${formatDate(
            bookingData.pickupDate
          )} at ${formatTime(bookingData.pickupTime)}</p>
          <p><strong>Drop-off:</strong> ${bookingData.dropoffLocation}</p>
          <p><strong>Type:</strong> ${
            bookingData.transferType === "one-way" ? "One Way" : "Round Trip"
          }</p>
          ${
            bookingData.transferType === "round-trip"
              ? `<p><strong>Return:</strong> ${formatDate(
                  bookingData.returnDate
                )} at ${formatTime(bookingData.returnTime)}</p>`
              : ""
          }
        </div>
        
        <div style="flex: 1; padding: 15px; background: #f8f9fb; border-radius: 8px; margin-left: 10px;">
          <h2 style="color: #005aaa; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Customer Details</h2>
          <p><strong>Name:</strong> ${bookingData.fullName}</p>
          <p><strong>Email:</strong> ${bookingData.email}</p>
          <p><strong>Phone:</strong> ${bookingData.phone}</p>
          <p><strong>Requests:</strong> ${
            bookingData.specialRequests || "None"
          }</p>
        </div>
      </div>
      
      <div style="padding: 15px; background: #f8f9fb; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="color: #005aaa; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Payment Summary</h2>
        <div style="display: flex; justify-content: space-between;">
          <div>
            <p><strong>Vehicle Price:</strong> €${bookingData.basePrice.toFixed(
              2
            )}</p>
            ${
              bookingData.transferType === "round-trip"
                ? "<p><strong>Round Trip Surcharge:</strong> +80%</p>"
                : ""
            }
            <p><strong>Total Amount:</strong></p>
          </div>
          <div style="text-align: right;">
            <p>€${bookingData.basePrice.toFixed(2)}</p>
            ${
              bookingData.transferType === "round-trip"
                ? `<p>€${(bookingData.price - bookingData.basePrice).toFixed(
                    2
                  )}</p>`
                : ""
            }
            <p style="font-weight: bold; font-size: 1.2em;">€${bookingData.price.toFixed(
              2
            )}</p>
          </div>
        </div>
      </div>
      
      <div style="text-align: center; color: #666; font-size: 0.9em; padding-top: 20px; border-top: 1px solid #eee;">
        <p>Thank you for your booking!</p>
      </div>
    </div>
  `;

  document.body.appendChild(pdfContent);

  const opt = {
    margin: 10,
    filename: `booking_${bookingData.bookingRef}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf()
    .set(opt)
    .from(pdfContent)
    .save()
    .then(() => {
      document.body.removeChild(pdfContent);
    });
}

// user select future date not previous date
document.addEventListener("DOMContentLoaded", function () {
  const pickupDateInput = document.getElementById("pickupDate");
  const returnDateInput = document.getElementById("returnDate");

  // Set min date to today (YYYY-MM-DD format)
  const returnDatetoday = new Date().toISOString().split("T")[0];
  returnDateInput.min = returnDatetoday;
  // Set min date to today (YYYY-MM-DD format)
  const today = new Date().toISOString().split("T")[0];
  pickupDateInput.min = today;

  // Optional: If you want to prevent manual entry of past dates
  returnDateInput.addEventListener("input", function () {
    const selectedDate = this.value;
    if (selectedDate < returnDatetoday) {
      this.value = returnDatetoday; // Reset to today if past date is entered
      alert("Please select today or a future date");
    }
  });

  // Optional: If you want to prevent manual entry of past dates
  pickupDateInput.addEventListener("input", function () {
    const selectedDate = this.value;
    if (selectedDate < today) {
      this.value = today; // Reset to today if past date is entered
      alert("Please select today or a future date");
    }
  });
});
