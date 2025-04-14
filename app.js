// Main Application Logic
document.addEventListener('DOMContentLoaded', function() {
    // Initialize components
    initSOS();
    initComplaintForm();
    initContacts();
    initLocationSharing();
    initSafetyLaws();
    initSelfDefense();
    initNearbyPlaces();
});

// SOS Emergency Functionality
function initSOS() {
    const sosBtn = document.getElementById('sos-btn');
    const shakeThreshold = 15; // Shake sensitivity
    let lastShakeTime = 0;
    
    // Click SOS
    sosBtn.addEventListener('click', triggerEmergency);
    
    // Shake detection
    if (window.DeviceMotionEvent) {
        let lastAcceleration = {x: null, y: null, z: null};
        
        window.addEventListener('devicemotion', function(e) {
            const acceleration = e.accelerationIncludingGravity;
            const shakeTime = Date.now();
            
            if (lastAcceleration.x !== null) {
                const deltaX = Math.abs(acceleration.x - lastAcceleration.x);
                const deltaY = Math.abs(acceleration.y - lastAcceleration.y);
                const deltaZ = Math.abs(acceleration.z - lastAcceleration.z);
                
                if ((deltaX > shakeThreshold || deltaY > shakeThreshold || deltaZ > shakeThreshold) 
                    && shakeTime - lastShakeTime > 1000) {
                    triggerEmergency();
                    lastShakeTime = shakeTime;
                }
            }
            
            lastAcceleration = {
                x: acceleration.x,
                y: acceleration.y,
                z: acceleration.z
            };
        });
    }
}

async function triggerEmergency() {
    try {
        // Get current location
        const position = await getCurrentLocation();
        const { latitude, longitude } = position.coords;
        
        // Send emergency alert to trusted contacts
        const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
        const message = `EMERGENCY! I need help at: https://maps.google.com/?q=${latitude},${longitude}`;
        
        // In a real app, this would use SMS/email API
        contacts.forEach(contact => {
            console.log(`Alert sent to ${contact.name} (${contact.phone}): ${message}`);
        });
        
        // Play alarm sound
        const alarm = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
        alarm.loop = true;
        alarm.play();
        
        // Show confirmation
        alert(`Emergency alert sent to ${contacts.length} contacts with your location!`);
        
    } catch (error) {
        console.error('SOS failed:', error);
        alert('Emergency alert failed. Please try again or call 112 directly.');
    }
}

// Get current location
function getCurrentLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocation not supported'));
        }
        
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000
        });
    });
}

// Complaint Form Handling
function initComplaintForm() {
    const form = document.getElementById('complaint-form');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const complaint = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            details: formData.get('details'),
            evidence: formData.get('evidence'),
            timestamp: new Date().toISOString()
        };
        
        // Save complaint to localStorage (in real app would send to backend)
        const complaints = JSON.parse(localStorage.getItem('complaints') || '[]');
        complaints.push(complaint);
        localStorage.setItem('complaints', JSON.stringify(complaints));
        
        alert('Complaint submitted successfully! Case ID: ' + Date.now());
        form.reset();
    });
}

// Trusted Contacts Management
function initContacts() {
    const contactForm = document.getElementById('contact-form');
    const contactList = document.getElementById('contact-list');
    
    // Load existing contacts
    renderContacts();
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const contact = {
            name: document.getElementById('contact-name').value,
            phone: document.getElementById('contact-phone').value,
            email: document.getElementById('contact-email').value,
            relation: document.getElementById('contact-relation').value
        };
        
        // Save to localStorage
        const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
        contacts.push(contact);
        localStorage.setItem('trustedContacts', JSON.stringify(contacts));
        
        // Refresh display
        renderContacts();
        contactForm.reset();
    });
}

function renderContacts() {
    const contactList = document.getElementById('contact-list');
    const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
    
    contactList.innerHTML = contacts.map(contact => `
        <div class="bg-black p-4 rounded-lg border border-yellow-400 mb-2">
            <h4 class="font-bold">${contact.name}</h4>
            <p>${contact.phone}</p>
            <p class="text-sm text-yellow-300">${contact.relation}</p>
            <button class="text-red-500 text-sm mt-2" onclick="deleteContact('${contact.phone}')">
                <i class="fas fa-trash mr-1"></i>Remove
            </button>
        </div>
    `).join('');
}

