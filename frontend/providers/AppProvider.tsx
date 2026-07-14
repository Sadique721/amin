'use client';

import * as React from 'react';
import ReduxProvider from './ReduxProvider';
import ThemeProvider from './ThemeProvider';
import { Toaster } from 'sonner';

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        {children}
        <Toaster position="top-right" richColors />
      </ThemeProvider>
    </ReduxProvider>
  );
}
