/* =============================================
   EASTC Students Organization Portal
   JavaScript File (script.js)
   Features:
   - CRUD Operations for Student Activities
   - Contact Form Handling
   - Mobile Navigation Toggle
   - Toast Notifications
   ============================================= */
// ========================
// ACTIVITIES DATA STORAGE
// Activities are stored in a JavaScript array
// ========================
// Array to hold all activities (our "database")
let activities = [];
// Variable to track which activity is being edited (-1 means none)
let editingIndex = -1;
// ========================
// DOM ELEMENT REFERENCES
// Getting references to HTML elements we'll need
// ========================
// Activity form inputs
const activityNameInput = document.getElementById('activity-name');
const activityDateInput = document.getElementById('activity-date');
const activityDescInput = document.getElementById('activity-desc');
// Buttons
const addBtn = document.getElementById('add-activity-btn');
const updateBtn = document.getElementById('update-activity-btn');
const cancelBtn = document.getElementById('cancel-edit-btn');
// Display area
const activitiesList = document.getElementById('activities-list');
const emptyMsg = document.getElementById('empty-msg');
// ========================
// CREATE - Add a New Activity
// ========================
function addActivity() {
    // Get values from the input fields
    const name = activityNameInput.value.trim();
    const date = activityDateInput.value;
    const description = activityDescInput.value.trim();
    // Validate that all fields are filled
    if (name === '' || date === '' || description === '') {
        showToast('Please fill in all fields before adding an activity.', 'error');
        return; // Stop the function if validation fails
    }
    // Create a new activity object
    const newActivity = {
        name: name,
        date: date,
        description: description
    };
    // Add the activity to our array
    activities.push(newActivity);
    // Clear the input fields
    clearForm();
    // Re-render the activities list on the page
    renderActivities();
    // Show success message
    showToast('Activity added successfully!', 'success');
}
// ========================
// READ - Display All Activities
// ========================
function renderActivities() {
    // Clear the current list display
    activitiesList.innerHTML = '';
    // Check if there are no activities
    if (activities.length === 0) {
        // Show the empty message
        activitiesList.innerHTML = `
            <p class="empty-message" id="empty-msg">
                <i class="fas fa-info-circle"></i> No activities added yet. Use the form above to add one!
            </p>
        `;
        return; // Stop here
    }
    // Loop through each activity and create HTML for it
    for (let i = 0; i < activities.length; i++) {
        // Format the date for display
        const formattedDate = formatDate(activities[i].date);
        // Create the HTML for this activity item
        const activityHTML = `
            <div class="activity-item" id="activity-${i}">
                <div class="activity-info">
                    <h4><i class="fas fa-clipboard-list" style="color: #F4C430; margin-right: 8px;"></i>${activities[i].name}</h4>
                    <p class="activity-date"><i class="fas fa-calendar-day"></i> ${formattedDate}</p>
                    <p class="activity-description">${activities[i].description}</p>
                </div>
                <div class="activity-actions">
                    <button class="btn btn-sm btn-edit" onclick="editActivity(${i})" title="Edit this activity">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-delete" onclick="deleteActivity(${i})" title="Delete this activity">
                        <i class="fas fa-trash-alt"></i> Delete
                    </button>
                </div>
            </div>
        `;
        // Add the HTML to the activities list
        activitiesList.innerHTML += activityHTML;
    }
}
// ========================
// UPDATE - Edit an Existing Activity
// ========================
// Step 1: Load the activity data into the form for editing
function editActivity(index) {
    // Store the index of the activity being edited
    editingIndex = index;
    // Get the activity from the array
    const activity = activities[index];
    // Fill the form inputs with the activity's current data
    activityNameInput.value = activity.name;
    activityDateInput.value = activity.date;
    activityDescInput.value = activity.description;
    // Show the Update and Cancel buttons, hide the Add button
    addBtn.style.display = 'none';
    updateBtn.style.display = 'inline-flex';
    cancelBtn.style.display = 'inline-flex';
    // Scroll to the form so the user can see it
    document.getElementById('activities').scrollIntoView({ behavior: 'smooth' });
    // Show a message
    showToast('Editing: ' + activity.name, 'success');
}
// Step 2: Save the updated activity
function updateActivity() {
    // Get the updated values from the form
    const name = activityNameInput.value.trim();
    const date = activityDateInput.value;
    const description = activityDescInput.value.trim();
    // Validate that all fields are filled
    if (name === '' || date === '' || description === '') {
        showToast('Please fill in all fields before updating.', 'error');
        return;
    }
    // Update the activity in the array
    activities[editingIndex] = {
        name: name,
        date: date,
        description: description
    };
    // Reset the form and buttons
    cancelEdit();
    // Re-render the activities list
    renderActivities();
    // Show success message
    showToast('Activity updated successfully!', 'success');
}
// Cancel editing and reset the form
function cancelEdit() {
    // Reset the editing index
    editingIndex = -1;
    // Clear the form
    clearForm();
    // Show the Add button, hide Update and Cancel buttons
    addBtn.style.display = 'inline-flex';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}
