'use client';

import * as React from 'react';
import ReduxProvider from './ReduxProvider';
import ThemeProvider from './ThemeProvider';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </ReduxProvider>
  );
}
