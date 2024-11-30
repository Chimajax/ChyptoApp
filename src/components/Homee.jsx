import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [level, setLevel] = useState(1);
  const [hours, setHours] = useState(0);
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [userId, setUserId] = useState(null); // Define userId as a state variable
  const [balanceDelta, setBalanceDelta] = useState(0); // new state variable
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdFromTelegram = window.Telegram.WebApp.initDataUnsafe.user?.id;
      
      if (userIdFromTelegram) {
        setUserId(userIdFromTelegram); // Update userId state
        const userDocRef = doc(db, 'users', String(userIdFromTelegram));
        
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUsername(userData.username || '@Username');
            setBalance(userData.Balance || 0);
            setLevel(userData.level || 1);
            setHours(userData.hours || 2);

            if (!userData.countDown || userData.countDown === 0) {
              setRemainingTime(`${userData.hours || 2}:00:00`);
              setCountDown(0);
            } else {
              const countDown = userData.countDown;
              setRemainingTime(`${Math.floor((countDown) / 3600)}:${Math.floor((countDown % 3600) / 60)}:${Math.floor(countDown % 60)}`);
              setCountDown(countDown);
            }
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
        console.error('User ID is missing');
      }
      setLoading(false);
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    let interval;
    if (countDown > 0) {
      interval = setInterval(() => {
        setCountDown((prevCountDown) => {
          const newCountDown = prevCountDown - 1;

          // Update remaining time display
          setRemainingTime(`${Math.floor(newCountDown / 3600).toString().padStart(2, '0')}:${Math.floor((newCountDown % 3600) / 60).toString().padStart(2, '0')}:${Math.floor(newCountDown % 60).toString().padStart(2, '0')}`);

      
          const currentBalance = balance;
          const levelSet = parseInt(level) * 1;
          const newBalance = currentBalance + levelSet;
          setBalance(newBalance); // Update the state

           // Update Firestore every second
          updateFirestore();

          
          if (newCountDown <= 0) {
            clearInterval(interval);
            setCountDown(0); // Reset countdown on error
           setRemainingTime(`${hours}:00:00`);
           updateFirestoreCount();
          
            return 0;
          }
          return newCountDown;
        });
      }, 1000);
    }

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [countDown]);

  const updateFirestore = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const userDocRef = doc(db, 'users', String(userId));
    try {
      await updateDoc(userDocRef, { Balance: balance, countDown: countDown });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  };

  const updateFirestoreCount = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const userDocRef = doc(db, 'users', String(userId));
    try {
      await updateDoc(userDocRef, { countDown: 0, });
    } catch (error) {
      console.error('Error updating user document:', error);
    }
  };


  const handleTap = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const currentBalance = balance;
    const newLevel = parseInt(level) * 10;
    const newBalance = currentBalance + newLevel;
    setBalance(newBalance); // Update the state
  
    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable
  
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        await updateDoc(userDocRef, { Balance: newBalance }); // Correct updateDoc syntax
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error updating user document:', error);
      setBalance(currentBalance); // Revert balance on error
    }
  };

  const handleMine = async () => {
    if (!userId || countDown > 0) return; // Only proceed if no countdown is active

    const hoursToSeconds = parseInt(hours) * 60 * 60;
    const initialCountDown = hoursToSeconds - 1;
    
    setCountDown(initialCountDown); // Start countdown

    
    
    // Update Firestore
    const userDocRef = doc(db, 'users', String(userId));
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        await updateDoc(userDocRef, { countDown: initialCountDown });
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error updating user document:', error);
      setCountDown(0); // Reset countdown on error
    }
  };

  if (loading) {
    return <div className='start-page-container'><div className='loader'></div></div>;
  }

  return (
    <div className='home-page-container'>
      <h1>@{username}</h1>
      <p>Balance: {balance.toFixed(1)}</p>

      <div className='home-page-mid-container'>
        <div className='home-page-sign-container' onClick={handleTap}>
          <div className='level'>{level}X</div> 
        </div>

        <div className='home-page-mine-container' onClick={handleMine}>
          <div className='level'>{remainingTime}</div> 
        </div>
      </div>
    </div>
  );
};

export default Home;
 