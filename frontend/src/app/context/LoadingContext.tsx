'use client';
import React, { createContext, useContext, useState } from 'react';
import GlobalLoader from '@/app/components/GlobalLoader';

interface LoadingContextType {
  showLoader: () => void;
  hideLoader: () => void;
}

const LoadingContext = createContext<LoadingContextType>({
  showLoader: () => {},
  hideLoader: () => {},
});

export const LoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);

  const showLoader = () => setIsLoading(true);
  const hideLoader = () => setIsLoading(false);

  return (
    <LoadingContext.Provider value={{ showLoader, hideLoader }}>
      {children}
      <GlobalLoader isLoading={isLoading} />
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);