// ============ FORM VALIDATION ============

const validators = {
    email: (value) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },
    password: (value) => {
        return value.length >= 8;
    },
    name: (value) => {
        return value.trim().length >= 2;
    },
    businessName: (value) => {
        return value.trim().length >= 3;
    }
};

const errorMessages = {
    emailInvalid: 'Please enter a valid email address',
    passwordShort: 'Password must be at least 8 characters long',
    nameShort: 'Name must be at least 2 characters long',
    businessNameShort: 'Business name must be at least 3 characters long',
    passwordMismatch: 'Passwords do not match',
    emailExists: 'This email is already registered'
};

// ============ LOCAL STORAGE MANAGEMENT ============

const StorageManager = {
    getUsers() {
        const users = localStorage.getItem('businessPortal_users');
        return users ? JSON.parse(users) : {};
    },

    saveUser(email, userData) {
        const users = this.getUsers();
        users[email.toLowerCase()] = userData;
        localStorage.setItem('businessPortal_users', JSON.stringify(users));
    },

    userExists(email) {
        const users = this.getUsers();
        return email.toLowerCase() in users;
    },

    getUser(email) {
        const users = this.getUsers();
        return users[email.toLowerCase()];
    },

    getCurrentUser() {
        const currentUser = localStorage.getItem('businessPortal_currentUser');
        return currentUser ? JSON.parse(currentUser) : null;
    },

    setCurrentUser(userEmail) {
        const user = this.getUser(userEmail);
        if (user) {
            localStorage.setItem('businessPortal_currentUser', JSON.stringify(user));
            return true;
        }
        return false;
    },

    logout() {
        localStorage.removeItem('businessPortal_currentUser');
    }
};

// ============ FORM HANDLING ============

function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorId = fieldId + 'Error';
    const errorElement = document.getElementById(errorId);
    
    if (field) field.classList.remove('error');
    if (errorElement) errorElement.textContent = '';
}

function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorId = fieldId + 'Error';
    const errorElement = document.getElementById(errorId);
    
    if (field) field.classList.add('error');
    if (errorElement) errorElement.textContent = message;
}

function validateLoginForm() {
    let isValid = true;
    
    clearFieldError('loginEmail');
    clearFieldError('loginPassword');
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!email) {
        setFieldError('loginEmail', 'Email is required');
        isValid = false;
    } else if (!validators.email(email)) {
        setFieldError('loginEmail', errorMessages.emailInvalid);
        isValid = false;
    }
    
    if (!password) {
        setFieldError('loginPassword', 'Password is required');
        isValid = false;
    }
    
    return isValid ? { email, password } : null;
}

