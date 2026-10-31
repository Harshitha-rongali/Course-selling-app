export function validateLogin({ username, password }) {
  const errors = {};

  if (!username.trim()) {
    errors.username = 'Enter your username.';
  }

  if (!password) {
    errors.password = 'Enter your password.';
  }

  return errors;
}

export function validateSignup({ username, password, confirmPassword }) {
  const errors = {};
  const trimmedUsername = username.trim();

  if (!trimmedUsername) {
    errors.username = 'Enter a username.';
  } else if (trimmedUsername.length < 3) {
    errors.username = 'Use at least 3 characters for your username.';
  }

  if (!password) {
    errors.password = 'Enter a password.';
  } else if (password.length < 6) {
    errors.password = 'Use at least 6 characters for your password.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
}
