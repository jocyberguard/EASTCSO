/* =============================================
   EASTC Students Organization Portal
   JavaScript File (script.js)
   Features:
   - Contact Form Handling
   - Mobile Navigation Toggle
   - Toast Notifications
   - Admin Panel with PHP Backend API
   - Image uploads via FormData
   - InfinityFree compatible: POST method override
   ============================================= */

// API base URL (adjust if hosting in a subdirectory)
const API_BASE = 'backend/';

// Admin auth token (stored in memory, not localStorage for security)
let adminToken = '';
let adminLoggedIn = false;
let backendConnected = false;

// Data caches (fetched from backend)
let activities = [];
let adminEvents = [];
let adminAnnouncements = [];
let adminLeaders = [];
let adminGallery = [];
let siteInfo = {};
let adminMessages = [];

// Editing state
let editingActivityIndex = -1;
let editingEventIndex = -1;
let editingAnnouncementIndex = -1;
let editingLeaderIndex = -1;
let editingGalleryIndex = -1;

// Temporary image files for previews
let tempEventImage = null;
let tempLeaderPhoto = null;
let tempGalleryImage = null;
let tempLogoImage = null;

// ============================================================
// API HELPERS
// All write operations use POST with _method override
// to work on InfinityFree (which blocks PUT/DELETE)
// ============================================================

// Build URL with optional _token query param for auth fallback
function buildUrl(endpoint, includeToken) {
    var url = API_BASE + endpoint;
    if (includeToken && adminToken) {
        var separator = url.indexOf('?') >= 0 ? '&' : '?';
        url += separator + '_token=' + encodeURIComponent(adminToken);
    }
    return url;
}

async function apiGet(endpoint) {
    const headers = {};
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(buildUrl(endpoint, true), {
        method: 'GET',
        headers: headers
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
}

async function apiPost(endpoint, data) {
    const headers = { 'Content-Type': 'application/json' };
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(buildUrl(endpoint, true), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
}

// PUT is sent as POST with _method=PUT (InfinityFree blocks real PUT)
async function apiPut(endpoint, data) {
    const headers = { 'Content-Type': 'application/json' };
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    // Add _method override to the data payload
    var payload = Object.assign({}, data, { _method: 'PUT' });
    const res = await fetch(buildUrl(endpoint, true), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
}

// DELETE is sent as POST with _method=DELETE (InfinityFree blocks real DELETE)
async function apiDelete(endpoint, data) {
    const headers = { 'Content-Type': 'application/json' };
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    // Add _method override to the data payload
    var payload = Object.assign({}, data, { _method: 'DELETE' });
    const res = await fetch(buildUrl(endpoint, true), {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('API error: ' + res.status);
    return res.json();
}

async function apiUpload(file) {
    const formData = new FormData();
    formData.append('image', file);
    const headers = {};
    if (adminToken) headers['Authorization'] = 'Bearer ' + adminToken;
    const res = await fetch(buildUrl('upload.php', true), {
        method: 'POST',
        headers: headers,
        body: formData
    });
    if (!res.ok) throw new Error('Upload error: ' + res.status);
    return res.json();
}

// ============================================================
// BACKEND CONNECTIVITY & ERROR HELPERS
// ============================================================
function isNetworkError(e) {
    var msg = e.message || '';
    return msg.includes('Failed to fetch') ||
           msg.includes('NetworkError') ||
           msg.includes('fetch') ||
           msg.includes('Network') ||
           msg.includes('CORS') ||
           msg.includes('cors') ||
           msg.includes('404') ||
           msg.includes('ENOTFOUND') ||
           !backendConnected;
}

async function checkBackendConnection() {
    try {
        await fetch(API_BASE + 'ping.php', { method: 'GET', cache: 'no-store' });
        backendConnected = true;
        hideBackendBanner();
        return true;
    } catch (e) {
        backendConnected = false;
        showBackendBanner('Backend not connected. Admin features and data persistence will not work. Make sure the PHP server is running.');
        return false;
    }
}

function showBackendBanner(msg) {
    var banner = document.getElementById('backend-banner');
    var bannerMsg = document.getElementById('backend-banner-msg');
    if (banner && bannerMsg) {
        bannerMsg.textContent = msg;
        banner.style.display = 'flex';
    }
}

function hideBackendBanner() {
    var banner = document.getElementById('backend-banner');
    if (banner) banner.style.display = 'none';
}

function getBackendErrorMessage(e, context) {
    var msg = e.message || '';
    if (isNetworkError(e)) {
        return context + ': Cannot connect to backend. Check that the PHP server is running.';
    }
    if (msg.includes('401')) return context + ': Not authorized. Please log in again.';
    if (msg.includes('403')) return context + ': Access denied.';
    if (msg.includes('500')) return context + ': Server error. Check PHP logs.';
    return context + ': ' + msg;
}

// ============================================================
// HELPER: format date
// ============================================================
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString + 'T00:00:00');
    if (isNaN(date.getTime())) return dateString;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    return months[date.getMonth()] + ' ' + date.getDate() + ', ' + date.getFullYear();
}

// ============================================================
// TOAST NOTIFICATION
// ============================================================
function showToast(message, type) {
    const existingToast = document.querySelector('.toast');
    if (existingToast) { existingToast.remove(); }
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    toast.innerHTML = '<i class="fas ' + icon + '"></i> ' + message;
    document.body.appendChild(toast);
    setTimeout(function() { toast.classList.add('show'); }, 10);
    setTimeout(function() { toast.classList.remove('show'); setTimeout(function() { toast.remove(); }, 300); }, 3000);
}

// ============================================================
// CONTACT FORM
// ============================================================
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', async function(event) {
        event.preventDefault();
        const submitBtn = document.getElementById('submit-btn');
        const originalBtnHtml = submitBtn ? submitBtn.innerHTML : '';
        const fullName = document.getElementById('fullname').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        if (fullName === '' || email === '' || message === '') {
            showToast('Please fill in all contact form fields.', 'error');
            return;
        }
        try {
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            }
            const res = await apiPost('messages.php', { name: fullName, email: email, message: message });
            if (res.success) {
                showToast('Thank you, ' + fullName + '! Your message has been received.', 'success');
                contactForm.reset();
            } else {
                showToast(res.error || 'Failed to send message.', 'error');
            }
        } catch(e) {
            showToast(getBackendErrorMessage(e, 'Error'), 'error');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnHtml;
            }
        }
    });
}

