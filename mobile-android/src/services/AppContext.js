import React, { createContext, useState, useEffect, useContext } from 'react';
import { storageService } from './storageService';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [currentScreen, setCurrentScreen] = useState('Splash');
  const [activeTab, setActiveTab] = useState('Home');
  const [isReady, setIsReady] = useState(false);

  // Restore stored session on app launch
  useEffect(() => {
    const hydrateSession = async () => {
      const savedUser = await storageService.getUser();
      if (savedUser) {
        setUser(savedUser);
      }
      setIsReady(true);
    };
    hydrateSession();
  }, []);

  const login = async (userData) => {
    setUser(userData);
    await storageService.saveUser(userData);
    setCurrentScreen('Main');
  };

  const logout = async () => {
    setUser(null);
    await storageService.clearUser();
    setCurrentScreen('Login');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isReady,
        currentScreen,
        setCurrentScreen,
        activeTab,
        setActiveTab,
        login,
        logout,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);