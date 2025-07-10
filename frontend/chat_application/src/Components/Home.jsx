import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
function Home(){
  const navigate = useNavigate();
  const changeRoute = () =>{
    navigate('/signup')
  }
  return(
    <>
   <div className="min-h-screen bg-gradient-to-br from-[#0f172a] to-[#1e3a8a] text-white flex flex-col items-center px-3 sm:px-4 py-6 sm:py-10"> 
  
  {/* Main Heading */}
  <div className="text-center mb-8 sm:mb-10 px-1 sm:px-2"> 
    <h1 className="font-bold mb-3 sm:mb-4 text-lg sm:text-2xl md:text-3xl lg:text-4xl"> 
      How to build <br />
      <span className="text-blue-300 text-xl sm:text-3xl md:text-4xl lg:text-5xl"> 
        a real-time chat application
      </span>
    </h1>
    <p className="text-sm sm:text-md md:text-xl text-gray-300 mb-4 sm:mb-6"> 
      and outperform your competition
    </p>
    <button  onClick={changeRoute} className="bg-blue-500 hover:bg-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full font-semibold shadow-lg hover:scale-105 transition w-full max-w-[200px] sm:max-w-[250px] mx-auto text-sm sm:text-base"> 
      Get Started
    </button>
  </div>

  {/* UI Boxes Wrapper */}
  <div className="w-full flex flex-col gap-4 sm:gap-6 items-center sm:flex-row sm:flex-wrap sm:justify-center px-1 sm:px-2"> 
       
    {/* Active Users */}
    <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-[300px] rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 shadow-xl p-3 sm:p-4"> 
      <p className="text-xs sm:text-sm font-semibold mb-2">Active Users</p> 
      <div className="flex flex-wrap gap-1 sm:gap-2 overflow-hidden"> 
        <img src="https://i.pravatar.cc/30?img=18" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
        <img src="https://i.pravatar.cc/30?img=19" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
        <img src="https://i.pravatar.cc/30?img=20" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
        <img src="https://i.pravatar.cc/30?img=21" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
        <span className="text-xs text-gray-300">+5 more</span>
      </div>
    </div>

    {/* Messages UI */}
    <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-[300px] rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg p-3"> 
      <p className="text-xs sm:text-sm font-semibold mb-2">Messages</p> 
      <div className="flex -space-x-1 sm:-space-x-2 overflow-hidden"> 
        <img src="https://i.pravatar.cc/30?img=10" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
        <img src="https://i.pravatar.cc/30?img=12" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
        <img src="https://i.pravatar.cc/30?img=15" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-white" /> 
      </div>
    </div>

    {/* Chat UI */}
    <div className="w-full max-w-[280px] sm:max-w-xs md:max-w-[300px] rounded-xl backdrop-blur-sm bg-white/10 border border-white/20 shadow-lg p-3 sm:p-4"> 
      <div className="flex items-center gap-2 mb-2">
        <img src="https://i.pravatar.cc/40?img=8" alt="" className="rounded-full w-6 h-6 sm:w-8 sm:h-8" /> 
        <p className="text-xs sm:text-sm font-semibold">Abhay</p> 
      </div>
      <div className="bg-white/20 rounded-lg p-2 text-xs sm:text-sm mb-1"> 
        Hey! Are you free now?
      </div>
      <div className="bg-blue-500 rounded-lg p-2 text-xs sm:text-sm text-white text-right"> 
        Yes, let's talk 😊
      </div>
    </div>

  </div>
</div>
  </>
  )
}
export default Home;