// ============================================================
// MOBILE NAVIGATION
// ============================================================
const menuToggle = document.getElementById('menu-toggle');
const navList = document.getElementById('nav-list');
if (menuToggle) {
    menuToggle.addEventListener('click', function() {
        navList.classList.toggle('active');
        const icon = menuToggle.querySelector('i');
        icon.className = navList.classList.contains('active') ? 'fas fa-times' : 'fas fa-bars';
    });
}
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(function(link) {
    link.addEventListener('click', function() {
        navList.classList.remove('active');
        const icon = menuToggle.querySelector('i');
        icon.className = 'fas fa-bars';
        navLinks.forEach(function(l) { l.classList.remove('active'); });
        this.classList.add('active');
    });
});
window.addEventListener('scroll', function() {
    const sections = document.querySelectorAll('.content-section');
    let currentSection = '';
    sections.forEach(function(section) {
        const sectionTop = section.offsetTop - 100;
        if (window.scrollY >= sectionTop) { currentSection = section.getAttribute('id'); }
    });
    navLinks.forEach(function(link) {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) { link.classList.add('active'); }
    });
});

// ============================================================
// SYNC FUNCTIONS - render page content from data
// ============================================================
function syncAll() {
    syncSiteInfo();
    syncMission();
    syncLeadersGrid();
    syncEventsGrid();
    syncAnnouncementsList();
    syncGalleryGrid();
    syncActivities();
    syncImportantDates();
}

function syncSiteInfo() {
    if (!siteInfo) return;
    var logoImg = document.querySelector('.logo img');
    if (logoImg) {
        if (siteInfo.logo_file) { logoImg.setAttribute('src', siteInfo.logo_file); }
        else if (siteInfo.logo) { logoImg.setAttribute('src', siteInfo.logo); }
    }
    var h1 = document.querySelector('.logo h1');
    if (h1) { h1.textContent = siteInfo.title || 'EASTC Students Organization'; document.title = (siteInfo.title || 'EASTC Students Organization') + ' Portal'; }
    var tag = document.querySelector('.tagline');
    if (tag) { tag.textContent = siteInfo.tagline || ''; }
    var wm = document.querySelector('.welcome-message');
    if (wm) { wm.innerHTML = '<i class="fas fa-star accent-icon"></i> ' + (siteInfo.welcome || ''); }
    var ft = document.querySelector('.footer-tagline');
    if (ft) { ft.innerHTML = '<i class="fas fa-heart"></i> ' + (siteInfo.footer || ''); }
}

function syncMission() {
    var ml = document.querySelector('.mission-list');
    if (!ml) return;
    var items = [];
    if (Array.isArray(siteInfo.mission)) {
        items = siteInfo.mission;
    } else if (typeof siteInfo.mission === 'string') {
        items = siteInfo.mission.split('\n').filter(function(s) { return s.trim(); });
    }
    ml.innerHTML = items.map(function(item) {
        return '<li><i class="fas fa-check-circle"></i> ' + item + '</li>';
    }).join('');
}

function syncLeadersGrid() {
    var grid = document.querySelector('.leaders-grid');
    if (!grid) return;
    grid.innerHTML = adminLeaders.map(function(l) {
        var photoHtml = '';
        if (l.photo) {
            photoHtml = '<img src="' + l.photo + '" alt="' + l.name + '">';
        } else {
            photoHtml = '<i class="fas ' + (l.icon || 'fa-user') + '"></i>';
        }
        return '<div class="leader-card">' +
            '<div class="leader-photo">' + photoHtml + '</div>' +
            '<h3>' + l.name + '</h3>' +
            '<p class="leader-role">' + l.role + '</p>' +
            '<p class="leader-desc">' + l.description + '</p>' +
        '</div>';
    }).join('');
}