function deleteContact(phone) {
    const contacts = JSON.parse(localStorage.getItem('trustedContacts') || '[]');
    const updatedContacts = contacts.filter(c => c.phone !== phone);
    localStorage.setItem('trustedContacts', JSON.stringify(updatedContacts));
    renderContacts();
}

// Location Sharing
function initLocationSharing() {
    const shareBtn = document.getElementById('share-location');
    
    shareBtn.addEventListener('click', async function() {
        try {
            const position = await getCurrentLocation();
            const { latitude, longitude } = position.coords;
            
            // In a real app, this would share with selected contacts
            const mapUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
            alert(`Your location: ${mapUrl}\n\nShare this link with trusted contacts.`);
            
        } catch (error) {
            console.error('Location sharing failed:', error);
            alert('Could not get your location. Please enable location services.');
        }
    });
}

// Safety Laws
function initSafetyLaws() {
    const laws = [
        { title: "Section 354 IPC", description: "Assault or criminal force to woman with intent to outrage her modesty" },
        { title: "Section 354A IPC", description: "Sexual harassment and punishment for sexual harassment" },
        { title: "Section 354B IPC", description: "Assault or use of criminal force to woman with intent to disrobe" },
        { title: "Section 354C IPC", description: "Voyeurism" },
        { title: "Section 354D IPC", description: "Stalking" },
        { title: "Section 509 IPC", description: "Word, gesture or act intended to insult the modesty of a woman" }
    ];
    
    const lawsContainer = document.getElementById('laws-container');
    lawsContainer.innerHTML = laws.map(law => `
        <div class="bg-black p-4 rounded-lg border border-yellow-400 mb-4">
            <h4 class="font-bold text-lg">${law.title}</h4>
            <p class="mt-2">${law.description}</p>
        </div>
    `).join('');
}

// Self Defense Resources
function initSelfDefense() {
    const videos = [
        { title: "Basic Self Defense Moves", url: "https://www.youtube.com/embed/example1" },
        { title: "How to Escape from Grabs", url: "https://www.youtube.com/embed/example2" },
        { title: "Using Everyday Objects for Defense", url: "https://www.youtube.com/embed/example3" }
    ];
    
    const videosContainer = document.getElementById('self-defense-videos');
    videosContainer.innerHTML = videos.map(video => `
        <div class="bg-black p-4 rounded-lg border border-yellow-400 mb-4">
            <h4 class="font-bold text-lg mb-2">${video.title}</h4>
            <div class="aspect-w-16 aspect-h-9">
                <iframe class="w-full h-48" src="${video.url}" frameborder="0" allowfullscreen></iframe>
            </div>
        </div>
    `).join('');
}

// Nearby Safe Places
function initNearbyPlaces() {
    const mapContainer = document.getElementById('map-container');
    const placesList = document.getElementById('places-list');
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;
            
            // Initialize map (would use Google Maps API in production)
            mapContainer.innerHTML = `
                <div class="h-64 bg-gray-800 flex items-center justify-center">
                    <p class="text-center">Map would show here with nearby police stations and hospitals<br>
                    (Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)})</p>
                </div>
            `;
            
            // Mock nearby places (in real app would use Places API)
            const places = [
                { name: "Central Police Station", type: "police", distance: "0.5 km" },
                { name: "City General Hospital", type: "hospital", distance: "1.2 km" },
                { name: "Women's Safety Center", type: "safety", distance: "0.8 km" }
            ];
            
            placesList.innerHTML = places.map(place => `
                <div class="bg-black p-3 rounded-lg border border-yellow-400 mb-2 flex items-center">
                    <i class="fas ${place.type === 'police' ? 'fa-shield-alt' : place.type === 'hospital' ? 'fa-hospital' : 'fa-female'} mr-3"></i>
                    <div>
                        <h4 class="font-bold">${place.name}</h4>
                        <p class="text-sm">${place.distance} away</p>
                    </div>
                </div>
            `).join('');
        });
    } else {
        mapContainer.innerHTML = '<p class="text-center">Geolocation is not supported by your browser</p>';
    }
}
