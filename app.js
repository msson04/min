// Application state (using in-memory storage due to sandbox limitations)
let appState = {
    isLoggedIn: false,
    currentPassword: btoa('admin'), // Initial password hashed
    loginAttempts: 0,
    lockoutTime: 0,
    currentPage: 'home'
};

// Security configuration
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

// DOM elements
const loginPage = document.getElementById('login-page');
const mainApp = document.getElementById('main-app');
const loginForm = document.getElementById('login-form');
const passwordInput = document.getElementById('password');
const loginError = document.getElementById('login-error');
const lockoutMessage = document.getElementById('lockout-message');
const attemptsCount = document.getElementById('attempts-count');
const logoutBtn = document.getElementById('logout-btn');
const navLinks = document.querySelectorAll('.nav-link');
const contentPages = document.querySelectorAll('.content-page');
const changePasswordForm = document.getElementById('change-password-form');
const contactForm = document.getElementById('contact-form');

// Utility functions
function sanitizeInput(input) {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

function showError(element, message) {
    element.textContent = sanitizeInput(message);
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function showSuccess(element, message) {
    element.textContent = sanitizeInput(message);
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function updateAttemptsDisplay() {
    attemptsCount.textContent = appState.loginAttempts;
}

function isLockedOut() {
    if (appState.lockoutTime > 0) {
        const timeRemaining = appState.lockoutTime - Date.now();
        return timeRemaining > 0;
    }
    return false;
}

function getRemainingLockoutTime() {
    const remaining = Math.ceil((appState.lockoutTime - Date.now()) / 1000);
    return Math.max(0, remaining);
}

function showLockoutMessage() {
    const remaining = getRemainingLockoutTime();
    if (remaining > 0) {
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        lockoutMessage.textContent = `너무 많은 로그인 시도로 인해 계정이 잠겼습니다. ${minutes}분 ${seconds}초 후 다시 시도해주세요.`;
        lockoutMessage.style.display = 'block';
        
        // Update countdown every second
        const countdown = setInterval(() => {
            const newRemaining = getRemainingLockoutTime();
            if (newRemaining <= 0) {
                clearInterval(countdown);
                lockoutMessage.style.display = 'none';
                appState.loginAttempts = 0;
                appState.lockoutTime = 0;
                updateAttemptsDisplay();
                return;
            }
            
            const newMinutes = Math.floor(newRemaining / 60);
            const newSeconds = newRemaining % 60;
            lockoutMessage.textContent = `너무 많은 로그인 시도로 인해 계정이 잠겼습니다. ${newMinutes}분 ${newSeconds}초 후 다시 시도해주세요.`;
        }, 1000);
    }
}

// Authentication functions
function login(password) {
    if (isLockedOut()) {
        showLockoutMessage();
        return false;
    }

    if (!password || password.trim() === '') {
        showError(loginError, '비밀번호를 입력해주세요.');
        return false;
    }

    const hashedPassword = btoa(password.trim());
    
    if (hashedPassword === appState.currentPassword) {
        appState.isLoggedIn = true;
        appState.loginAttempts = 0;
        appState.lockoutTime = 0;
        showMainApp();
        return true;
    } else {
        appState.loginAttempts++;
        updateAttemptsDisplay();
        
        if (appState.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
            appState.lockoutTime = Date.now() + LOCKOUT_DURATION;
            showLockoutMessage();
        } else {
            const remaining = MAX_LOGIN_ATTEMPTS - appState.loginAttempts;
            showError(loginError, `비밀번호가 올바르지 않습니다. ${remaining}회 더 시도할 수 있습니다.`);
        }
        
        return false;
    }
}

function logout() {
    appState.isLoggedIn = false;
    appState.currentPage = 'home';
    showLoginPage();
}

function changePassword(currentPassword, newPassword) {
    if (!currentPassword || !newPassword) {
        return { success: false, message: '모든 필드를 입력해주세요.' };
    }

    if (currentPassword.trim() === '' || newPassword.trim() === '') {
        return { success: false, message: '비밀번호는 공백일 수 없습니다.' };
    }

    const hashedCurrentPassword = btoa(currentPassword.trim());
    
    if (hashedCurrentPassword !== appState.currentPassword) {
        return { success: false, message: '현재 비밀번호가 올바르지 않습니다.' };
    }

    if (newPassword.trim().length < 3) {
        return { success: false, message: '새 비밀번호는 최소 3자 이상이어야 합니다.' };
    }

    appState.currentPassword = btoa(newPassword.trim());
    return { success: true, message: '비밀번호가 성공적으로 변경되었습니다.' };
}

// UI functions
function showLoginPage() {
    loginPage.classList.add('active');
    mainApp.classList.remove('active');
    passwordInput.value = '';
    loginError.style.display = 'none';
    lockoutMessage.style.display = 'none';
    
    // Check if still locked out
    if (isLockedOut()) {
        showLockoutMessage();
    }
}

function showMainApp() {
    loginPage.classList.remove('active');
    mainApp.classList.add('active');
    showPage(appState.currentPage);
}

function showPage(pageId) {
    // Hide all content pages
    contentPages.forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = pageId;
    }
    
    // Update navigation
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === pageId) {
            link.classList.add('active');
        }
    });
}

