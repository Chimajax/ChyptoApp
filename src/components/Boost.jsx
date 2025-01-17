import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import CoinScore from '../assets/icons/coin_score_use.png';
import './Boost.css';

const Boost = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [level, setLevel] = useState(0);
  const [levelPrice, setLevelPrice] = useState(0);
  const [hours, setHours] = useState(0);
  const [hoursPrice, setHoursPrice] = useState(0);
  const [dialougeBox, setDialougeBox] = useState(false);
  const [dialougeBoxNote, setDialougeBoxNote] = useState('');
  const [dialougeBoxButton, setDialougeBoxButton] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [userId, setUserId] = useState(null); // Define userId as a state variable
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

            if (!userData.level || userData.level === 1 ) {
              setLevelPrice(10000);
            } else if (userData.level === 2 ) {
              setLevelPrice(25000);
            } else if (userData.level === 3 ) {
              setLevelPrice(50000);
            } else if (userData.level === 4 ) {
              setLevelPrice(85000);
            } else if (userData.level === 5 ) {
              setLevelPrice(110000);
            } else if (userData.level === 6 ) {
              setLevelPrice(165000);
            } else if (userData.level === 7 ) {
              setLevelPrice('MAX');
            };

            setHours(userData.hours || 2);

            if (!userData.hours || userData.hours <= 2 ) {
              setHoursPrice(30000);
            } else if (userData.hours === 3 ) {
              setHoursPrice(60000);
            } else if (userData.hours === 4 ) {
              setHoursPrice(90000);
            } else if (userData.hours === 5 ) {
              setHoursPrice(130000);
            } else if (userData.hours === 6 ) {
              setHoursPrice(180000);
            } else if (userData.hours === 7 ) {
              setHoursPrice('MAX');
            }

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


  const handleLevelIncrease = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const currentBalance = parseInt(balance);
    const currentLevelPrice = parseInt(levelPrice);
    
    if (currentLevelPrice > currentBalance) {
      setDialougeBox(true);
      setDialougeBoxButton(true);
      setDialougeBoxNote('Not Enough Balance');

    } else if (currentBalance > currentLevelPrice) {
      
      const newLevel = parseInt(level) + 1;
      const newBalance = currentBalance - currentLevelPrice;

      if (level === 7) {return};
  
    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable
  
    try {
      const docSnap = await getDoc(userDocRef);
  
        await updateDoc(userDocRef, { level: newLevel, Balance: newBalance }); // Correct updateDoc syntax

      
      setLevel(newLevel);
      if (newLevel === 2 ) {
        setLevelPrice(25000);
      } else if (newLevel === 3 ) {
        setLevelPrice(50000);
      } else if (newLevel === 4 ) {
        setLevelPrice(85000);
      } else if (newLevel === 5 ) {
        setLevelPrice(110000);
      } else if (newLevel === 6 ) {
        setLevelPrice(165000);
      } else if (newLevel === 7 ) {
        setLevelPrice('MAX');
      };
      setBalance(newBalance);

    } catch (error) {
      console.error('Error updating user document:', error);
      setDialougeBox(true);
      setDialougeBoxButton(true);
      setDialougeBoxNote('An Error Occured');
      setBalance(currentBalance); // Revert balance on error
      return;
     }
    } 
  };

  
  const handleHoursIncrease = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const currentBalance = parseInt(balance);
    const currentHoursPrice = parseInt(hoursPrice);
    
    if (currentHoursPrice > currentBalance) {
      setDialougeBox(true);
      setDialougeBoxButton(true);
      setDialougeBoxNote('Not Enough Balance');

    } else if (currentBalance > currentHoursPrice) {
      
      const newHours = parseInt(hours) + 1;
      const newBalance = currentBalance - currentHoursPrice;

      if (hours === 7) {return};
  
    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable
  
    try {
      const docSnap = await getDoc(userDocRef);
  
        await updateDoc(userDocRef, { hours: newHours, Balance: newBalance }); // Correct updateDoc syntax

      
      setHours(newHours);
       if (newHours === 3 ) {
        setHoursPrice(60000);
      } else if (newHours === 4 ) {
        setHoursPrice(90000);
      } else if (newHours === 5 ) {
        setHoursPrice(130000);
      } else if (newHours === 6 ) {
        setHoursPrice(180000);
      } else if (newHours === 7 ) {
        setHoursPrice('MAX');
      }
      setBalance(newBalance);

    } catch (error) {
      console.error('Error updating user document:', error);
      setDialougeBox(true);
      setDialougeBoxButton(true);
      setDialougeBoxNote('An Error Occured');
      setBalance(currentBalance); // Revert balance on error
      return;
     }
    } 
  };



  const handleDialougeBoxClose = () => {
    setDialougeBox(false);
    setDialougeBox('')
  }

  const handleVisitLink = () => {
  // Open the link in a new tab
  window.open("https://poawooptugroo.com/4/8808518", "_blank");
};


  if (loading) {
    return <div className='start-page-container'><div className='loader'></div></div>;
  }

  return (
    <div className='boost-page-container'>
      <div className='home-page-container-balance'>
          <img src={CoinScore} alt="Chypto" className='home-page-container-balance-1' /> 
          <div className='home-page-container-balance-2'>{balance}</div>
        </div>

      {dialougeBox ? (
        <div className='boost-page-dialougeBox'>
          <div className='boost-page-dialougeBox-1'>{dialougeBoxNote}</div>

          {dialougeBoxButton ? (
          <div className='boost-page-dialougeBox-2'><button onClick={handleDialougeBoxClose}>OKAY</button></div>
          ) : (
            <div></div>
          )}
        </div>
      ) : (
        <div></div>
      )}

      <div className='boost-page-mid-container'>
          <div className='boost-page-mid-container-1'>
          <h3>Boost Coins</h3>
            <div className='boost-page-mid-container-1i'>
              See Latest Offers <button onClick={handleVisitLink}>GO</button>
            </div>


          </div>
          <div className='boost-page-mid-container-2'>
          <h3>Boost Engine</h3> 

          <div className='boost-page-mid-container-2i'>
              <div className='boost-page-mid-container-2ii'>Increase Level <button onClick={handleLevelIncrease}>{levelPrice}</button></div>
                <div>({level}/7)</div>
          </div>
          <div className='boost-page-mid-container-2i'>
              <div className='boost-page-mid-container-2ii'>Increase hours <button onClick={handleHoursIncrease}>{hoursPrice}</button></div>
                <div>({hours}/7)</div>
          </div>
          </div>
        
      </div>
    </div>
  );
};

export default Boost;
 
