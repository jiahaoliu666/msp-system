import React, { createContext, useContext, useState, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

const LoadingBar = ({ progress }: { progress: number }) => {
  return (
    <div 
      className="fixed top-0 left-0 w-full h-1 bg-gray-200"
      style={{ zIndex: 100000 }}
    >
      <div 
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{ 
          width: `${progress}%`,
          boxShadow: '0 0 10px rgba(59, 130, 246, 0.7)'
        }}
      />
    </div>
  );
};

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;

    if (isLoading) {
      setProgress(30);
      timer = setTimeout(() => {
        setProgress(70);
      }, 100);
    } else {
      setProgress(100);
      timer = setTimeout(() => {
        setProgress(0);
      }, 400);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading]);

  const startLoading = () => {
    console.log('startLoading called');
    setIsLoading(true);
  };

  const stopLoading = () => {
    console.log('stopLoading called');
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ isLoading, startLoading, stopLoading }}>
      {children}
      <LoadingBar progress={progress} />
      {isLoading && (
        <div className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm transition-all duration-300" style={{ zIndex: 99999 }} />
      )}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}; 