function syncEventsGrid() {
    var grid = document.getElementById('events-grid');
    if (!grid) return;
    if (adminEvents.length === 0) {
        grid.innerHTML = '<p class="empty-message"><i class="fas fa-info-circle"></i> No events scheduled.</p>';
        return;
    }
    grid.innerHTML = adminEvents.map(function(e) {
        var imgHtml = '';
        if (e.image) {
            imgHtml = '<img src="' + e.image + '" alt="' + e.name + '" class="event-card-image">';
        } else {
            imgHtml = '<div class="event-card-placeholder"><i class="fas fa-calendar-alt"></i></div>';
        }
        return '<div class="event-card">' +
            '<div class="event-card-img-wrap">' + imgHtml + '</div>' +
            '<div class="event-card-content">' +
                '<h4 class="event-card-title">' + e.name + '</h4>' +
                '<p class="event-card-date"><i class="fas fa-calendar"></i> ' + e.date + '</p>' +
                '<p class="event-card-venue"><i class="fas fa-map-marker-alt"></i> ' + e.venue + '</p>' +
            '</div>' +
        '</div>';
    }).join('');
}

function syncAnnouncementsList() {
    var ol = document.querySelector('.announcements-list');
    if (!ol) return;
    ol.innerHTML = adminAnnouncements.map(function(a) {
        return '<li><strong>' + a.title + ':</strong> ' + a.body + '</li>';
    }).join('');
}

function syncGalleryGrid() {
    var grid = document.getElementById('gallery-grid');
    if (!grid) return;
    if (adminGallery.length === 0) {
        grid.innerHTML = '<p class="empty-message" id="gallery-empty-msg"><i class="fas fa-info-circle"></i> No gallery images yet. Add some from the admin panel!</p>';
        return;
    }
    grid.innerHTML = adminGallery.map(function(g) {
        return '<div class="gallery-item">' +
            '<img src="' + g.image + '" alt="' + (g.title || 'Gallery image') + '">' +
            '<div class="gallery-item-caption">' + (g.title || '') + '</div>' +
        '</div>';
    }).join('');
}

function syncActivities() {
    var list = document.getElementById('activities-list');
    if (!list) return;
    if (activities.length === 0) {
        list.innerHTML = '<p class="empty-message"><i class="fas fa-info-circle"></i> No activities added yet.</p>';
        return;
    }
    list.innerHTML = activities.map(function(a) {
        return '<div class="activity-item">' +
            '<div class="activity-info">' +
                '<h4><i class="fas fa-clipboard-list" style="color: #F4C430; margin-right: 8px;"></i>' + a.name + '</h4>' +
                '<p class="activity-date"><i class="fas fa-calendar-day"></i> ' + formatDate(a.date) + '</p>' +
                '<p class="activity-description">' + a.description + '</p>' +
            '</div>' +
        '</div>';
    }).join('');
}

function syncImportantDates() {
    var list = document.getElementById('dates-list');
    if (!list) return;
    if (adminEvents.length === 0) {
        list.innerHTML = '<li><span>No upcoming dates</span></li>';
        return;
    }
    // Format short month names
    var shortMonths = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    list.innerHTML = adminEvents.map(function(e) {
        var shortDate = e.date;
        // Try to parse the date string into a short format like "Jan 20"
        var parsed = new Date(e.date);
        if (!isNaN(parsed.getTime())) {
            shortDate = shortMonths[parsed.getMonth()] + ' ' + parsed.getDate();
        } else {
            // If date is text like "January 20, 2026", extract month+day
            var match = e.date.match(/^(\w+)\s+(\d+)/);
            if (match) {
                var monthFull = match[1];
                var dayNum = match[2];
                var monthIdx = ['January','February','March','April','May','June','July','August','September','October','November','December'].indexOf(monthFull);
                if (monthIdx >= 0) {
                    shortDate = shortMonths[monthIdx] + ' ' + dayNum;
                } else {
                    shortDate = monthFull.substring(0, 3) + ' ' + dayNum;
                }
            }
        }
        return '<li><strong>' + shortDate + '</strong><span>' + e.name + '</span></li>';
    }).join('');
}

// ============================================================
// LOAD ALL DATA FROM BACKEND
// ============================================================
async function loadAllData() {
    var failed = 0;
    try {
        siteInfo = await apiGet('site-info.php');
    } catch(e) { failed++; console.error('site-info', e); }
    try {
        adminLeaders = await apiGet('leaders.php');
    } catch(e) { failed++; console.error('leaders', e); }
    try {
        adminEvents = await apiGet('events.php');
    } catch(e) { failed++; console.error('events', e); }
    try {
        adminAnnouncements = await apiGet('announcements.php');
    } catch(e) { failed++; console.error('announcements', e); }
    try {
        activities = await apiGet('activities.php');
    } catch(e) { failed++; console.error('activities', e); }
    try {
        adminGallery = await apiGet('gallery.php');
    } catch(e) { failed++; console.error('gallery', e); }
    if (failed < 6) {
        syncAll();
    }
    if (failed >= 6) {
        showBackendBanner('Backend not connected. Data will not load or save. Please run a web server (e.g., XAMPP, or python -m http.server).');
        showToast('Backend not connected. Page loaded with default content only.', 'error');
    }
}

