// Initialize Firebase
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Make sure to include the Firebase scripts before auth.js');
}

// Initialize App (Configuration should be loaded from firebase-config.js)
if (!firebase.apps.length) {
    if (typeof firebaseConfig !== 'undefined') {
        firebase.initializeApp(firebaseConfig);
    } else {
        console.error('firebaseConfig is not defined. Please check firebase-config.js');
    }
}

// --- Firestore ---
const db = firebase.firestore();

const auth = firebase.auth();

// --- DOM Elements ---
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const loginToggle = document.getElementById('login-toggle');
const signupToggle = document.getElementById('signup-toggle');
const logoutBtn = document.getElementById('logout-btn');
const userEmailSpan = document.getElementById('user-email');

// --- Auth State Observer ---
auth.onAuthStateChanged(user => {
    if (user) {
        console.log('User is signed in:', user.email);

        // If on Auth Page, redirect to Dashboard
        if (window.location.pathname.endsWith('auth.html')) {
            window.location.href = 'dashboard.html';
        }

        // If on Dashboard, show user info and handle settings
        if (window.location.pathname.endsWith('dashboard.html')) {
            const userNameElem = document.getElementById('user-name');
            const userEmailElem = document.getElementById('user-email');
            const userPhotoElem = document.getElementById('user-photo');
            const settingsNameInput = document.getElementById('settings-name');
            const settingsPhotoInput = document.getElementById('settings-photo');
            const profileForm = document.getElementById('profile-form');

            if (userEmailElem) userEmailElem.textContent = user.email;

            if (userNameElem) {
                // Use Display Name if available, otherwise "Student"
                userNameElem.textContent = user.displayName ? user.displayName : "Student";
                if (settingsNameInput) settingsNameInput.value = user.displayName ? user.displayName : "";
            }

            if (userPhotoElem) {
                // Use Photo URL if available, otherwise keep default placeholder
                if (user.photoURL) {
                    userPhotoElem.src = user.photoURL;
                    if (settingsPhotoInput) settingsPhotoInput.value = user.photoURL;
                    // Show image, hide icon
                    userPhotoElem.style.display = 'block';
                    if (userPhotoElem.nextElementSibling) userPhotoElem.nextElementSibling.style.display = 'none';
                } else {
                    // Show icon, hide image (or keep fallback)
                    userPhotoElem.style.display = 'none';
                    if (userPhotoElem.nextElementSibling) userPhotoElem.nextElementSibling.style.display = 'block';
                }
            }

            // --- UNLOCK CONTENT LOGIC ---
            const contentCards = document.querySelectorAll('.content-card');

            // Check Firestore for purchases
            db.collection('users').doc(user.uid).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const purchases = userData.purchases || []; // Array of service IDs
                    console.log("User Purchases:", purchases);

                    contentCards.forEach(card => {
                        const serviceId = card.getAttribute('data-id');
                        if (purchases.includes(serviceId)) {
                            // UNLOCK
                            card.classList.add('unlocked');

                            // Adjust buttons
                            const buyBtn = card.querySelector('.btn-buy');
                            const accessBtn = card.querySelector('.btn-access');
                            const badge = card.querySelector('.badge-access');

                            if (buyBtn) buyBtn.style.display = 'none';
                            if (accessBtn) accessBtn.style.display = 'inline-block';
                            if (badge) {
                                badge.textContent = "Purchased";
                                badge.classList.remove('badge-locked');
                            }
                        }
                    });
                } else {
                    console.log("No user document found. Creating default...");
                    // Optional: Create doc if not exists, or just leave locked
                }
            }).catch((error) => {
                console.error("Error fetching purchases:", error);
            });


            // Handle Profile Update
            if (profileForm) {
                profileForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const newName = settingsNameInput.value;
                    const newPhoto = settingsPhotoInput.value;
                    const msg = document.getElementById('profile-msg');
                    const btn = profileForm.querySelector('button');

                    btn.disabled = true;
                    btn.innerHTML = 'Saving...';
                    msg.textContent = '';

                    user.updateProfile({
                        displayName: newName,
                        photoURL: newPhoto
                    }).then(() => {
                        // Update successful.
                        msg.textContent = 'Profile updated successfully!';
                        btn.disabled = false;
                        btn.innerHTML = 'Save Changes';

                        // Update UI immediately without reload
                        if (userNameElem) userNameElem.textContent = newName;
                        if (userPhotoElem && newPhoto) {
                            userPhotoElem.src = newPhoto;
                            userPhotoElem.style.display = 'block';
                            if (userPhotoElem.nextElementSibling) userPhotoElem.nextElementSibling.style.display = 'none';
                        }
                    }).catch((error) => {
                        // An error happened.
                        console.error('Profile Update Error', error);
                        msg.style.color = 'red';
                        msg.textContent = error.message;
                        btn.disabled = false;
                        btn.innerHTML = 'Save Changes';
                    });
                });
            }
        }

    } else {
        console.log('User is signed out');

        // If on Dashboard, redirect to Auth Page (Protected Route)
        if (window.location.pathname.endsWith('dashboard.html')) {
            window.location.href = 'auth.html';
        }
    }
});

