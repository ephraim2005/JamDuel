import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import SplashScreen from './components/SplashScreen';
import Register from './components/Register';
import Login from './components/Login';
import SongPicker from './components/SongPicker';
import BattleFeed from './components/BattleFeed';
import EnhancedBattleFeed from './components/EnhancedBattleFeed';
import BattlePage from './components/BattlePage';
import ResultsView from './components/ResultsView';
import Profile from './components/Profile';
import EnhancedProfile from './components/EnhancedProfile';
import OnboardingFlow from './components/OnboardingFlow';
import BottomNavigation from './components/BottomNavigation';
import PrivateRoute from './components/PrivateRoute';
import Friends from './components/Friends';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <div className="App min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
          <Routes>
            <Route path="/" element={<SplashScreen />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/home" element={<Navigate to="/battles" replace />} />
            <Route 
              path="/song-picker" 
              element={
                <PrivateRoute>
                  <SongPicker />
                </PrivateRoute>
              } 
            />
                               <Route 
                     path="/battles" 
                     element={
                       <PrivateRoute>
                         <EnhancedBattleFeed />
                       </PrivateRoute>
                     } 
                   />
                   <Route 
                     path="/onboarding" 
                     element={
                       <PrivateRoute>
                         <OnboardingFlow />
                       </PrivateRoute>
                     } 
                   />
            <Route 
              path="/battle/:battleId" 
              element={
                <PrivateRoute>
                  <BattlePage />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/results/:battleId" 
              element={
                <PrivateRoute>
                  <ResultsView />
                </PrivateRoute>
              } 
            />
                                           <Route 
              path="/profile" 
              element={
                <PrivateRoute>
                  <EnhancedProfile />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/friends" 
              element={
                <PrivateRoute>
                  <Friends />
                </PrivateRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 