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

// ============================================================
// ADMIN PANEL
// Simple JS-only admin system. Credentials are checked
// client-side (suitable for a demo / beginner project).
// Default: username = "admin", password = "eastc2026"
// ============================================================

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'eastc2026';

// Track admin login state
let adminLoggedIn = false;

// ---- Admin data stores (mirrors the live page data) ----
let adminEvents = [
    { name: "Freshers' Welcome Party",          date: 'January 20, 2026',   venue: 'EASTC Main Hall'     },
    { name: 'Inter-College Sports Day',          date: 'February 14, 2026',  venue: 'EASTC Sports Ground' },
    { name: 'Academic Workshop: Data Science',   date: 'March 5, 2026',      venue: 'Computer Lab 2'      },
    { name: 'Cultural Night',                    date: 'April 10, 2026',     venue: 'EASTC Auditorium'    },
    { name: 'Leadership Seminar',                date: 'May 22, 2026',       venue: 'Conference Room A'   }
];

let adminAnnouncements = [
    { title: 'Registration Deadline',   body: 'All students must complete course registration by January 15, 2026.' },
    { title: 'Library Hours Extended',  body: 'The library will now remain open until 10:00 PM on weekdays during exam period.' },
    { title: 'Student ID Replacement',  body: 'Students who lost their IDs should visit the administration office for replacement.' },
    { title: 'Scholarship Opportunities', body: 'New scholarship applications for the 2026/2027 academic year are now open.' },
    { title: 'Health Check-Up',         body: 'Free health screening will be available at the campus clinic from January 25-30, 2026.' }
];

let adminLeaders = [
    { name: 'John Student',  role: 'President',      desc: 'Leading the organization with vision and dedication to serve all students.',       icon: 'fa-user-tie'     },
    { name: 'Amina Hassan',  role: 'Vice President',  desc: 'Supporting organizational initiatives and driving student engagement.',           icon: 'fa-user-graduate' },
    { name: 'Peter Joseph',  role: 'Secretary',       desc: 'Managing communication and keeping accurate organizational records.',             icon: 'fa-user-edit'    },
    { name: 'Grace Mwamba',  role: 'Treasurer',       desc: 'Overseeing financial planning and transparent budget management.',               icon: 'fa-user-shield'  }
];

// ========================
// LOGIN / LOGOUT
// ========================
function openAdminLogin() {
    if (adminLoggedIn) {
        openAdminPanel();
        return;
    }
    document.getElementById('admin-login-modal').style.display = 'flex';
    document.getElementById('admin-login-error').style.display = 'none';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    setTimeout(function() { document.getElementById('admin-username').focus(); }, 100);
}

function closeAdminLogin() {
    document.getElementById('admin-login-modal').style.display = 'none';
}

function doAdminLogin() {
    var user = document.getElementById('admin-username').value.trim();
    var pass = document.getElementById('admin-password').value;
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        adminLoggedIn = true;
        closeAdminLogin();
        openAdminPanel();
        // Update the nav button to show unlocked icon
        var btn = document.getElementById('admin-nav-btn');
        if (btn) { btn.innerHTML = '<i class="fas fa-unlock"></i> Admin'; }
    } else {
        document.getElementById('admin-login-error').style.display = 'block';
    }
}

// Allow Enter key to submit login
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('admin-login-modal').style.display === 'flex') {
        doAdminLogin();
    }
});

function adminLogout() {
    adminLoggedIn = false;
    closeAdminPanel();
    var btn = document.getElementById('admin-nav-btn');
    if (btn) { btn.innerHTML = '<i class="fas fa-lock"></i> Admin'; }
    showToast('Logged out of admin panel.', 'success');
}

// ========================
// OPEN / CLOSE PANEL
// ========================
function openAdminPanel() {
    document.getElementById('admin-panel-modal').style.display = 'flex';
    // Load site info fields
    document.getElementById('adm-site-title').value   = document.querySelector('.logo h1').textContent;
    document.getElementById('adm-site-tagline').value = document.querySelector('.tagline').textContent;
    document.getElementById('adm-site-welcome').value = document.querySelector('.welcome-message').innerText.replace(/^\s+|\s+$/g, '');
    var logoImg = document.querySelector('.logo img');
    document.getElementById('adm-site-logo').value = logoImg ? logoImg.getAttribute('src') : '';
    // Render all lists
    renderAdminActivities();
    renderAdminEvents();
    renderAdminAnnouncements();
    renderAdminLeaders();
}

