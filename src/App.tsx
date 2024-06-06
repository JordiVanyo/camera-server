import React from 'react';
import logo from './logo.svg';
import './App.css';
import CameraIP from './CameraIP';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>IP Camera</h1>
        <CameraIP />
      </header>
    </div>
  );
}

export default App;
