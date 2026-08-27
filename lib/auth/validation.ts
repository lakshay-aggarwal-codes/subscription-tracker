export type FieldErrors = Record<string, string>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) return "Email is required";
    if (!EMAIL_PATTERN.test(trimmed)) return "Enter a valid email address";

    return null;
};

export type PasswordStrength = "weak" | "fair" | "strong";

const MIN_LENGTH = 8;

export const validatePassword = (value: string): string | null => {
    if (!value) return "Password is required";
    if (value.length < MIN_LENGTH) return `Password must be at least ${MIN_LENGTH} characters`;

    return null;
};

export const getPasswordStrength = (value: string): PasswordStrength => {
    let score = 0;

    if (value.length >= MIN_LENGTH) score += 1;
    if (value.length >= 12) score += 1;
    if (/[A-Z]/.test(value)) score += 1;
    if (/[0-9]/.test(value)) score += 1;
    if (/[^A-Za-z0-9]/.test(value)) score += 1;

    if (score <= 2) return "weak";
    if (score <= 3) return "fair";
    return "strong";
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
    if (!confirmPassword) return "Confirm your password";
    if (password !== confirmPassword) return "Passwords do not match";

    return null;
};

export const validateVerificationCode = (value: string): string | null => {
    const trimmed = value.trim();

    if (!trimmed) return "Enter the verification code";
    if (!/^\d{6}$/.test(trimmed)) return "Code must be 6 digits";

    return null;
};

type SignInFields = { emailAddress: string; password: string };

export const validateSignInForm = ({ emailAddress, password }: SignInFields): FieldErrors => {
    const errors: FieldErrors = {};

    const emailError = validateEmail(emailAddress);
    if (emailError) errors.emailAddress = emailError;

    if (!password) errors.password = "Password is required";

    return errors;
};

type SignUpFields = { emailAddress: string; password: string; confirmPassword: string };

export const validateSignUpForm = ({ emailAddress, password, confirmPassword }: SignUpFields): FieldErrors => {
    const errors: FieldErrors = {};

    const emailError = validateEmail(emailAddress);
    if (emailError) errors.emailAddress = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) errors.password = passwordError;

    if (!passwordError) {
        const confirmError = validateConfirmPassword(password, confirmPassword);
        if (confirmError) errors.confirmPassword = confirmError;
    }

    return errors;
};

export const getClerkErrorMessage = (error: unknown, fallback = "Something went wrong. Please try again."): string => {
    if (!error) return fallback;

    const clerkError = error as {
        errors?: Array<{ code?: string; longMessage?: string; message?: string }>;
        message?: string;
    };

    const firstError = clerkError?.errors?.[0];
    if (firstError) {
        const code = firstError.code?.toLowerCase();
        if (code?.includes("form_identifier_not_found") || code?.includes("form_password_incorrect")) {
            return "Incorrect email or password. Please try again.";
        }
        if (code?.includes("form_param_format_invalid")) {
            return "Please enter a valid email address.";
        }
        if (code?.includes("form_password_length_too_short")) {
            return "Password must be at least 8 characters long.";
        }
        if (code?.includes("form_identifier_exists")) {
            return "An account with this email address already exists.";
        }
        if (code?.includes("form_code_incorrect")) {
            return "The verification code is incorrect. Please check and try again.";
        }
        if (code?.includes("session_exists")) {
            return "You are already signed in.";
        }
        return firstError.longMessage ?? firstError.message ?? fallback;
    }

    if (typeof clerkError.message === "string") {
        if (clerkError.message.includes("Network") || clerkError.message.includes("Failed to fetch")) {
            return "Unable to connect. Please check your internet connection and try again.";
        }
        return clerkError.message;
    }

    return fallback;
};