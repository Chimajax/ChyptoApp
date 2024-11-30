import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate, useLocation } from 'react-router-dom';
import './Footer.css'

const Footer = () => {
  const [footerShow, setFooterShow] = useState(true)
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === '/') {
      setFooterShow(false);
    } else {
      setFooterShow(true);
    }
  }, [location]);

  const handleReferPage = () => {
    navigate('/refer');
  };

  const handleHomePage = () => {
    navigate('/home');
  };

  const handleBoostPage = () => {
    navigate('/boost');
  };

  const handleTaskPage = () => {
    navigate('/task');
  };

  return (
    footerShow ? (
        
      <div className='footer-container'>
        <div className='footer-container-m'>
          <div className='footer-container-s' onClick={handleReferPage}>
            Refer
          </div>
          <div className='footer-container-s' onClick={handleHomePage}>
            Home
          </div>
          <div className='footer-container-s' onClick={handleBoostPage}>
            Boost
          </div>
          <div className='footer-container-s'onClick={handleTaskPage}>
            Task
          </div>
        </div>
      </div>
    ) : null

  );
};

export default Footer;
