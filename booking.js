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

// Initialize the map
let map = L.map('locationMap').setView([51.505, -0.09], 13);
let pickupMarker = null;
let dropoffMarker = null;
let routeLayer = null;
let isProcessing = false;

// Add OpenStreetMap tiles
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Function to geocode an address
async function geocodeAddress(address) {
  if (!address.trim()) return null;
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
    const data = await response.json();
    return data.length > 0 ? {
      lat: parseFloat(data[0].lat),
      lon: parseFloat(data[0].lon),
      displayName: data[0].display_name
    } : null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

// Function to update map with location
async function updateMap(locationInput, isPickup) {
  if (isProcessing) return;
  isProcessing = true;
  
  const address = locationInput.value.trim();
  if (!address) {
    isProcessing = false;
    return;
  }

  const location = await geocodeAddress(address);
  if (!location) {
    alert('Location not found. Please try a different address.');
    isProcessing = false;
    return;
  }

  const { lat, lon, displayName } = location;
  
  // Remove existing marker
  if (isPickup && pickupMarker) {
    map.removeLayer(pickupMarker);
  } else if (!isPickup && dropoffMarker) {
    map.removeLayer(dropoffMarker);
  }
  
  // Add new marker
  const icon = L.divIcon({
    className: isPickup ? 'pickup-marker' : 'dropoff-marker',
    html: '',
    iconSize: [20, 20]
  });
  
  const marker = L.marker([lat, lon], { icon }).addTo(map)
    .bindPopup(`<b>${isPickup ? 'Pickup' : 'Drop-off'}:</b> ${displayName}`)
    .openPopup();
  
  if (isPickup) {
    pickupMarker = marker;
  } else {
    dropoffMarker = marker;
  }
  
  // Update input with full display name
  locationInput.value = displayName;
  
  // Auto-show route if both locations are set
  if (pickupMarker && dropoffMarker) {
    showRoute();
  } else {
    map.setView([lat, lon], 15);
  }
  
  isProcessing = false;
}

// Function to show route between points
async function showRoute() {
  if (!pickupMarker || !dropoffMarker) {
    console.log('Both locations not set yet');
    return;
  }

  const pickupLatLng = pickupMarker.getLatLng();
  const dropoffLatLng = dropoffMarker.getLatLng();

  try {
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${pickupLatLng.lng},${pickupLatLng.lat};${dropoffLatLng.lng},${dropoffLatLng.lat}?overview=full&geometries=geojson`
    );
    const data = await response.json();

    if (data.routes?.length > 0) {
      const route = data.routes[0];
      
      // Remove previous route
      if (routeLayer) map.removeLayer(routeLayer);
      
      // Add new route
      routeLayer = L.geoJSON(route.geometry, {
        style: { color: '#3b82f6', weight: 5, opacity: 0.7 }
      }).addTo(map);

      // Update route info
      const distanceKm = (route.distance / 1000).toFixed(1);
      const durationMins = Math.round(route.duration / 60);
      
      document.getElementById('routeInfo').innerHTML = `
        <p><span class="pickup-marker"></span> <strong>Pickup:</strong> ${document.getElementById('pickupLocation').value}</p>
        <p><span class="dropoff-marker"></span> <strong>Drop-off:</strong> ${document.getElementById('dropoffLocation').value}</p>
        <p><strong>Distance:</strong> ${distanceKm} km</p>
        <p><strong>Estimated duration:</strong> ${durationMins} minutes</p>
      `;

      // Fit bounds to show both markers and route
      const bounds = L.latLngBounds([pickupLatLng, dropoffLatLng]);
      if (routeLayer) bounds.extend(routeLayer.getBounds());
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  } catch (error) {
    console.error('Routing error:', error);
    // Fallback to just showing markers if routing fails
    const bounds = L.latLngBounds([pickupMarker.getLatLng(), dropoffMarker.getLatLng()]);
    map.fitBounds(bounds, { padding: [50, 50] });
  }
}

// Event listeners
document.getElementById('pickupLocationBtn').addEventListener('click', () => {
  updateMap(document.getElementById('pickupLocation'), true);
});

document.getElementById('dropoffLocationBtn').addEventListener('click', () => {
  updateMap(document.getElementById('dropoffLocation'), false);
});

document.getElementById('showRouteBtn').addEventListener('click', showRoute);

// Handle Enter key press in address fields
document.getElementById('pickupLocation').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    updateMap(document.getElementById('pickupLocation'), true);
  }
});

document.getElementById('dropoffLocation').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    updateMap(document.getElementById('dropoffLocation'), false);
  }
});