function validateRegisterForm() {
    let isValid = true;
    
    // Clear all errors
    clearFieldError('regFirstName');
    clearFieldError('regLastName');
    clearFieldError('regEmail');
    clearFieldError('regBusinessName');
    clearFieldError('regPassword');
    clearFieldError('regConfirmPassword');
    
    const firstName = document.getElementById('regFirstName').value.trim();
    const lastName = document.getElementById('regLastName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const businessName = document.getElementById('regBusinessName').value.trim();
    const password = document.getElementById('regPassword').value;
    const confirmPassword = document.getElementById('regConfirmPassword').value;
    
    // Validate First Name
    if (!firstName) {
        setFieldError('regFirstName', 'First name is required');
        isValid = false;
    } else if (!validators.name(firstName)) {
        setFieldError('regFirstName', errorMessages.nameShort);
        isValid = false;
    }
    
    // Validate Last Name
    if (!lastName) {
        setFieldError('regLastName', 'Last name is required');
        isValid = false;
    } else if (!validators.name(lastName)) {
        setFieldError('regLastName', errorMessages.nameShort);
        isValid = false;
    }
    
    // Validate Email
    if (!email) {
        setFieldError('regEmail', 'Email is required');
        isValid = false;
    } else if (!validators.email(email)) {
        setFieldError('regEmail', errorMessages.emailInvalid);
        isValid = false;
    } else if (StorageManager.userExists(email)) {
        setFieldError('regEmail', errorMessages.emailExists);
        isValid = false;
    }
    
    // Validate Business Name
    if (!businessName) {
        setFieldError('regBusinessName', 'Business name is required');
        isValid = false;
    } else if (!validators.businessName(businessName)) {
        setFieldError('regBusinessName', errorMessages.businessNameShort);
        isValid = false;
    }
    
    // Validate Password
    if (!password) {
        setFieldError('regPassword', 'Password is required');
        isValid = false;
    } else if (!validators.password(password)) {
        setFieldError('regPassword', errorMessages.passwordShort);
        isValid = false;
    }
    
    // Validate Confirm Password
    if (!confirmPassword) {
        setFieldError('regConfirmPassword', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        setFieldError('regConfirmPassword', errorMessages.passwordMismatch);
        isValid = false;
    }
    
    if (!isValid) return null;
    
    return { firstName, lastName, email, businessName, password };
}

// ============ AUTH EVENTS ============

function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update forms
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    
    if (tabName === 'login') {
        document.getElementById('loginForm').classList.add('active');
        document.getElementById('loginForm').reset();
        document.getElementById('loginFormError').textContent = '';
    } else {
        document.getElementById('registerForm').classList.add('active');
        document.getElementById('registerForm').reset();
        document.getElementById('registerFormError').textContent = '';
    }
    
    // Clear all field errors
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = validateLoginForm();
    if (!formData) return;
    
    const user = StorageManager.getUser(formData.email);
    
    if (!user) {
        document.getElementById('loginFormError').textContent = 'User not found. Please register first.';
        return;
    }
    
    if (user.password !== formData.password) {
        document.getElementById('loginFormError').textContent = 'Incorrect password. Please try again.';
        return;
    }
    
    // Successful login
    document.getElementById('loginSuccess').textContent = 'Login successful! Redirecting...';
    
    StorageManager.setCurrentUser(formData.email);
    
    setTimeout(() => {
        showDashboard();
    }, 500);
});

document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = validateRegisterForm();
    if (!formData) return;
    
    const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        businessName: formData.businessName,
        password: formData.password,
        registrationDate: new Date().toLocaleDateString(),
        documents: [],
        status: 'Active'
    };
    
    StorageManager.saveUser(formData.email, userData);
    
    document.getElementById('registerSuccess').textContent = 'Account created successfully! Logging in...';
    
    setTimeout(() => {
        StorageManager.setCurrentUser(formData.email);
        showDashboard();
    }, 500);
});

// ============ DASHBOARD FUNCTIONS ============

function showDashboard() {
    document.getElementById('authPage').style.display = 'none';
    document.getElementById('dashboardPage').style.display = 'flex';
    
    const currentUser = StorageManager.getCurrentUser();
    if (currentUser) {
        updateDashboardWithUserData(currentUser);
    }
}

function updateDashboardWithUserData(user) {
    // Update greeting
    document.getElementById('userGreeting').textContent = `Welcome, ${user.firstName}!`;
    
    // Update profile information
    document.getElementById('displayFirstName').textContent = user.firstName;
    document.getElementById('displayLastName').textContent = user.lastName;
    document.getElementById('displayEmail').textContent = user.email;
    document.getElementById('displayBusinessName').textContent = user.businessName;
    document.getElementById('registrationDate').textContent = user.registrationDate;
    
    // Update stats
    document.getElementById('docCount').textContent = user.documents ? user.documents.length : 0;
    
    // Load documents
    loadUserDocuments(user);
}

