

document.addEventListener('DOMContentLoaded', function() {
  // Initialize booking data
  const bookingData = {
    step: 1,
    vehicleType: '',
    price: 0,
    passengers: 0,
    bags: 0,
    bookingRef: generateBookingRef()
  };
  
  // Vehicle selection
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    const selectBtn = card.querySelector('.btn-select');
    
    selectBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Remove selected class from all cards
      vehicleCards.forEach(c => c.classList.remove('selected'));
      
      // Add selected class to clicked card
      card.classList.add('selected');
      
      // Update booking data
      bookingData.vehicleType = card.querySelector('.vehicle-type').textContent;
      bookingData.price = parseFloat(card.dataset.price);
      bookingData.passengers = card.dataset.passengers;
      bookingData.bags = card.dataset.bags;
      
      // Update button text
      vehicleCards.forEach(c => {
        c.querySelector('.btn-select').textContent = 'SELECT';
      });
      selectBtn.textContent = 'SELECTED';
    });
  });
  
  // Form navigation
  const forms = document.querySelectorAll('.step-content');
  const steps = document.querySelectorAll('.step');
  
  function showStep(step) {
    // Update active step indicator
    steps.forEach(s => {
      if (parseInt(s.dataset.step) <= step) {
        s.classList.add('active');
      } else {
        s.classList.remove('active');
      }
    });
    
    // Show current form
    forms.forEach(form => {
      if (parseInt(form.dataset.step) === step) {
        form.classList.add('active');
      } else {
        form.classList.remove('active');
      }
    });
    
    bookingData.step = step;
  }
  
  // Next button click
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', function() {
      const currentStep = parseInt(this.closest('.step-content').dataset.step);
      
      // Validate current step before proceeding
      if (validateStep(currentStep)) {
        // Save current step data
        saveStepData(currentStep);
        
        // Update summary if we're going to payment
        if (currentStep === 3) {
          updateSummary();
        }
        
        showStep(currentStep + 1);
      }
    });
  });
  
  // Previous button click
  document.querySelectorAll('.btn-prev').forEach(btn => {
    btn.addEventListener('click', function() {
      const currentStep = parseInt(this.closest('.step-content').dataset.step);
      showStep(currentStep - 1);
    });
  });
  
  // Form submission
  document.getElementById('paymentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Save payment data
    bookingData.cardLastFour = document.getElementById('cardNumber').value.slice(-4);
    
    // Save complete booking to localStorage
    localStorage.setItem('currentBooking', JSON.stringify(bookingData));
    
    // Send to Google Sheets
    sendToGoogleSheets(bookingData);
    
    // Generate and download PDF
    generateBookingPdf(bookingData);
    
    // Redirect to confirmation page
    window.location.href = 'confirmation.html';
  });
  
  // Helper functions
  function generateBookingRef() {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `CT-${new Date().getFullYear()}-${randomNum}`;
  }
  
  function validateStep(step) {
    if (step === 2) {
      if (!bookingData.vehicleType) {
        alert('Please select a vehicle');
        return false;
      }
    }
    
    if (step === 3) {
      const requiredFields = ['fullName', 'email', 'phone'];
      for (const field of requiredFields) {
        if (!document.getElementById(field).value) {
          alert(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          return false;
        }
      }
    }
    
    return true;
  }
  
  function saveStepData(step) {
    if (step === 1) {
      bookingData.pickupDate = document.getElementById('pickupDate').value;
      bookingData.pickupTime = document.getElementById('pickupTime').value;
      bookingData.pickupLocation = document.getElementById('pickupLocation').value;
      bookingData.dropoffLocation = document.getElementById('dropoffLocation').value;
      bookingData.transferType = document.getElementById('transferType').value;
      
      // Calculate price for round trip
      if (bookingData.transferType === 'round-trip' && bookingData.price > 0) {
        bookingData.price = bookingData.price * 1.8; // 80% more for round trip
      }
    }
    
    if (step === 3) {
      bookingData.fullName = document.getElementById('fullName').value;
      bookingData.email = document.getElementById('email').value;
      bookingData.phone = document.getElementById('phone').value;
      bookingData.specialRequests = document.getElementById('specialRequests').value;
    }
  }
  
  function updateSummary() {
    document.getElementById('summaryVehicle').textContent = bookingData.vehicleType;
    document.getElementById('summaryPickup').textContent = bookingData.pickupLocation;
    document.getElementById('summaryPickupDate').textContent = formatDate(bookingData.pickupDate) + ' at ' + formatTime(bookingData.pickupTime);
    document.getElementById('summaryTransferType').textContent = bookingData.transferType === 'one-way' ? 'One Way' : 'Round Trip';
    document.getElementById('summaryTotal').textContent = `€${bookingData.price.toFixed(2)}`;
  }
  
  function formatDate(dateString) {
    if (!dateString) return 'Not specified';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  }
  
  function formatTime(timeString) {
    if (!timeString) return 'Not specified';
    return timeString.substring(0, 5);
  }
  
  function sendToGoogleSheets(data) {
    // This is a placeholder for your Google Sheets integration
    console.log('Data to send to Google Sheets:', data);
    
    // Example fetch request (you'll need to set up your own endpoint)
    /*
    fetch('YOUR_GOOGLE_APPS_SCRIPT_URL', {
      method: 'POST',
      body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
    */
  }
  
function generateBookingPdf(bookingData) {
    // Create a more robust PDF content structure
    const pdfContent = document.createElement('div');
    pdfContent.id = 'pdf-content';
    pdfContent.style.width = '100%';
    pdfContent.style.padding = '20px';
    pdfContent.style.fontFamily = 'Arial, sans-serif';
    pdfContent.style.backgroundColor = '#ffffff';
    
    // Build the PDF content
    pdfContent.innerHTML = `
        <div style="max-width: 800px; margin: 0 auto;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #005aaa; margin-bottom: 10px;">Booking Confirmation</h1>
                <p style="color: #666;">Booking Reference: ${bookingData.bookingRef}</p>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-bottom: 30px;">
                <div style="flex: 1; padding: 15px; background: #f8f9fb; border-radius: 8px; margin-right: 10px;">
                    <h2 style="color: #005aaa; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Transfer Details</h2>
                    <p><strong>Vehicle:</strong> ${bookingData.vehicleType || 'Not specified'}</p>
                    <p><strong>Pickup:</strong> ${bookingData.pickupLocation || 'Not specified'}</p>
                    <p><strong>Date/Time:</strong> ${formatDate(bookingData.pickupDate)} at ${formatTime(bookingData.pickupTime)}</p>
                    <p><strong>Drop-off:</strong> ${bookingData.dropoffLocation || 'Not specified'}</p>
                    <p><strong>Type:</strong> ${bookingData.transferType === 'one-way' ? 'One Way' : 'Round Trip'}</p>
                </div>
                
                <div style="flex: 1; padding: 15px; background: #f8f9fb; border-radius: 8px; margin-left: 10px;">
                    <h2 style="color: #005aaa; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Customer Details</h2>
                    <p><strong>Name:</strong> ${bookingData.fullName || 'Not specified'}</p>
                    <p><strong>Email:</strong> ${bookingData.email || 'Not specified'}</p>
                    <p><strong>Phone:</strong> ${bookingData.phone || 'Not specified'}</p>
                    <p><strong>Requests:</strong> ${bookingData.specialRequests || 'None'}</p>
                </div>
            </div>
            
            <div style="padding: 15px; background: #f8f9fb; border-radius: 8px; margin-bottom: 30px;">
                <h2 style="color: #005aaa; border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 15px;">Payment Summary</h2>
                <div style="display: flex; justify-content: space-between;">
                    <div>
                        <p><strong>Vehicle Price:</strong> €${(bookingData.price / (bookingData.transferType === 'round-trip' ? 1.8 : 1)).toFixed(2)}</p>
                        ${bookingData.transferType === 'round-trip' ? '<p><strong>Round Trip Surcharge:</strong> +80%</p>' : ''}
                        <p><strong>Total Amount:</strong></p>
                    </div>
                    <div style="text-align: right;">
                        <p>€${(bookingData.price / (bookingData.transferType === 'round-trip' ? 1.8 : 1)).toFixed(2)}</p>
                        ${bookingData.transferType === 'round-trip' ? '<p>€' + (bookingData.price - (bookingData.price / 1.8)).toFixed(2) + '</p>' : ''}
                        <p style="font-weight: bold; font-size: 1.2em;">€${bookingData.price.toFixed(2)}</p>
                    </div>
                </div>
            </div>
            
            <div style="text-align: center; color: #666; font-size: 0.9em; padding-top: 20px; border-top: 1px solid #eee;">
                <p>Thank you for choosing our service!</p>
                <p>For any questions, please contact info@cardifftransfers.com</p>
            </div>
        </div>
    `;

    // Append to body temporarily
    document.body.appendChild(pdfContent);
    
    // PDF options
    const opt = {
        margin: 10,
        filename: `booking_${bookingData.bookingRef}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { 
            scale: 2,
            logging: true,
            useCORS: true,
            allowTaint: true
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };

    // Generate PDF with error handling
    html2pdf().set(opt).from(pdfContent).save()
        .then(() => {
            // Clean up
            document.body.removeChild(pdfContent);
            // Redirect after PDF is generated
            window.location.href = 'confirmation.html';
        })
        .catch(err => {
            console.error('PDF generation failed:', err);
            document.body.removeChild(pdfContent);
            // Fallback - redirect even if PDF fails
            window.location.href = 'confirmation.html';
        });
}
});



document.addEventListener('DOMContentLoaded', function() {
  
  // Vehicle selection with trip type
  const vehicleCards = document.querySelectorAll('.vehicle-card');
  vehicleCards.forEach(card => {
    const oneWayBtn = card.querySelector('.btn-select[data-trip-type="one-way"]');
    const roundTripBtn = card.querySelector('.btn-select[data-trip-type="round-trip"]');
    
    oneWayBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectVehicle(card, 'one-way');
    });
    
    roundTripBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      selectVehicle(card, 'round-trip');
    });
  });
  
  function selectVehicle(card, tripType) {
    // Remove selected class from all cards and buttons
    vehicleCards.forEach(c => {
      c.classList.remove('selected');
      c.querySelectorAll('.btn-select').forEach(btn => {
        btn.classList.remove('selected');
        btn.textContent = btn.dataset.tripType === 'one-way' ? 'One Way' : 'Round Trip';
      });
    });
    
    // Add selected class to clicked card
    card.classList.add('selected');
    
    // Mark the selected button
    const selectedBtn = card.querySelector(`.btn-select[data-trip-type="${tripType}"]`);
    selectedBtn.classList.add('selected');
    selectedBtn.textContent = tripType === 'one-way' ? 'One Way ✓' : 'Round Trip ✓';
    
    // Update booking data
    bookingData.vehicleType = card.querySelector('.vehicle-type').textContent;
    bookingData.basePrice = parseFloat(card.dataset.price);
    bookingData.passengers = card.dataset.passengers;
    bookingData.bags = card.dataset.bags;
    bookingData.transferType = tripType;
    
    // Calculate price based on trip type
    bookingData.price = tripType === 'round-trip' 
      ? bookingData.basePrice * 1.8 
      : bookingData.basePrice;
    
    // Update the displayed price
    const priceElement = card.querySelector('.price');
    if (priceElement) {
      priceElement.textContent = `€${bookingData.price.toFixed(2)}`;
      priceElement.style.fontWeight = 'bold';
      priceElement.style.color = '#005bbb';
    }
    
    // Also update the transfer type checkboxes
    document.querySelector(`input[name="transferType"][value="${tripType}"]`).checked = true;
    document.querySelector(`input[name="transferType"][value="${tripType === 'one-way' ? 'round-trip' : 'one-way'}"]`).checked = false;
    
    // Show/hide return fields based on trip type
    const returnFields = document.getElementById('returnFields');
    returnFields.style.display = tripType === 'round-trip' ? 'flex' : 'none';
  }

  // ... rest of your existing code ...
});

//  code from
      // Initialize Google Map variables
      let routeMap;
      let directionsService;
      let directionsRenderer;
      let pickupMarker;
      let dropoffMarker;
      let autocompletePickup;
      let autocompleteDropoff;
      let mapInitialized = false;

      // Initialize the map and autocomplete functionality
      function initMap() {
        if (mapInitialized) return;

        const routeMapContainer = document.getElementById("route-map");
        routeMapContainer.style.display = "none"; // Hide initially

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

        // Add place_changed listeners for automatic map updates
        autocompletePickup.addListener("place_changed", () => {
          updateMap(document.getElementById("pickupLocation"), true);
        });

        autocompleteDropoff.addListener("place_changed", () => {
          updateMap(document.getElementById("dropoffLocation"), false);
        });

        // Initialize transfer type checkboxes
        const returnFields = document.getElementById("returnFields");
        document
          .querySelectorAll('input[name="transferType"]')
          .forEach((checkbox) => {
            checkbox.addEventListener("change", function () {
              if (this.value === "round-trip" && this.checked) {
                returnFields.style.display = "flex";
                document.querySelector(
                  'input[name="transferType"][value="one-way"]'
                ).checked = false;
              } else if (this.value === "one-way" && this.checked) {
                returnFields.style.display = "none";
                document.querySelector(
                  'input[name="transferType"][value="round-trip"]'
                ).checked = false;
              }
            });
          });

        mapInitialized = true;
      }

      // Update the map with new location
      function updateMap(locationInput, isPickup) {
        const place = isPickup
          ? autocompletePickup.getPlace()
          : autocompleteDropoff.getPlace();

        if (!place || !place.geometry) {
          return; // Don't show alert, just return
        }

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
        } else {
          dropoffMarker = marker;
        }

        // Show map only when both addresses are set
        if (pickupMarker && dropoffMarker) {
          document.getElementById("route-map").style.display = "block";
          document.getElementById("routeInfo").style.display = "block";
          showRoute();
        }
      }

      // Show the route between pickup and dropoff locations
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
            const distance = route.distance.text;
            const duration = route.duration.text;

            // Update route info
            document.getElementById("routeInfo").innerHTML = `
        <div><strong>Your Transfer:</strong></div>
        <div class="route-detail">
          <span class="pickup-marker"></span>
          <strong>Pickup:</strong> ${
            document.getElementById("pickupLocation").value
          }
        </div>
        
        <div class="route-stats" style="padding-left: 4%;margin-left:8px; border-left:2px solid black;  ">
          <div><strong>Distance:</strong> ${distance}</div>
          <div><strong>Duration:</strong> ${duration}</div>
        </div>
        <div class="route-detail">
          <span class="dropoff-marker"></span>
          <strong>Drop-off:</strong> ${
            document.getElementById("dropoffLocation").value
          }
        </div>
      `;

            // Fit bounds to show the entire route
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(pickupMarker.getPosition());
            bounds.extend(dropoffMarker.getPosition());
            routeMap.fitBounds(bounds);
          } else {
            console.error("Directions request failed:", status);
            const bounds = new google.maps.LatLngBounds();
            bounds.extend(pickupMarker.getPosition());
            bounds.extend(dropoffMarker.getPosition());
            routeMap.fitBounds(bounds);
          }
        });
      }

      // Initialize when DOM is ready
      document.addEventListener("DOMContentLoaded", () => {
        if (document.getElementById("route-map")) {
          // Load Google Maps API
          const script = document.createElement("script");
          script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBh1KQfw1e4u8SRfQuDkC2G5rjhd_nxlI8&libraries=places&callback=initMap`;
          script.async = true;
          script.defer = true;
          document.head.appendChild(script);
        }

        // Initialize form navigation
        const steps = document.querySelectorAll(".step-content");
        const stepButtons = document.querySelectorAll(".step");
        let currentStep = 1;

        function showStep(stepNumber) {
          steps.forEach((step) => step.classList.remove("active"));
          stepButtons.forEach((button) => button.classList.remove("active"));

          document
            .querySelector(`.step-content[data-step="${stepNumber}"]`)
            .classList.add("active");
          document
            .querySelector(`.step[data-step="${stepNumber}"]`)
            .classList.add("active");
          currentStep = stepNumber;
        }

        document.querySelectorAll(".btn-next").forEach((button) => {
          button.addEventListener("click", () => {
            if (currentStep < 4) showStep(currentStep + 1);
          });
        });

        document.querySelectorAll(".btn-prev").forEach((button) => {
          button.addEventListener("click", () => {
            if (currentStep > 1) showStep(currentStep - 1);
          });
        });

        // Initialize vehicle selection
        document.querySelectorAll(".btn-select").forEach((button) => {
          button.addEventListener("click", function () {
            const vehicleCard = this.closest(".vehicle-card");
            document.querySelectorAll(".vehicle-card").forEach((card) => {
              card.classList.remove("selected");
            });
            vehicleCard.classList.add("selected");

            // Update summary
            document.getElementById("summaryVehicle").textContent =
              vehicleCard.querySelector(".vehicle-type").textContent;
            document.getElementById("summaryTotal").textContent =
              vehicleCard.querySelector(".price").textContent;
          });
        });

        // Update booking summary
        document
          .getElementById("pickupLocation")
          .addEventListener("change", function () {
            document.getElementById("summaryPickup").textContent = this.value;
          });

        document
          .getElementById("pickupDate")
          .addEventListener("change", function () {
            document.getElementById("summaryPickupDate").textContent =
              this.value;
          });

        document
          .querySelectorAll('input[name="transferType"]')
          .forEach((checkbox) => {
            checkbox.addEventListener("change", function () {
              if (this.checked) {
                document.getElementById("summaryTransferType").textContent =
                  this.value;
              }
            });
          });
      });
      // Replace the transferType event listener with this
      document
        .querySelectorAll('input[name="transferType"]')
        .forEach((checkbox) => {
          checkbox.addEventListener("change", function () {
            if (this.value === "round-trip" && this.checked) {
              returnFields.style.display = "flex";
              document.querySelector(
                'input[name="transferType"][value="one-way"]'
              ).checked = false;
            } else if (this.value === "one-way" && this.checked) {
              returnFields.style.display = "none";
              document.querySelector(
                'input[name="transferType"][value="round-trip"]'
              ).checked = false;
            }
          });
        });

      // Add place_changed listeners to automatically update the map
      autocompletePickup.addListener("place_changed", () => {
        updateMap(document.getElementById("pickupLocation"), true);
      });

      autocompleteDropoff.addListener("place_changed", () => {
        updateMap(document.getElementById("dropoffLocation"), false);
      });
    