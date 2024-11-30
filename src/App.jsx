// src/App.jsx
import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StartPage from './components/StartPage';
import Home from './components/Home';
import Footer from './components/Footer';
import Boost from './components/Boost';
import Refer from './components/Refer';
import Task from './components/Task';
import SponsoredTask from './components/SponsoredTask';
import SetTask from './components/SetTask';
import DailyLogin from './components/DailyLogin';
import Comment from './components/Comment';

function App() {
  return (
    <div className='app-body'>
    <Router>
      <Routes>
        <Route path="/" element={<StartPage />} /> {/* Default route */}
        <Route path="/home" element={<Home />} />   {/* Home page route */}
        <Route path="/boost" element={<Boost />} />
        <Route path="/refer" element={<Refer />} />
        <Route path="/task" element={<Task />} />
        <Route path="/sponsoredtask" element={<SponsoredTask />} />
        <Route path="/set-task" element={<SetTask />} />
        <Route path="/dailylogin" element={<DailyLogin />} />
        <Route path="/comment" element={<Comment />} />
      </Routes>
      
      <Footer />
    </Router>
    </div>
  );
}

export default App;
 