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
    const clerkError = error as { errors?: Array<{ longMessage?: string; message?: string }> };
    return clerkError?.errors?.[0]?.longMessage ?? clerkError?.errors?.[0]?.message ?? fallback;
};