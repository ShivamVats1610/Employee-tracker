import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import VideoIntro from './components/VideoIntro/VideoIntro.jsx';
import MainApp from './MainApp';

const App = () => {
  const [showMainApp, setShowMainApp] = useState(false);

  if (!showMainApp) {
    return <VideoIntro onFinish={() => setShowMainApp(true)} />;
  }

  return (
    <Router>
      <MainApp />
    </Router>
  );
};

export default App;