function closeAdminPanel() {
    document.getElementById('admin-panel-modal').style.display = 'none';
}

// ========================
// TAB SWITCHING
// ========================
function switchAdminTab(tabId, btn) {
    // Hide all tab contents
    document.querySelectorAll('.admin-tab-content').forEach(function(t) { t.classList.remove('active'); });
    // Deactivate all tab buttons
    document.querySelectorAll('.admin-tab').forEach(function(b) { b.classList.remove('active'); });
    // Show selected tab
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// ========================
// ACTIVITIES TAB (re-uses the main activities array)
// ========================
function renderAdminActivities() {
    var list = document.getElementById('adm-activities-list');
    if (activities.length === 0) {
        list.innerHTML = '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No activities yet.</p>';
        return;
    }
    list.innerHTML = activities.map(function(a, i) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><strong>' + a.name + '</strong><span>' + formatDate(a.date) + ' &mdash; ' + a.description + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteActivity(' + i + ')"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('');
}

function adminAddActivity() {
    var name = document.getElementById('adm-act-name').value.trim();
    var date = document.getElementById('adm-act-date').value;
    var desc = document.getElementById('adm-act-desc').value.trim();
    if (!name || !date || !desc) { showToast('Fill all activity fields.', 'error'); return; }
    activities.push({ name: name, date: date, description: desc });
    renderActivities();          // update main page
    renderAdminActivities();     // update admin list
    document.getElementById('adm-act-name').value = '';
    document.getElementById('adm-act-date').value = '';
    document.getElementById('adm-act-desc').value = '';
    showToast('Activity added!', 'success');
}

function adminDeleteActivity(i) {
    if (!confirm('Delete "' + activities[i].name + '"?')) return;
    activities.splice(i, 1);
    renderActivities();
    renderAdminActivities();
    showToast('Activity deleted.', 'success');
}

// ========================
// EVENTS TAB
// ========================
function renderAdminEvents() {
    var list = document.getElementById('adm-events-list');
    list.innerHTML = adminEvents.map(function(e, i) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><strong>' + e.name + '</strong><span>' + e.date + ' &mdash; ' + e.venue + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteEvent(' + i + ')"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('') || '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No events.</p>';
}

function adminAddEvent() {
    var name  = document.getElementById('adm-evt-name').value.trim();
    var date  = document.getElementById('adm-evt-date').value.trim();
    var venue = document.getElementById('adm-evt-venue').value.trim();
    if (!name || !date || !venue) { showToast('Fill all event fields.', 'error'); return; }
    adminEvents.push({ name: name, date: date, venue: venue });
    renderAdminEvents();
    syncEventsTable();
    document.getElementById('adm-evt-name').value  = '';
    document.getElementById('adm-evt-date').value  = '';
    document.getElementById('adm-evt-venue').value = '';
    showToast('Event added!', 'success');
}

function adminDeleteEvent(i) {
    if (!confirm('Delete "' + adminEvents[i].name + '"?')) return;
    adminEvents.splice(i, 1);
    renderAdminEvents();
    syncEventsTable();
    showToast('Event deleted.', 'success');
}

function syncEventsTable() {
    var tbody = document.querySelector('#events-table tbody');
    if (!tbody) return;
    tbody.innerHTML = adminEvents.map(function(e) {
        return '<tr><td>' + e.name + '</td><td>' + e.date + '</td><td>' + e.venue + '</td></tr>';
    }).join('');
}

// ========================
// ANNOUNCEMENTS TAB
// ========================
function renderAdminAnnouncements() {
    var list = document.getElementById('adm-announcements-list');
    list.innerHTML = adminAnnouncements.map(function(a, i) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><strong>' + a.title + '</strong><span>' + a.body + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteAnnouncement(' + i + ')"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('') || '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No announcements.</p>';
}

function adminAddAnnouncement() {
    var title = document.getElementById('adm-ann-title').value.trim();
    var body  = document.getElementById('adm-ann-body').value.trim();
    if (!title || !body) { showToast('Fill both announcement fields.', 'error'); return; }
    adminAnnouncements.push({ title: title, body: body });
    renderAdminAnnouncements();
    syncAnnouncementsList();
    document.getElementById('adm-ann-title').value = '';
    document.getElementById('adm-ann-body').value  = '';
    showToast('Announcement added!', 'success');
}

function adminDeleteAnnouncement(i) {
    if (!confirm('Delete announcement "' + adminAnnouncements[i].title + '"?')) return;
    adminAnnouncements.splice(i, 1);
    renderAdminAnnouncements();
    syncAnnouncementsList();
    showToast('Announcement deleted.', 'success');
}

function syncAnnouncementsList() {
    var ol = document.querySelector('.announcements-list');
    if (!ol) return;
    ol.innerHTML = adminAnnouncements.map(function(a) {
        return '<li><strong>' + a.title + ':</strong> ' + a.body + '</li>';
    }).join('');
}

// ========================
// LEADERS TAB
// ========================
function renderAdminLeaders() {
    var list = document.getElementById('adm-leaders-list');
    list.innerHTML = adminLeaders.map(function(l, i) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><strong>' + l.name + ' &mdash; ' + l.role + '</strong><span>' + l.desc + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteLeader(' + i + ')"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('') || '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No leaders.</p>';
}

function adminAddLeader() {
    var name = document.getElementById('adm-ldr-name').value.trim();
    var role = document.getElementById('adm-ldr-role').value.trim();
    var desc = document.getElementById('adm-ldr-desc').value.trim();
    var icon = document.getElementById('adm-ldr-icon').value.trim() || 'fa-user';
    if (!name || !role || !desc) { showToast('Fill name, role, and description.', 'error'); return; }
    adminLeaders.push({ name: name, role: role, desc: desc, icon: icon });
    renderAdminLeaders();
    syncLeadersGrid();
    document.getElementById('adm-ldr-name').value = '';
    document.getElementById('adm-ldr-role').value = '';
    document.getElementById('adm-ldr-desc').value = '';
    document.getElementById('adm-ldr-icon').value = '';
    showToast('Leader added!', 'success');
}

function adminDeleteLeader(i) {
    if (!confirm('Remove "' + adminLeaders[i].name + '" from leaders?')) return;
    adminLeaders.splice(i, 1);
    renderAdminLeaders();
    syncLeadersGrid();
    showToast('Leader removed.', 'success');
}

function syncLeadersGrid() {
    var grid = document.querySelector('.leaders-grid');
    if (!grid) return;
    grid.innerHTML = adminLeaders.map(function(l) {
        return '<div class="leader-card">' +
            '<div class="leader-icon"><i class="fas ' + l.icon + '"></i></div>' +
            '<h3>' + l.name + '</h3>' +
            '<p class="leader-role">' + l.role + '</p>' +
            '<p class="leader-desc">' + l.desc + '</p>' +
            '</div>';
    }).join('');
}

// ========================
// SITE INFO TAB
// ========================
function adminSaveSiteInfo() {
    var title    = document.getElementById('adm-site-title').value.trim();
    var tagline  = document.getElementById('adm-site-tagline').value.trim();
    var welcome  = document.getElementById('adm-site-welcome').value.trim();
    var logoSrc  = document.getElementById('adm-site-logo').value.trim();

    if (title)   { document.querySelector('.logo h1').textContent = title; document.title = title + ' Portal'; }
    if (tagline) { document.querySelector('.tagline').textContent = tagline; }
    if (welcome) {
        var wm = document.querySelector('.welcome-message');
        if (wm) { wm.innerHTML = '<i class="fas fa-star accent-icon"></i> ' + welcome; }
    }
    if (logoSrc) {
        var logoImg = document.querySelector('.logo img');
        if (logoImg) { logoImg.setAttribute('src', logoSrc); }
    }
    showToast('Site info updated!', 'success');
}