// ============================================================
// ADMIN PANEL
// ============================================================
function openAdminLogin() {
    if (adminLoggedIn) { openAdminPanel(); return; }
    document.getElementById('admin-login-modal').style.display = 'flex';
    document.getElementById('admin-login-error').style.display = 'none';
    var netErrDiv = document.getElementById('admin-login-network-error');
    if (netErrDiv) netErrDiv.style.display = 'none';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
    setTimeout(function() { document.getElementById('admin-username').focus(); }, 100);
}
function closeAdminLogin() { document.getElementById('admin-login-modal').style.display = 'none'; }

async function doAdminLogin() {
    var user = document.getElementById('admin-username').value.trim();
    var pass = document.getElementById('admin-password').value;
    var errDiv = document.getElementById('admin-login-error');
    var netErrDiv = document.getElementById('admin-login-network-error');
    errDiv.style.display = 'none';
    if (netErrDiv) netErrDiv.style.display = 'none';
    try {
        var res = await apiPost('auth.php', { username: user, password: pass });
        if (res.success && res.token) {
            adminToken = res.token;
            adminLoggedIn = true;
            backendConnected = true;
            hideBackendBanner();
            closeAdminLogin();
            openAdminPanel();
            var btn = document.getElementById('admin-nav-btn');
            if (btn) { btn.innerHTML = '<i class="fas fa-unlock"></i> Admin'; }
            showToast('Logged in successfully!', 'success');
        } else {
            errDiv.textContent = res.error || 'Invalid credentials. Try again.';
            errDiv.style.display = 'block';
        }
    } catch(e) {
        if (isNetworkError(e)) {
            if (netErrDiv) netErrDiv.style.display = 'block';
            else showToast('Cannot connect to backend. Check that the PHP server is running.', 'error');
        } else {
            errDiv.textContent = 'Invalid credentials. Try again.';
            errDiv.style.display = 'block';
        }
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && document.getElementById('admin-login-modal').style.display === 'flex') { doAdminLogin(); }
});

function adminLogout() {
    adminLoggedIn = false;
    adminToken = '';
    closeAdminPanel();
    var btn = document.getElementById('admin-nav-btn');
    if (btn) { btn.innerHTML = '<i class="fas fa-lock"></i> Admin'; }
    showToast('Logged out of admin panel.', 'success');
}

async function openAdminPanel() {
    document.getElementById('admin-panel-modal').style.display = 'flex';
    document.getElementById('adm-site-title').value = siteInfo.title || '';
    document.getElementById('adm-site-tagline').value = siteInfo.tagline || '';
    document.getElementById('adm-site-welcome').value = siteInfo.welcome || '';
    document.getElementById('adm-site-logo').value = siteInfo.logo || '';
    var missionArr = Array.isArray(siteInfo.mission) ? siteInfo.mission : (siteInfo.mission || '').split('\n');
    document.getElementById('adm-site-mission').value = missionArr.join('\n');
    document.getElementById('adm-site-footer').value = siteInfo.footer || '';
    renderAdminActivities();
    renderAdminEvents();
    renderAdminAnnouncements();
    renderAdminLeaders();
    renderAdminGallery();
    var msgList = document.getElementById('adm-messages-list');
    if (msgList) {
        msgList.innerHTML = '<p style="color:#888; font-size:0.9rem; padding:10px 0;"><i class="fas fa-spinner fa-spin"></i> Loading messages...</p>';
    }
    try {
        adminMessages = await apiGet('messages.php');
        renderAdminMessages();
    } catch(e) {
        console.error('Failed to load messages on admin panel open', e);
        if (msgList) {
            msgList.innerHTML = '<p style="color:#dc3545; font-size:0.9rem; padding:10px 0;"><i class="fas fa-exclamation-circle"></i> Failed to load messages: ' + e.message + '</p>';
        }
    }
}
function closeAdminPanel() { document.getElementById('admin-panel-modal').style.display = 'none'; }

function switchAdminTab(tabId, btn) {
    document.querySelectorAll('.admin-tab-content').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.admin-tab').forEach(function(b) { b.classList.remove('active'); });
    document.getElementById(tabId).classList.add('active');
    btn.classList.add('active');
}

