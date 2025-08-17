import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, User, Music } from 'lucide-react';

const BottomNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    return location.pathname.includes(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background-secondary border-t border-background-tertiary">
      <div className="flex items-center justify-around py-2">
        {/* Home/Battles */}
        <button
          onClick={() => navigate('/app/battles')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            isActive('/battles') 
              ? 'text-primary-400 bg-primary-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Home className="w-6 h-6 mb-1" />
          <span className="text-xs">Battles</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => navigate('/app/profile')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            isActive('/profile') 
              ? 'text-primary-400 bg-primary-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <User className="w-6 h-6 mb-1" />
          <span className="text-xs">Profile</span>
        </button>

        {/* Onboarding (only show if user hasn't completed) */}
        <button
          onClick={() => navigate('/app/onboarding')}
          className={`flex flex-col items-center py-2 px-4 rounded-lg transition-colors ${
            isActive('/onboarding') 
              ? 'text-primary-400 bg-primary-500/20' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Music className="w-6 h-6 mb-1" />
          <span className="text-xs">Songs</span>
        </button>
      </div>
    </div>
  );
};

export default BottomNavigation; 