// --- UI Toggles (Auth Page) ---
if (loginToggle && signupToggle) {
    loginToggle.addEventListener('click', () => {
        loginForm.classList.add('active');
        signupForm.classList.remove('active');
        loginToggle.classList.add('active');
        signupToggle.classList.remove('active');
    });

    signupToggle.addEventListener('click', () => {
        signupForm.classList.add('active');
        loginForm.classList.remove('active');
        signupToggle.classList.add('active');
        loginToggle.classList.remove('active');
    });
}

// --- Password Visibility Toggle ---
const passwordToggles = document.querySelectorAll('.password-toggle');
passwordToggles.forEach(toggle => {
    toggle.addEventListener('click', () => {
        const inputId = toggle.getAttribute('data-target');
        const input = document.getElementById(inputId);

        if (input.type === 'password') {
            input.type = 'text';
            toggle.classList.remove('fa-eye');
            toggle.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            toggle.classList.remove('fa-eye-slash');
            toggle.classList.add('fa-eye');
        }
    });
});

// --- Forgot Password Logic ---
const forgotPassLink = document.getElementById('forgot-password-link');
const forgotPassForm = document.getElementById('forgot-password-form');
const backToLoginBtn = document.getElementById('back-to-login');

if (forgotPassLink && forgotPassForm) {
    // Show Reset Form
    forgotPassLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.classList.remove('active');
        forgotPassForm.classList.add('active');
        // Hide toggles momentarily
        if (loginToggle) loginToggle.parentElement.style.display = 'none';
    });

    // Back to Login
    backToLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        forgotPassForm.classList.remove('active');
        loginForm.classList.add('active');
        // Show toggles again
        if (loginToggle) loginToggle.parentElement.style.display = 'flex';
    });

    // Handle Reset Submit
    forgotPassForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('reset-email').value;
        const msg = document.getElementById('reset-msg');
        const errorMsg = document.getElementById('reset-error');
        const btn = forgotPassForm.querySelector('button');
        const originalText = btn.innerHTML;

        msg.textContent = '';
        errorMsg.textContent = '';
        btn.innerHTML = 'Sending...';
        btn.disabled = true;

        auth.sendPasswordResetEmail(email)
            .then(() => {
                msg.textContent = 'Password reset email sent! Check your inbox.';
                btn.innerHTML = 'Sent';
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }, 3000);
            })
            .catch((error) => {
                console.error('Reset Error:', error);
                errorMsg.textContent = formatError(error.code);
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
    });
}

// --- Login Function ---
if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        // Reset error
        errorMsg.textContent = '';
        const btn = loginForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Logging in...';
        btn.disabled = true;

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in - Redirect handled by onAuthStateChanged
            })
            .catch((error) => {
                console.error('Login Error:', error);
                errorMsg.textContent = formatError(error.code);
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
    });
}

// --- Sign Up Function ---
if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const errorMsg = document.getElementById('signup-error');

        // Reset error
        errorMsg.textContent = '';
        const btn = signupForm.querySelector('button');
        const originalText = btn.innerHTML;
        btn.innerHTML = 'Creating Account...';
        btn.disabled = true;

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up - Redirect handled by onAuthStateChanged
            })
            .catch((error) => {
                console.error('Signup Error:', error);
                errorMsg.textContent = formatError(error.code);
                btn.innerHTML = originalText;
                btn.disabled = false;
            });
    });
}

// --- Google Sign-In Logic ---
const googleProvider = new firebase.auth.GoogleAuthProvider();
const googleLoginBtn = document.getElementById('google-login-btn');
const googleSignupBtn = document.getElementById('google-signup-btn');

function handleGoogleSignIn() {
    auth.signInWithPopup(googleProvider)
        .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = firebase.auth.GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            const user = result.user;
            console.log("Google User:", user);
            // Redirect handled by onAuthStateChanged
        }).catch((error) => {
            console.error("Google Auth Error:", error);
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            const email = error.email;
            const credential = firebase.auth.GoogleAuthProvider.credentialFromError(error);
            alert("Google Sign-In Failed: " + errorMessage);
        });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', handleGoogleSignIn);
}

if (googleSignupBtn) {
    googleSignupBtn.addEventListener('click', handleGoogleSignIn);
}

// --- Logout Function ---
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'index.html'; // Redirect to home or auth
        });
    });
}


// --- Helper: Format Firebase Errors ---
function formatError(code) {
    switch (code) {
        case 'auth/email-already-in-use':
            return 'Email is already registered. Please log in.';
        case 'auth/invalid-email':
            return 'Invalid email address.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Invalid email or password.';
        default:
            return 'An error occurred. Please try again.';
    }
}
