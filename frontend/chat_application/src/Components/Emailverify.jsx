import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";

function Emailverify() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get email from state or URL params
  const email = location.state?.email || new URLSearchParams(location.search).get('email');
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(300); // 5 minutes in seconds
  const [resendLoading, setResendLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Timer countdown effect - stops at 0 and doesn't restart automatically
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
    // Timer stops at 0, no automatic restart
  }, [timer]);

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      toast.error('No email provided for verification', {autoClose: 1500});
      navigate('/signup');
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const inputs = document.querySelectorAll('.otp-input');
      inputs[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if all OTP fields are filled
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      return toast.error('Please enter complete 6-digit code', {autoClose: 1500});
    }

    setLoading(true);
    setMessage('');

    try {
      // Fixed API call using axios properly
      const response = await axios.post('http://localhost:3000/api/auth/verify', {
        code: otpString  // Changed from 'otp' to 'code' to match backend
      });

      if (response.status === 200) {
        toast.success('Email verified successfully!', {autoClose: 1500});
        setMessage('Email verified successfully!');
        navigate('/signin');
      }
      

    } catch (error) {
      console.error('Verification error:', error);
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      toast.error(errorMessage, {autoClose: 2000});
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResendLoading(true);
    setMessage('');
    
    try {
      // Fixed API call using axios properly
      const response = await axios.post('http://localhost:3000/api/auth/resend-otp', {
        email: email
      });

      if (response.status === 200) {
        toast.success('Verification code sent again!', {autoClose: 1500});
        setMessage('Verification code sent again!');
        
        // Reset OTP inputs
        setOtp(['', '', '', '', '', '']);
        
        // Reset timer only when user clicks resend
        setTimer(300);
        
        // Focus first input
        setTimeout(() => {
          const inputs = document.querySelectorAll('.otp-input');
          if (inputs[0]) inputs[0].focus();
        }, 100);
      }
      
    } catch (error) {
      console.error('Resend error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to resend code';
      toast.error(errorMessage, {autoClose: 2000});
      setMessage(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const handleBackToSignup = () => {
    navigate('/signup');
    toast.info('Redirecting to signup page...', {autoClose: 1000});
  };

  // Format timer display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Don't render if no email
  if (!email) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] flex items-center justify-center px-3 sm:px-4 py-6">
      <div className="max-w-[350px] sm:max-w-md w-full">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Verify Email
          </h1>
          <p className="text-sm sm:text-base text-gray-300 mb-2">
            We've sent a verification code to
          </p>
          <p className="text-sm sm:text-base text-blue-400 font-medium break-all">
            {email}
          </p>
        </div>

        {/* OTP Form */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="space-y-6">
            
            {/* Message Display */}
            {message && (
              <div className={`text-center p-3 rounded-lg ${
                message.includes('successfully') || message.includes('sent again') 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : message.includes('error') || message.includes('Invalid') || message.includes('expired')
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
              }`}>
                <p className="text-sm">{message}</p>
              </div>
            )}
            
            {/* OTP Input Section */}
            <div>
              <label className="block text-sm font-medium text-white mb-4 text-center">
                Enter 6-digit verification code
              </label>
              <div className="flex justify-center space-x-2 sm:space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleChange(e.target, index)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    className="otp-input w-10 h-10 sm:w-12 sm:h-12 text-center bg-white/10 border border-white/30 rounded-lg text-white text-lg sm:text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    disabled={loading}
                  />
                ))}
              </div>
            </div>

            {/* Timer Section */}
            <div className="text-center">
              {timer > 0 ? (
                <p className="text-sm text-gray-300 mb-2">
                  Code expires in <span className="text-blue-400 font-medium">{formatTime(timer)}</span>
                </p>
              ) : (
                <p className="text-sm text-red-400 mb-2">
                  Code has expired
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`w-full font-semibold py-3 px-4 rounded-lg shadow-lg transition-all duration-200 text-sm sm:text-base ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 hover:shadow-xl transform hover:scale-[1.02]'
              } text-white`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying...
                </div>
              ) : (
                'Verify Code'
              )}
            </button>

            {/* Resend Section - Always Available */}
            <div className="text-center">
              <p className="text-sm text-gray-300 mb-3">
                Didn't receive the code?
              </p>
              <button
                type="button"
                onClick={resendOtp}
                disabled={resendLoading}
                className={`font-medium text-sm transition-colors duration-200 underline underline-offset-2 ${
                  !resendLoading
                    ? 'text-blue-400 hover:text-blue-300 cursor-pointer'
                    : 'text-gray-500 cursor-not-allowed'
                }`}
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </span>
                ) : (
                  'Resend Code'
                )}
              </button>
            </div>

          </div>
        </div>

        {/* Back to Signup */}
        <div className="text-center mt-6 sm:mt-8">
          <button 
            onClick={handleBackToSignup}
            className="text-gray-400 hover:text-white text-sm transition-colors duration-200 flex items-center justify-center mx-auto"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Sign Up
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs text-gray-400">
            Having trouble?{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Contact Support
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}

export default Emailverify;