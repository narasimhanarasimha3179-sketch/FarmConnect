import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Authentication & session state
  const [user, setUser] = useState(null); // null = unauthenticated
  const [currentScreen, setCurrentScreen] = useState('Splash'); // Splash, Login, Register, Main
  const [activeTab, setActiveTab] = useState('Home'); // Home, Scanner, Marketplace, Profile

  const login = (userData) => {
    setUser(userData);
    setCurrentScreen('Main');
  };

  const logout = () => {
    setUser(null);
    setCurrentScreen('Login');
  };

  return (
    <AppContext.Provider
      value={{
        user,
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