import React from "react";
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios"
 function Signup(){
  const navigate = useNavigate();
  const changeRoute = () => {
    navigate('/signin')
  }
  
   const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const[loading, setLoading] = useState(false);
  const[message, setMessage] = useState('')

const handleDeleteAccount = async (e) => {
    e.preventDefault();
    const { email, username, password } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!email || !username || !password) {
      return toast.error('Error: Please fill in all fields', {
        autoClose: 1500,
      });
    }
    if (!emailRegex.test(email)) {
      return toast.error('Error: Please enter a valid email address', {
        autoClose: 1500});
      }
    try{
      await axios.delete('http://localhost:3000/api/auth/delete', { data: { email,username, password } });
      toast.success('Account deleted. you can register again.', {
        autoClose: 1500,
      });
      localStorage.removeItem('email');
      localStorage.removeItem('otpPending')
      setFormData({ username: '', email: '', password: '' });
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Error deleting account'; 
        toast.error('Error deleting account', {
          autoClose: 1500,  
        });
      } 
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true)
    setMessage('')
    if(!formData.username || !formData.email || !formData.password){
      setLoading(false)
      return toast.error('Error : Please fill in all the fields', {autoClose :1500})
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(formData.email)){
      setLoading(false)
      return toast.error('Error : Please enter a valid email address', {autoClose:1500})
    }
     if(formData.password.length < 6){
      setLoading(false)
      return toast.error('Password must be at least 6 characters long', {autoClose:1500})
    }


   try {
      const response = await axios.post('http://localhost:3000/api/auth/signup', formData);
      
      toast.success("Sign up successful")
      setFormData({ username: '', email: '', password: '' });
      navigate('/emailverify', {
        state: {
          email: formData.email,
          fromSignup: true
        }
      })
    } catch (error) {
      if (error.response && error.response.data) {
        setMessage(error.response.data.message);
        toast.error('Error: User already exists ', {autoClose:1500});
      } else {
        setMessage('Network error. Please try again.');
        toast.error('Network error, please try again',{autoClose:1500})
      }
    } finally {
      setLoading(false);
    }
  };

  return(
    <>
        <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] flex items-center justify-center px-3 sm:px-4 py-6">
      <div className=" max-w-[350px] sm:max-w-md">
        
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-3">
            Create Account
          </h1>
          <p className="text-sm sm:text-base text-gray-300">
            Join us and start building amazing chat apps
          </p>
        </div>

        {/* Signup Form */}
        <div className="backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl shadow-2xl p-6 sm:p-8">
          <div className="space-y-4 sm:space-y-6">
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-white mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter your username"
                required
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base"
                placeholder="Create a password"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 text-sm sm:text-base"
            >
              Create Account
            </button>



          </div>

          {/* Login Link */}
          <div className="text-center mt-6 sm:mt-8">
            <p className="text-sm text-gray-300">
              Already have an account?{' '}
              <a onClick={changeRoute} href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Sign In
              </a>
            </p>

             <p className="text-sm text-gray-300">
              Stuck or Reregister Account ?{' '}
              <a onClick={handleDeleteAccount} href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200">
                Delete Account
              </a>
            </p>

          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8">
          <p className="text-xs text-gray-400">
            By creating an account, you agree to our{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Privacy Policy
            </a>
          </p>
        </div>

      </div>
    </div>

    </>
  )
  
  
}
export default Signup
