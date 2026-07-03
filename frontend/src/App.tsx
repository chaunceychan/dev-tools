import React from 'react';
import AppLayout from '@/components/layout/AppLayout';

/**
 * App — Root component.
 * Renders the main application layout which handles tool routing internally.
 * The layout includes a sidebar, content area, and status bar.
 */
const App: React.FC = () => {
  return <AppLayout />;
};

export default App;
