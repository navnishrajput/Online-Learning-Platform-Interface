/* assets/js/script.js */

document.addEventListener('DOMContentLoaded', () => {
    // Determine the current page for specific logic
    const path = window.location.pathname;
    const isLoginPage = path.includes('login.html');
    const isSignupPage = path.includes('signup.html');
    const isLandingPage = path.includes('index.html');
    const isProtectedPage = path.includes('dashboard.html') || path.includes('course-detail.html') || path.includes('instructor-profile.html') || path.includes('enrollment-form.html') || path.includes('new-enrollment-form.html');

    // --- Validation Functions ---

    /**
     * Validates if a field is not empty after trimming.
     * @param {string} value
     * @returns {boolean}
     */
    function isRequired(value) {
        return value.trim() !== '';
    }

    /**
     * Validates email format using regex.
     * @param {string} email
     * @returns {boolean}
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validates password length (6-8 characters).
     * @param {string} password
     * @returns {boolean}
     */
    function isValidPassword(password) {
        return password.length >= 6 && password.length <= 8;
    }

    /**
     * Checks if passwords match.
     * @param {string} password
     * @param {string} confirmPassword
     * @returns {boolean}
     */
    function passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    }

    // --- Core Functions ---

    /**
     * Stores user data using JSON Server API (POST to /users).
     * @param {object} userData - { name, email, password }
     * @returns {Promise}
     */
    async function storeUser(userData) {
        try {
            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            if (!response.ok) {
                throw new Error('Failed to store user');
            }
            return await response.json();
        } catch (error) {
            console.error('Error storing user:', error);
            throw error;
        }
    }

    /**
     * Retrieves user data using JSON Server API (GET from /users?email=...).
     * @param {string} email
     * @returns {Promise<object|null>}
     */
    async function getUser(email) {
        try {
            const response = await fetch(`http://localhost:3000/users?email=${encodeURIComponent(email)}`);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            const users = await response.json();
            return users.length > 0 ? users[0] : null;
        } catch (error) {
            console.error('Error fetching user:', error);
            return null;
        }
    }

    /**
     * Sets the currently logged-in user session.
     * @param {string} email
     */
    function setSession(email) {
        localStorage.setItem('loggedInUserEmail', email);
        localStorage.setItem('loggedIn', 'true');
    }

    /**
     * Gets the currently logged-in user's email.
     * @returns {string|null}
     */
    function getSessionEmail() {
        return localStorage.getItem('loggedInUserEmail');
    }

    /**
     * Checks if user is logged in.
     * @returns {boolean}
     */
    function isLoggedIn() {
        return localStorage.getItem('loggedIn') === 'true';
    }

    /**
     * Clears the current user session and redirects to the landing page.
     */
    function logout() {
        localStorage.removeItem('loggedInUserEmail');
        localStorage.removeItem('loggedIn');
        window.location.href = 'index.html';
    }

    // --- Navigation Control ---
    // Control navigation links based on login status
    const navLinks = document.querySelectorAll('nav ul li a');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href && (href.includes('dashboard.html') || href.includes('course-detail.html') || href.includes('instructor-profile.html') || href.includes('enrollment-form.html') || href.includes('new-enrollment-form.html'))) {
            if (!isLoggedIn()) {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    alert('You must be logged in to access this page.');
                    window.location.href = 'login.html';
                });
            }
        }
        // Hide logout link if not logged in
        if (href && href.includes('#') && link.textContent.toLowerCase().includes('logout')) {
            if (!isLoggedIn()) {
                link.style.display = 'none';
            }
        }
    });


    // --- Authentication Logic ---

    if (isSignupPage) {
        const signupForm = document.getElementById('signupForm');
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            const confirmPassword = document.getElementById('confirmPassword').value.trim();
            const errorMessage = document.getElementById('signupError');

            errorMessage.textContent = ''; // Clear previous errors

            // Validate required fields
            if (!isRequired(name)) {
                errorMessage.textContent = 'Name is required.';
                return;
            }
            if (!isRequired(email)) {
                errorMessage.textContent = 'Email is required.';
                return;
            }
            if (!isRequired(password)) {
                errorMessage.textContent = 'Password is required.';
                return;
            }
            if (!isRequired(confirmPassword)) {
                errorMessage.textContent = 'Confirm Password is required.';
                return;
            }

            // Validate email format
            if (!isValidEmail(email)) {
                errorMessage.textContent = 'Please enter a valid email address.';
                return;
            }

            // Validate password length
            if (!isValidPassword(password)) {
                errorMessage.textContent = 'Password must be 6-8 characters long.';
                return;
            }

            // Check if passwords match
            if (!passwordsMatch(password, confirmPassword)) {
                errorMessage.textContent = 'Passwords do not match.';
                return;
            }

            // Check if email is already registered
            const existingUser = await getUser(email);
            if (existingUser) {
                errorMessage.textContent = 'Email is already registered. Try logging in.';
                return;
            }

            const newUser = { name, email, password };
            try {
                await storeUser(newUser);
                alert('Registration successful! Please log in.');
                window.location.href = 'login.html';
            } catch (error) {
                errorMessage.textContent = 'Registration failed. Please try again.';
            }
        });
    }

    if (isLoginPage) {
        const loginForm = document.getElementById('loginForm');
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();
            const errorMessage = document.getElementById('loginError');

            errorMessage.textContent = ''; // Clear previous errors

            // Validate required fields
            if (!isRequired(email)) {
                errorMessage.textContent = 'Email is required.';
                return;
            }
            if (!isRequired(password)) {
                errorMessage.textContent = 'Password is required.';
                return;
            }

            // Validate email format
            if (!isValidEmail(email)) {
                errorMessage.textContent = 'Please enter a valid email address.';
                return;
            }

            const user = await getUser(email);

            if (!user) {
                errorMessage.textContent = 'User not found. Please sign up.';
                return;
            }

            if (user.password !== password) {
                errorMessage.textContent = 'Invalid email or password.';
                return;
            }

            setSession(user.email);
            alert('Login successful!');
            window.location.href = 'dashboard.html'; // Redirect to dashboard
        });
    }

    // --- Protected Page Check (e.g., Dashboard) ---
    if (isProtectedPage) {
        const loggedInEmail = getSessionEmail();
        if (!loggedInEmail) {
            alert('You must be logged in to view the dashboard.');
            window.location.href = 'login.html';
            return;
        }

        (async () => {
            const user = await getUser(loggedInEmail);
            if (user) {
                // Personalize the dashboard welcome message
                const welcomeHeader = document.querySelector('.welcome-message h1');
                if (welcomeHeader) {
                    welcomeHeader.textContent = `Welcome back, ${user.name}!`;
                }
                // Update profile pic initials
                const profilePic = document.querySelector('.profile-pic');
                if (profilePic) {
                    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
                    profilePic.textContent = initials;
                }
            }
        })();
    }
    
    // --- Global Logout Button Event Listener ---
    document.querySelectorAll('.logout-link').forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                logout();
            }
        });
    });

    // Add more features here (e.g., enhanced form validation for enrollment-form, etc.)

});