function loadUserDocuments(user) {
    const docsList = document.getElementById('docsList');
    docsList.innerHTML = '';
    
    if (!user.documents || user.documents.length === 0) {
        docsList.innerHTML = '<p class="empty-state">No documents uploaded yet.</p>';
        return;
    }
    
    user.documents.forEach((doc, index) => {
        const docItem = document.createElement('div');
        docItem.className = 'doc-item';
        docItem.innerHTML = `
            <div class="doc-icon">📄</div>
            <div class="doc-name">${doc.name}</div>
            <div class="doc-type">${doc.type}</div>
            <button class="doc-delete" onclick="deleteDocument(${index})">Delete</button>
        `;
        docsList.appendChild(docItem);
    });
}

function switchDashboardTab(tabName, event) {
    event.preventDefault();
    
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    event.target.closest('.nav-item').classList.add('active');
    
    // Update tabs
    document.querySelectorAll('.dashboard-tab').forEach(tab => tab.classList.remove('active'));
    
    const tabMap = {
        'overview': ['overviewTab', 'Dashboard'],
        'registration': ['registrationTab', 'Business Registration'],
        'documents': ['documentsTab', 'Document Management'],
        'compliance': ['complianceTab', 'Compliance Management'],
        'support': ['supportTab', 'Support Resources']
    };
    
    if (tabMap[tabName]) {
        document.getElementById(tabMap[tabName][0]).classList.add('active');
        document.getElementById('pageTitle').textContent = tabMap[tabName][1];
    }
}

document.getElementById('documentForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const docType = document.getElementById('docType').value;
    const docFile = document.getElementById('docFile');
    
    // Clear previous errors
    document.getElementById('docTypeError').textContent = '';
    document.getElementById('docFileError').textContent = '';
    
    // Validate
    let isValid = true;
    if (!docType) {
        document.getElementById('docTypeError').textContent = 'Please select a document type';
        isValid = false;
    }
    
    if (!docFile.files || docFile.files.length === 0) {
        document.getElementById('docFileError').textContent = 'Please select a file to upload';
        isValid = false;
    }
    
    if (!isValid) return;
    
    // Add document to user
    const currentUser = StorageManager.getCurrentUser();
    const fileName = docFile.files[0].name;
    
    if (!currentUser.documents) {
        currentUser.documents = [];
    }
    
    currentUser.documents.push({
        name: fileName,
        type: docType,
        uploadDate: new Date().toLocaleDateString()
    });
    
    StorageManager.saveUser(currentUser.email, currentUser);
    StorageManager.setCurrentUser(currentUser.email);
    
    // Reset form and reload documents
    this.reset();
    loadUserDocuments(currentUser);
    document.getElementById('docCount').textContent = currentUser.documents.length;
    
    alert('Document uploaded successfully!');
});

function deleteDocument(index) {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    const currentUser = StorageManager.getCurrentUser();
    currentUser.documents.splice(index, 1);
    
    StorageManager.saveUser(currentUser.email, currentUser);
    StorageManager.setCurrentUser(currentUser.email);
    
    loadUserDocuments(currentUser);
    document.getElementById('docCount').textContent = currentUser.documents.length;
}

function logout() {
    if (!confirm('Are you sure you want to logout?')) return;
    
    StorageManager.logout();
    
    // Reset forms
    document.getElementById('loginForm').reset();
    document.getElementById('registerForm').reset();
    document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    document.querySelectorAll('.success-message').forEach(el => el.textContent = '');
    document.querySelectorAll('input').forEach(el => el.classList.remove('error'));
    
    // Switch to auth page
    document.getElementById('authPage').style.display = 'flex';
    document.getElementById('dashboardPage').style.display = 'none';
    
    // Reset tab to login
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-btn')[0].classList.add('active');
    document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
    document.getElementById('loginForm').classList.add('active');
}

// ============ INITIALIZE APP ============

window.addEventListener('load', function() {
    const currentUser = StorageManager.getCurrentUser();
    
    if (currentUser) {
        showDashboard();
    } else {
        document.getElementById('authPage').style.display = 'flex';
        document.getElementById('dashboardPage').style.display = 'none';
    }
});