// ============================================================
// ADMIN: ACTIVITIES
// ============================================================
function renderAdminActivities() {
    var list = document.getElementById('adm-activities-list');
    if (activities.length === 0) { list.innerHTML = '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No activities yet.</p>'; return; }
    list.innerHTML = activities.map(function(a, i) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><strong>' + a.name + '</strong><span>' + formatDate(a.date) + ' &mdash; ' + a.description + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-edit" onclick="adminEditActivity(' + a.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteActivity(' + a.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('');
}

async function adminAddActivity() {
    var name = document.getElementById('adm-act-name').value.trim();
    var date = document.getElementById('adm-act-date').value;
    var desc = document.getElementById('adm-act-desc').value.trim();
    if (!name || !date || !desc) { showToast('Fill all activity fields.', 'error'); return; }
    try {
        await apiPost('activities.php', { name: name, date: date, description: desc });
        activities = await apiGet('activities.php');
        syncActivities(); renderAdminActivities();
        clearActivityForm();
        showToast('Activity added!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminEditActivity(id) {
    var a = activities.find(function(x) { return x.id == id; });
    if (!a) return;
    editingActivityIndex = id;
    document.getElementById('adm-act-name').value = a.name;
    document.getElementById('adm-act-date').value = a.date;
    document.getElementById('adm-act-desc').value = a.description;
    document.getElementById('adm-act-btn').style.display = 'none';
    document.getElementById('adm-act-update-btn').style.display = 'inline-flex';
    document.getElementById('adm-act-cancel-btn').style.display = 'inline-flex';
}

async function adminUpdateActivity() {
    if (editingActivityIndex < 0) return;
    var name = document.getElementById('adm-act-name').value.trim();
    var date = document.getElementById('adm-act-date').value;
    var desc = document.getElementById('adm-act-desc').value.trim();
    if (!name || !date || !desc) { showToast('Fill all activity fields.', 'error'); return; }
    try {
        await apiPut('activities.php', { id: editingActivityIndex, name: name, date: date, description: desc });
        activities = await apiGet('activities.php');
        adminCancelActivity();
        syncActivities(); renderAdminActivities();
        showToast('Activity updated!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminCancelActivity() {
    editingActivityIndex = -1;
    clearActivityForm();
    document.getElementById('adm-act-btn').style.display = 'inline-flex';
    document.getElementById('adm-act-update-btn').style.display = 'none';
    document.getElementById('adm-act-cancel-btn').style.display = 'none';
}

function clearActivityForm() {
    document.getElementById('adm-act-name').value = '';
    document.getElementById('adm-act-date').value = '';
    document.getElementById('adm-act-desc').value = '';
}

async function adminDeleteActivity(id) {
    if (!confirm('Delete this activity?')) return;
    try {
        await apiDelete('activities.php', { id: id });
        activities = await apiGet('activities.php');
        syncActivities(); renderAdminActivities();
        showToast('Activity deleted.', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

// ============================================================
// ADMIN: EVENTS
// ============================================================
function renderAdminEvents() {
    var list = document.getElementById('adm-events-list');
    list.innerHTML = adminEvents.map(function(e) {
        var imgTag = e.image ? '<i class="fas fa-image" style="color:#005B96;margin-right:4px;"></i>' : '';
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info">' + imgTag + '<strong>' + e.name + '</strong><span>' + e.date + ' &mdash; ' + e.venue + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-edit" onclick="adminEditEvent(' + e.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteEvent(' + e.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('') || '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No events.</p>';
}

async function previewAdminEventImage(input) {
    if (input.files && input.files[0]) {
        try {
            var res = await apiUpload(input.files[0]);
            if (res.success) {
                tempEventImage = res.url;
                var preview = document.getElementById('adm-evt-preview');
                preview.src = tempEventImage;
                preview.style.display = 'block';
            }
        } catch(e) { showToast(getBackendErrorMessage(e, 'Upload failed'), 'error'); }
    }
}

async function adminAddEvent() {
    var name = document.getElementById('adm-evt-name').value.trim();
    var date = document.getElementById('adm-evt-date').value.trim();
    var venue = document.getElementById('adm-evt-venue').value.trim();
    if (!name || !date || !venue) { showToast('Fill all event fields.', 'error'); return; }
    try {
        await apiPost('events.php', { name: name, date: date, venue: venue, image: tempEventImage });
        adminEvents = await apiGet('events.php');
        syncEventsGrid(); renderAdminEvents();
        clearEventForm();
        showToast('Event added!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminEditEvent(id) {
    var e = adminEvents.find(function(x) { return x.id == id; });
    if (!e) return;
    editingEventIndex = id;
    document.getElementById('adm-evt-name').value = e.name;
    document.getElementById('adm-evt-date').value = e.date;
    document.getElementById('adm-evt-venue').value = e.venue;
    tempEventImage = e.image;
    var preview = document.getElementById('adm-evt-preview');
    if (e.image) { preview.src = e.image; preview.style.display = 'block'; }
    else { preview.src = ''; preview.style.display = 'none'; }
    document.getElementById('adm-evt-btn').style.display = 'none';
    document.getElementById('adm-evt-update-btn').style.display = 'inline-flex';
    document.getElementById('adm-evt-cancel-btn').style.display = 'inline-flex';
}

async function adminUpdateEvent() {
    if (editingEventIndex < 0) return;
    var name = document.getElementById('adm-evt-name').value.trim();
    var date = document.getElementById('adm-evt-date').value.trim();
    var venue = document.getElementById('adm-evt-venue').value.trim();
    if (!name || !date || !venue) { showToast('Fill all event fields.', 'error'); return; }
    try {
        await apiPut('events.php', { id: editingEventIndex, name: name, date: date, venue: venue, image: tempEventImage });
        adminEvents = await apiGet('events.php');
        adminCancelEvent();
        syncEventsGrid(); renderAdminEvents();
        showToast('Event updated!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminCancelEvent() {
    editingEventIndex = -1;
    clearEventForm();
    document.getElementById('adm-evt-btn').style.display = 'inline-flex';
    document.getElementById('adm-evt-update-btn').style.display = 'none';
    document.getElementById('adm-evt-cancel-btn').style.display = 'none';
}

function clearEventForm() {
    document.getElementById('adm-evt-name').value = '';
    document.getElementById('adm-evt-date').value = '';
    document.getElementById('adm-evt-venue').value = '';
    document.getElementById('adm-evt-image').value = '';
    document.getElementById('adm-evt-preview').src = '';
    document.getElementById('adm-evt-preview').style.display = 'none';
    tempEventImage = null;
}

async function adminDeleteEvent(id) {
    if (!confirm('Delete this event?')) return;
    try {
        await apiDelete('events.php', { id: id });
        adminEvents = await apiGet('events.php');
        syncEventsGrid(); renderAdminEvents();
        showToast('Event deleted.', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

// ============================================================
// ADMIN: ANNOUNCEMENTS
// ============================================================
function renderAdminAnnouncements() {
    var list = document.getElementById('adm-announcements-list');
    list.innerHTML = adminAnnouncements.map(function(a) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><strong>' + a.title + '</strong><span>' + a.body + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-edit" onclick="adminEditAnnouncement(' + a.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteAnnouncement(' + a.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('') || '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No announcements.</p>';
}

async function adminAddAnnouncement() {
    var title = document.getElementById('adm-ann-title').value.trim();
    var body = document.getElementById('adm-ann-body').value.trim();
    if (!title || !body) { showToast('Fill both announcement fields.', 'error'); return; }
    try {
        await apiPost('announcements.php', { title: title, body: body });
        adminAnnouncements = await apiGet('announcements.php');
        syncAnnouncementsList(); renderAdminAnnouncements();
        clearAnnouncementForm();
        showToast('Announcement added!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminEditAnnouncement(id) {
    var a = adminAnnouncements.find(function(x) { return x.id == id; });
    if (!a) return;
    editingAnnouncementIndex = id;
    document.getElementById('adm-ann-title').value = a.title;
    document.getElementById('adm-ann-body').value = a.body;
    document.getElementById('adm-ann-btn').style.display = 'none';
    document.getElementById('adm-ann-update-btn').style.display = 'inline-flex';
    document.getElementById('adm-ann-cancel-btn').style.display = 'inline-flex';
}

async function adminUpdateAnnouncement() {
    if (editingAnnouncementIndex < 0) return;
    var title = document.getElementById('adm-ann-title').value.trim();
    var body = document.getElementById('adm-ann-body').value.trim();
    if (!title || !body) { showToast('Fill both announcement fields.', 'error'); return; }
    try {
        await apiPut('announcements.php', { id: editingAnnouncementIndex, title: title, body: body });
        adminAnnouncements = await apiGet('announcements.php');
        adminCancelAnnouncement();
        syncAnnouncementsList(); renderAdminAnnouncements();
        showToast('Announcement updated!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminCancelAnnouncement() {
    editingAnnouncementIndex = -1;
    clearAnnouncementForm();
    document.getElementById('adm-ann-btn').style.display = 'inline-flex';
    document.getElementById('adm-ann-update-btn').style.display = 'none';
    document.getElementById('adm-ann-cancel-btn').style.display = 'none';
}

function clearAnnouncementForm() {
    document.getElementById('adm-ann-title').value = '';
    document.getElementById('adm-ann-body').value = '';
}

async function adminDeleteAnnouncement(id) {
    if (!confirm('Delete this announcement?')) return;
    try {
        await apiDelete('announcements.php', { id: id });
        adminAnnouncements = await apiGet('announcements.php');
        syncAnnouncementsList(); renderAdminAnnouncements();
        showToast('Announcement deleted.', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

// ============================================================
// ADMIN: LEADERS
// ============================================================
function renderAdminLeaders() {
    var list = document.getElementById('adm-leaders-list');
    list.innerHTML = adminLeaders.map(function(l) {
        var photoTag = l.photo ? '<i class="fas fa-camera" style="color:#005B96;margin-right:4px;"></i>' : '';
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info">' + photoTag + '<strong>' + l.name + ' &mdash; ' + l.role + '</strong><span>' + l.description + '</span></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-edit" onclick="adminEditLeader(' + l.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteLeader(' + l.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('') || '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No leaders.</p>';
}

async function previewAdminLeaderPhoto(input) {
    if (input.files && input.files[0]) {
        try {
            var res = await apiUpload(input.files[0]);
            if (res.success) {
                tempLeaderPhoto = res.url;
                var preview = document.getElementById('adm-ldr-preview');
                preview.src = tempLeaderPhoto;
                preview.style.display = 'block';
            }
        } catch(e) { showToast(getBackendErrorMessage(e, 'Upload failed'), 'error'); }
    }
}

async function adminAddLeader() {
    var name = document.getElementById('adm-ldr-name').value.trim();
    var role = document.getElementById('adm-ldr-role').value.trim();
    var desc = document.getElementById('adm-ldr-desc').value.trim();
    var icon = document.getElementById('adm-ldr-icon').value.trim() || 'fa-user';
    if (!name || !role || !desc) { showToast('Fill name, role, and description.', 'error'); return; }
    try {
        await apiPost('leaders.php', { name: name, role: role, description: desc, icon: icon, photo: tempLeaderPhoto });
        adminLeaders = await apiGet('leaders.php');
        syncLeadersGrid(); renderAdminLeaders();
        clearLeaderForm();
        showToast('Leader added!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminEditLeader(id) {
    var l = adminLeaders.find(function(x) { return x.id == id; });
    if (!l) return;
    editingLeaderIndex = id;
    document.getElementById('adm-ldr-name').value = l.name;
    document.getElementById('adm-ldr-role').value = l.role;
    document.getElementById('adm-ldr-desc').value = l.description;
    document.getElementById('adm-ldr-icon').value = l.icon || 'fa-user';
    tempLeaderPhoto = l.photo;
    var preview = document.getElementById('adm-ldr-preview');
    if (l.photo) { preview.src = l.photo; preview.style.display = 'block'; }
    else { preview.src = ''; preview.style.display = 'none'; }
    document.getElementById('adm-ldr-btn').style.display = 'none';
    document.getElementById('adm-ldr-update-btn').style.display = 'inline-flex';
    document.getElementById('adm-ldr-cancel-btn').style.display = 'inline-flex';
}

async function adminUpdateLeader() {
    if (editingLeaderIndex < 0) return;
    var name = document.getElementById('adm-ldr-name').value.trim();
    var role = document.getElementById('adm-ldr-role').value.trim();
    var desc = document.getElementById('adm-ldr-desc').value.trim();
    var icon = document.getElementById('adm-ldr-icon').value.trim() || 'fa-user';
    if (!name || !role || !desc) { showToast('Fill name, role, and description.', 'error'); return; }
    try {
        await apiPut('leaders.php', { id: editingLeaderIndex, name: name, role: role, description: desc, icon: icon, photo: tempLeaderPhoto });
        adminLeaders = await apiGet('leaders.php');
        adminCancelLeader();
        syncLeadersGrid(); renderAdminLeaders();
        showToast('Leader updated!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminCancelLeader() {
    editingLeaderIndex = -1;
    clearLeaderForm();
    document.getElementById('adm-ldr-btn').style.display = 'inline-flex';
    document.getElementById('adm-ldr-update-btn').style.display = 'none';
    document.getElementById('adm-ldr-cancel-btn').style.display = 'none';
}

function clearLeaderForm() {
    document.getElementById('adm-ldr-name').value = '';
    document.getElementById('adm-ldr-role').value = '';
    document.getElementById('adm-ldr-desc').value = '';
    document.getElementById('adm-ldr-icon').value = '';
    document.getElementById('adm-ldr-photo').value = '';
    document.getElementById('adm-ldr-preview').src = '';
    document.getElementById('adm-ldr-preview').style.display = 'none';
    tempLeaderPhoto = null;
}

async function adminDeleteLeader(id) {
    if (!confirm('Remove this leader?')) return;
    try {
        await apiDelete('leaders.php', { id: id });
        adminLeaders = await apiGet('leaders.php');
        syncLeadersGrid(); renderAdminLeaders();
        showToast('Leader removed.', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

// ============================================================
// ADMIN: GALLERY
// ============================================================
function renderAdminGallery() {
    var list = document.getElementById('adm-gallery-list');
    if (adminGallery.length === 0) { list.innerHTML = '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No gallery images yet.</p>'; return; }
    list.innerHTML = adminGallery.map(function(g) {
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info"><i class="fas fa-image" style="color:#005B96;margin-right:4px;"></i><strong>' + (g.title || 'Untitled') + '</strong></div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-edit" onclick="adminEditGallery(' + g.id + ')" title="Edit"><i class="fas fa-edit"></i></button>' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteGallery(' + g.id + ')" title="Delete"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('');
}

async function previewAdminGalleryImage(input) {
    if (input.files && input.files[0]) {
        try {
            var res = await apiUpload(input.files[0]);
            if (res.success) {
                tempGalleryImage = res.url;
                var preview = document.getElementById('adm-gal-preview');
                preview.src = tempGalleryImage;
                preview.style.display = 'block';
            }
        } catch(e) { showToast(getBackendErrorMessage(e, 'Upload failed'), 'error'); }
    }
}

async function adminAddGallery() {
    var title = document.getElementById('adm-gal-title').value.trim();
    if (!tempGalleryImage) { showToast('Select an image file first.', 'error'); return; }
    try {
        await apiPost('gallery.php', { title: title, image: tempGalleryImage });
        adminGallery = await apiGet('gallery.php');
        syncGalleryGrid(); renderAdminGallery();
        clearGalleryForm();
        showToast('Gallery image added!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminEditGallery(id) {
    var g = adminGallery.find(function(x) { return x.id == id; });
    if (!g) return;
    editingGalleryIndex = id;
    document.getElementById('adm-gal-title').value = g.title || '';
    tempGalleryImage = g.image;
    var preview = document.getElementById('adm-gal-preview');
    if (g.image) { preview.src = g.image; preview.style.display = 'block'; }
    else { preview.src = ''; preview.style.display = 'none'; }
    document.getElementById('adm-gal-btn').style.display = 'none';
    document.getElementById('adm-gal-update-btn').style.display = 'inline-flex';
    document.getElementById('adm-gal-cancel-btn').style.display = 'inline-flex';
}

async function adminUpdateGallery() {
    if (editingGalleryIndex < 0) return;
    var title = document.getElementById('adm-gal-title').value.trim();
    if (!tempGalleryImage) { showToast('Select an image file.', 'error'); return; }
    try {
        await apiPut('gallery.php', { id: editingGalleryIndex, title: title, image: tempGalleryImage });
        adminGallery = await apiGet('gallery.php');
        adminCancelGallery();
        syncGalleryGrid(); renderAdminGallery();
        showToast('Gallery image updated!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

function adminCancelGallery() {
    editingGalleryIndex = -1;
    clearGalleryForm();
    document.getElementById('adm-gal-btn').style.display = 'inline-flex';
    document.getElementById('adm-gal-update-btn').style.display = 'none';
    document.getElementById('adm-gal-cancel-btn').style.display = 'none';
}

function clearGalleryForm() {
    document.getElementById('adm-gal-title').value = '';
    document.getElementById('adm-gal-file').value = '';
    document.getElementById('adm-gal-preview').src = '';
    document.getElementById('adm-gal-preview').style.display = 'none';
    tempGalleryImage = null;
}

async function adminDeleteGallery(id) {
    if (!confirm('Delete this gallery image?')) return;
    try {
        await apiDelete('gallery.php', { id: id });
        adminGallery = await apiGet('gallery.php');
        syncGalleryGrid(); renderAdminGallery();
        showToast('Gallery image deleted.', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

// ============================================================
// ADMIN: SITE INFO + RESET
// ============================================================
async function previewAdminLogo(input) {
    if (input.files && input.files[0]) {
        try {
            var res = await apiUpload(input.files[0]);
            if (res.success) {
                tempLogoImage = res.url;
                var preview = document.getElementById('adm-logo-preview');
                preview.src = tempLogoImage;
                preview.style.display = 'block';
            }
        } catch(e) { showToast(getBackendErrorMessage(e, 'Upload failed'), 'error'); }
    }
}

async function adminSaveSiteInfo() {
    var title = document.getElementById('adm-site-title').value.trim();
    var tagline = document.getElementById('adm-site-tagline').value.trim();
    var welcome = document.getElementById('adm-site-welcome').value.trim();
    var logoPath = document.getElementById('adm-site-logo').value.trim();
    var missionText = document.getElementById('adm-site-mission').value.trim();
    var footer = document.getElementById('adm-site-footer').value.trim();
    
    var payload = {};
    if (title) payload.title = title;
    if (tagline) payload.tagline = tagline;
    if (welcome) payload.welcome = welcome;
    if (logoPath) payload.logo = logoPath;
    if (tempLogoImage) payload.logo_file = tempLogoImage;
    if (missionText) payload.mission = missionText.split('\n').map(function(s) { return s.trim(); }).filter(function(s) { return s; });
    if (footer) payload.footer = footer;
    
    try {
        await apiPut('site-info.php', payload);
        siteInfo = await apiGet('site-info.php');
        syncSiteInfo(); syncMission();
        showToast('Site info updated!', 'success');
    } catch(e) { showToast(getBackendErrorMessage(e, 'Error'), 'error'); }
}

async function adminResetAll() {
    if (!confirm('WARNING: This will reset ALL content to the original defaults. Continue?')) return;
    try {
        await apiPost('reset.php', {});
        await loadAllData();
        showToast('All data reset to defaults.', 'success');
    } catch(e) {
        showToast(getBackendErrorMessage(e, 'Reset not available'), 'error');
    }
}

// ============================================================
// ADMIN: MESSAGES
// ============================================================
function renderAdminMessages() {
    var list = document.getElementById('adm-messages-list');
    if (!list) return;
    if (adminMessages.length === 0) { 
        list.innerHTML = '<p style="color:#888; font-size:0.9rem; padding:10px 0;">No messages received yet.</p>'; 
        return; 
    }
    list.innerHTML = adminMessages.map(function(m) {
        var displayDate = m.created_at || '';
        if (m.created_at && m.created_at.indexOf(' ') !== -1) {
            var parts = m.created_at.split(' ');
            displayDate = formatDate(parts[0]) + ' ' + parts[1];
        }
        return '<div class="admin-list-item">' +
            '<div class="admin-item-info">' +
            '<strong>' + m.name + ' (' + m.email + ')</strong>' +
            '<span style="display:block; margin: 4px 0; color:#333; font-size:0.9rem; font-weight:normal;">' + m.message + '</span>' +
            '<span>Sent on: ' + displayDate + '</span>' +
            '</div>' +
            '<div class="admin-item-actions">' +
            '<button class="btn btn-sm btn-delete" onclick="adminDeleteMessage(' + m.id + ')" title="Delete Message"><i class="fas fa-trash-alt"></i></button>' +
            '</div></div>';
    }).join('');
}

async function adminDeleteMessage(id) {
    if (!confirm('Delete this message?')) return;
    try {
        await apiDelete('messages.php', { id: id });
        adminMessages = await apiGet('messages.php');
        renderAdminMessages();
        showToast('Message deleted.', 'success');
    } catch(e) {
        showToast(getBackendErrorMessage(e, 'Error'), 'error');
    }
}

// ============================================================
// INITIALIZATION
// ============================================================
async function init() {
    backendConnected = await checkBackendConnection();
    if (!backendConnected) {
        showToast('Backend not connected. Loading default content only. Run init.php after setting up the server.', 'error');
    }
    await loadAllData();
}

// Auto-load data from database when the page starts
init();