// ========================
// DELETE - Remove an Activity
// ========================
function deleteActivity(index) {
    // Ask for confirmation before deleting
    const activityName = activities[index].name;
    const confirmDelete = confirm('Are you sure you want to delete "' + activityName + '"?');
    if (confirmDelete) {
        // Remove the activity from the array using splice
        activities.splice(index, 1);
        // If we were editing this item, cancel the edit
        if (editingIndex === index) {
            cancelEdit();
        } else if (editingIndex > index) {
            // Adjust the editing index if needed
            editingIndex--;
        }
        // Re-render the activities list
        renderActivities();
        // Show success message
        showToast('Activity "' + activityName + '" deleted.', 'success');
    }
}
// ========================
// HELPER FUNCTIONS
// ========================
// Clear all form inputs
function clearForm() {
    activityNameInput.value = '';
    activityDateInput.value = '';
    activityDescInput.value = '';
}
// Format a date string (YYYY-MM-DD) to a readable format
function formatDate(dateString) {
    // Create a Date object from the string
    const date = new Date(dateString + 'T00:00:00');
    // Define month names
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    // Build the formatted date string
    const month = months[date.getMonth()];
    const day = date.getDate();
    const year = date.getFullYear();
    return month + ' ' + day + ', ' + year;
}
// ========================
// TOAST NOTIFICATION
// Shows a brief message at the bottom of the screen
// ========================
function showToast(message, type) {
    // Check if a toast already exists and remove it
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }
    // Create the toast element
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    // Choose icon based on type
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    // Set the toast content
    toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
    // Add the toast to the page
    document.body.appendChild(toast);
    // Show the toast (small delay for CSS transition)
    setTimeout(function() {
        toast.classList.add('show');
    }, 10);
    // Remove the toast after 3 seconds
    setTimeout(function() {
        toast.classList.remove('show');
        // Remove from DOM after fade out
        setTimeout(function() {
            toast.remove();
        }, 300);
    }, 3000);
}
// ========================
// CONTACT FORM HANDLER
// ========================
// Get the contact form element
const contactForm = document.getElementById('contact-form');
// Listen for form submission
contactForm.addEventListener('submit', function(event) {
    // Prevent the default form submission (page reload)
    event.preventDefault();
    // Get the form values
    const fullName = document.getElementById('fullname').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    // Basic validation
    if (fullName === '' || email === '' || message === '') {
        showToast('Please fill in all contact form fields.', 'error');
        return;
    }
    // In a real application, this data would be sent to a server
    // For now, we just show a success message
    showToast('Thank you, ' + fullName + '! Your message has been received.', 'success');
    // Clear the form
    contactForm.reset();
});
// ========================
// MOBILE NAVIGATION TOGGLE
// ========================
// Get the menu toggle button and nav list
const menuToggle = document.getElementById('menu-toggle');
const navList = document.getElementById('nav-list');
// Toggle the navigation menu on mobile
menuToggle.addEventListener('click', function() {
    navList.classList.toggle('active');
    // Change the icon between bars and times
    const icon = menuToggle.querySelector('i');
    if (navList.classList.contains('active')) {
        icon.className = 'fas fa-times';
    } else {
        icon.className = 'fas fa-bars';
    }
});
// Close mobile menu when a nav link is clicked
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
        // Close the mobile menu
        navList.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
        // Update active state
        navLinks.forEach(function(l) {
            l.classList.remove('active');
        });
        this.classList.add('active');
    });
});
// ========================
// ACTIVE NAVIGATION ON SCROLL
// Highlights the current section in the nav
// ========================
window.addEventListener('scroll', function() {
    // Get all sections
    const sections = document.querySelectorAll('.content-section');
    let currentSection = '';
    sections.forEach(function(section) {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) {
            currentSection = section.getAttribute('id');
        }
    });
    // Update nav link active states
    navLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
});
// ========================
// INITIALIZATION
// Code that runs when the page first loads
// ========================
// Add some sample activities so the page isn't empty
function loadSampleData() {
    activities = [
        {
            name: 'Debate Competition',
            date: '2026-02-10',
            description: 'Annual inter-class debate competition on current affairs.'
        },
        {
            name: 'Community Clean-Up Day',
            date: '2026-03-15',
            description: 'Volunteer activity to clean and beautify the campus environment.'
        },
        {
            name: 'Programming Workshop',
            date: '2026-04-05',
            description: 'Introductory workshop on Python programming for beginners.'
        }
    ];
    // Render the sample activities
    renderActivities();
}
// Load sample data when the page loads
loadSampleData();
