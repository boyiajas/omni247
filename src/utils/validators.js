// Validation utilities

export const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const validatePassword = (password) => {
    // Minimum 8 characters, at least one letter and one number
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
};

export const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\+?[\d\s-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validateURL = (url) => {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
};

export const validateRequired = (value) => {
    if (typeof value === 'string') {
        return value.trim().length > 0;
    }
    return value !== null && value !== undefined;
};

export const validateMinLength = (value, minLength) => {
    if (typeof value !== 'string') return false;
    return value.length >= minLength;
};

export const validateMaxLength = (value, maxLength) => {
    if (typeof value !== 'string') return false;
    return value.length <= maxLength;
};

export const validateFileSize = (fileSize, maxSize) => {
    return fileSize <= maxSize;
};

export const validateLatitude = (lat) => {
    return typeof lat === 'number' && lat >= -90 && lat <= 90;
};

export const validateLongitude = (lng) => {
    return typeof lng === 'number' && lng >= -180 && lng <= 180;
};

export const getPasswordStrength = (password) => {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    if (strength <= 2) return 'weak';
    if (strength <= 4) return 'medium';
    return 'strong';
};

export const getFieldErrors = (fieldName, value, rules = {}) => {
    const errors = [];

    if (rules.required && !validateRequired(value)) {
        errors.push(`${fieldName} is required`);
    }

    if (rules.email && !validateEmail(value)) {
        errors.push('Invalid email address');
    }

    if (rules.password && !validatePassword(value)) {
        errors.push('Password must be at least 8 characters with letters and numbers');
    }

    if (rules.phone && !validatePhoneNumber(value)) {
        errors.push('Invalid phone number');
    }

    if (rules.minLength && !validateMinLength(value, rules.minLength)) {
        errors.push(`Minimum length is ${rules.minLength} characters`);
    }

    if (rules.maxLength && !validateMaxLength(value, rules.maxLength)) {
        errors.push(`Maximum length is ${rules.maxLength} characters`);
    }

    return errors;
};
