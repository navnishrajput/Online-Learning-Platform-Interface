// auth.js - Add this script to protected pages

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = localStorage.getItem('currentUser');
    
    if (!currentUser) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Parse user data
    const user = JSON.parse(currentUser);
    
    // Update navigation
    updateNavigation();
    
    // Setup logout functionality
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Setup enrollment functionality if on course detail page
    setupEnrollmentFunctionality();
});

// Function to update navigation
function updateNavigation() {
    const nav = document.querySelector('nav ul');
    
    if (!nav) return;
    
    const currentPage = window.location.pathname.split('/').pop();
    const pageLinks = {
        'index.html': 'Home',
        'course-detail.html': 'Courses',
        'instructor-profile.html': 'Instructors',
        'dashboard.html': 'Dashboard',
        'enrollment-form.html': 'Enroll'
    };
    
    let navHTML = '';
    for (const [page, label] of Object.entries(pageLinks)) {
        const isActive = currentPage === page;
        navHTML += `<li><a href="${page}" ${isActive ? 'style="color: #77eaf9;"' : ''}>${label}</a></li>`;
    }
    
    navHTML += `<li><a href="#" id="logoutBtn" style="color: #ff6b6b;">Logout</a></li>`;
    
    nav.innerHTML = navHTML;
}

// Function to handle logout
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

// Function to setup enrollment functionality
function setupEnrollmentFunctionality() {
    // Check if we're on course-detail page
    if (window.location.pathname.includes('course-detail.html')) {
        const enrollBtn = document.querySelector('.enroll-btn');
        if (enrollBtn) {
            enrollBtn.addEventListener('click', async function(e) {
                e.preventDefault();
                
                const currentUser = JSON.parse(localStorage.getItem('currentUser'));
                const courseTitle = document.querySelector('.course-title').textContent;
                
                if (confirm(`Enroll in "${courseTitle}"?`)) {
                    try {
                        // Find course
                        const response = await fetch('http://localhost:3001/courses');
                        const courses = await response.json();
                        const course = courses.find(c => c.title === courseTitle);
                        
                        if (!course) {
                            alert('Course not found');
                            return;
                        }
                        
                        // Check if already enrolled
                        const enrollmentsResponse = await fetch(
                            `http://localhost:3001/enrollments?userId=${currentUser.id}&courseId=${course.id}`
                        );
                        const existingEnrollments = await enrollmentsResponse.json();
                        
                        if (existingEnrollments.length > 0) {
                            alert('You are already enrolled in this course!');
                            return;
                        }
                        
                        // Create enrollment
                        const enrollmentData = {
                            userId: currentUser.id,
                            courseId: course.id,
                            courseTitle: course.title,
                            enrolledAt: new Date().toISOString(),
                            progress: 0,
                            status: 'Not Started'
                        };
                        
                        const enrollResponse = await fetch('http://localhost:3001/enrollments', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify(enrollmentData)
                        });
                        
                        if (enrollResponse.ok) {
                            alert('Successfully enrolled! Check your dashboard to start learning.');
                            window.location.href = 'dashboard.html';
                        }
                        
                    } catch (error) {
                        console.error('Enrollment error:', error);
                        alert('Failed to enroll. Please try again.');
                    }
                }
            });
        }
    }
}