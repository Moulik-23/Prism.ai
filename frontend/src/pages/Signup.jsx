import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
import { signUp } from '../services/firebase';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validation states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  // Email validation
  const validateEmail = (emailValue) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailValue) {
      setEmailError('');
      return false;
    }
    if (!emailRegex.test(emailValue)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password strength validation
  const validatePassword = (passwordValue) => {
    if (!passwordValue) {
      setPasswordError('');
      setPasswordStrength('');
      return false;
    }

    let strength = 0;
    let errors = [];

    if (passwordValue.length < 8) {
      errors.push('At least 8 characters');
    } else {
      strength++;
    }

    if (!/[A-Z]/.test(passwordValue)) {
      errors.push('One uppercase letter');
    } else {
      strength++;
    }

    if (!/[a-z]/.test(passwordValue)) {
      errors.push('One lowercase letter');
    } else {
      strength++;
    }

    if (!/[0-9]/.test(passwordValue)) {
      errors.push('One number');
    } else {
      strength++;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordValue)) {
      errors.push('One special character');
    } else {
      strength++;
    }

    if (errors.length > 0) {
      setPasswordError(`Weak password. Missing: ${errors.join(', ')}`);
      setPasswordStrength('weak');
      return false;
    } else {
      setPasswordError('');
      setPasswordStrength('strong');
      return true;
    }
  };

  // Confirm password validation
  const validateConfirmPassword = (confirmPasswordValue) => {
    if (!confirmPasswordValue) {
      setConfirmPasswordError('');
      return false;
    }
    if (confirmPasswordValue !== password) {
      setConfirmPasswordError('Passwords do not match');
      return false;
    }
    setConfirmPasswordError('');
    return true;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    validateEmail(value);
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    validatePassword(value);
    // Re-validate confirm password if it has a value
    if (confirmPassword) {
      validateConfirmPassword(confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    validateConfirmPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate all fields
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);
    const isConfirmPasswordValid = validateConfirmPassword(confirmPassword);

    if (!isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
      setError('Please fix the errors below before submitting');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-prism-light dark:bg-prism-dark flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="max-w-md w-full">
        <div className="card-3d p-8" data-aos="fade-up">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-prism-gradient rounded-2xl mb-4 shadow-prism">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Create Account</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-2">Start your career guidance journey today</p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-xl mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className={`absolute left-3 top-3 h-5 w-5 ${emailError ? 'text-red-500' : email && !emailError ? 'text-green-500' : 'text-gray-400'}`} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={() => validateEmail(email)}
                  className={`input-field pl-10 ${
                    emailError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : email && !emailError 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : ''
                  }`}
                  placeholder="you@example.com"
                />
                {email && !emailError && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                )}
              </div>
              {emailError && (
                <div className="mt-1 flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{emailError}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 h-5 w-5 ${passwordError ? 'text-red-500' : passwordStrength === 'strong' ? 'text-green-500' : 'text-gray-400'}`} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={() => validatePassword(password)}
                  className={`input-field pl-10 ${
                    passwordError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : passwordStrength === 'strong' 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : ''
                  }`}
                  placeholder="••••••••"
                />
                {passwordStrength === 'strong' && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                )}
              </div>
              {passwordError && (
                <div className="mt-1 flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{passwordError}</span>
                </div>
              )}
              {password && !passwordError && passwordStrength === 'strong' && (
                <div className="mt-1 flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Strong password</span>
                </div>
              )}
              {password && (
                <div className="mt-2 space-y-1">
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Password must contain:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs">
                    <div className={`flex items-center space-x-1 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {password.length >= 8 ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span>8+ characters</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {/[A-Z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span>Uppercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[a-z]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {/[a-z]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span>Lowercase letter</span>
                    </div>
                    <div className={`flex items-center space-x-1 ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {/[0-9]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span>Number</span>
                    </div>
                    <div className={`flex items-center space-x-1 col-span-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(password) ? 'text-green-600 dark:text-green-400' : 'text-gray-500'}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(password) ? <CheckCircle className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                      <span>Special character</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className={`absolute left-3 top-3 h-5 w-5 ${confirmPasswordError ? 'text-red-500' : confirmPassword && !confirmPasswordError ? 'text-green-500' : 'text-gray-400'}`} />
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={handleConfirmPasswordChange}
                  onBlur={() => validateConfirmPassword(confirmPassword)}
                  className={`input-field pl-10 ${
                    confirmPasswordError 
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
                      : confirmPassword && !confirmPasswordError 
                      ? 'border-green-500 focus:border-green-500 focus:ring-green-500' 
                      : ''
                  }`}
                  placeholder="••••••••"
                />
                {confirmPassword && !confirmPasswordError && (
                  <CheckCircle className="absolute right-3 top-3 h-5 w-5 text-green-500" />
                )}
              </div>
              {confirmPasswordError && (
                <div className="mt-1 flex items-center space-x-1 text-sm text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{confirmPasswordError}</span>
                </div>
              )}
              {confirmPassword && !confirmPasswordError && (
                <div className="mt-1 flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || emailError || passwordError || confirmPasswordError || !email || !password || !confirmPassword}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-prism-violet dark:text-prism-cyan hover:text-prism-indigo dark:hover:text-prism-blue transition-colors">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