// Event listeners
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const password = passwordInput.value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    // Simulate network delay for better UX
    setTimeout(() => {
        login(password);
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 500);
});

logoutBtn.addEventListener('click', () => {
    logout();
});

// Navigation event listeners
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageId = link.dataset.page;
        if (pageId) {
            showPage(pageId);
        }
    });
});

// Change password form
changePasswordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorElement = document.getElementById('password-error');
    const successElement = document.getElementById('password-success');
    
    // Clear previous messages
    errorElement.style.display = 'none';
    successElement.style.display = 'none';
    
    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
        showError(errorElement, '모든 필드를 입력해주세요.');
        return;
    }
    
    if (currentPassword.trim() === '' || newPassword.trim() === '' || confirmPassword.trim() === '') {
        showError(errorElement, '비밀번호는 공백일 수 없습니다.');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showError(errorElement, '새 비밀번호가 일치하지 않습니다.');
        return;
    }
    
    if (newPassword.length < 3) {
        showError(errorElement, '새 비밀번호는 최소 3자 이상이어야 합니다.');
        return;
    }
    
    // Attempt password change
    const result = changePassword(currentPassword, newPassword);
    
    if (result.success) {
        showSuccess(successElement, result.message);
        changePasswordForm.reset();
    } else {
        showError(errorElement, result.message);
    }
});

// Contact form
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    
    // Validate inputs
    if (!name || !email || !message) {
        alert('모든 필드를 입력해주세요.');
        return;
    }
    
    if (name.trim() === '' || email.trim() === '' || message.trim() === '') {
        alert('모든 필드를 올바르게 입력해주세요.');
        return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('올바른 이메일 주소를 입력해주세요.');
        return;
    }
    
    // Simulate sending message
    alert('메시지가 전송되었습니다! 빠른 시일 내에 답변드리겠습니다.');
    contactForm.reset();
});

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    updateAttemptsDisplay();
    
    // Check if user should be logged in (in real app, this would check localStorage)
    if (appState.isLoggedIn) {
        showMainApp();
    } else {
        showLoginPage();
    }
    
    // Add fade-in animations
    const animatedElements = document.querySelectorAll('.card, .skill-card, .project-card');
    animatedElements.forEach(element => {
        element.classList.add('fade-in');
    });
    
    // Trigger animations
    setTimeout(() => {
        animatedElements.forEach(element => {
            element.classList.add('active');
        });
    }, 100);
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Escape key to logout (when logged in)
    if (e.key === 'Escape' && appState.isLoggedIn) {
        logout();
    }
    
    // Enter key on login page
    if (e.key === 'Enter' && !appState.isLoggedIn) {
        const activeElement = document.activeElement;
        if (activeElement === passwordInput) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

// Security: Clear sensitive data on page unload
window.addEventListener('beforeunload', () => {
    // In a real application, you might want to clear sensitive data
    // For demo purposes, we'll keep the state
});

// Auto-logout after inactivity (optional security feature)
let inactivityTimer;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    if (appState.isLoggedIn) {
        inactivityTimer = setTimeout(() => {
            alert('비활성 상태로 인해 자동 로그아웃됩니다.');
            logout();
        }, INACTIVITY_TIMEOUT);
    }
}

// Track user activity
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetInactivityTimer, true);
});

// Input sanitization for XSS prevention
function sanitizeAllInputs() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('input', (e) => {
            // Remove potentially dangerous characters
            const value = e.target.value;
            const sanitized = value.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
            if (sanitized !== value) {
                e.target.value = sanitized;
            }
        });
    });
}

// Initialize input sanitization
sanitizeAllInputs();