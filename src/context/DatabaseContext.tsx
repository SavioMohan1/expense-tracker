import React, { createContext, useContext, useEffect, useState } from 'react';
import { getDatabase } from '../db/database';

interface DatabaseContextValue {
  isReady: boolean;
}

const DatabaseContext = createContext<DatabaseContextValue>({ isReady: false });

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getDatabase()
      .then(() => setIsReady(true))
      .catch((err) => console.error('Database init error:', err));
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabaseReady() {
  return useContext(DatabaseContext).isReady;
}
