import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import CoinScore from '../assets/icons/coin_score_use.png';
import './Task.css';
import SponsoredTask from './SponsoredTask';

const Tasks = () => {
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
  const [youtube, setYoutube] = useState(false);
  const [youtubeNote, setYoutubeNote] = useState('Subscribe');
  const [twitterX, setTwitterX] = useState(false);
  const [twitterXNote, setTwitterXNote] = useState('Follow');
  const [telegram, setTelegram] = useState(false);
  const [telegramNote, setTelegramNote] = useState('Join');
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

            if (!userData.youtube && userData.youtube !== false) {
                setYoutube(false);
                setYoutubeNote('Subscribe');
            } else if (userData.youtube === false) {
                setYoutube(false);
                setYoutubeNote('Claim');
            } else if (userData.youtube === true) {
                setYoutube(true);
            }

            if (!userData.twitterX && userData.twitterX !== false) {
                setTwitterX(false);
                setTwitterXNote('Follow');
            } else if (userData.twitterX === false) {
                setTwitterX(false);
                setTwitterXNote('Claim');
            } else if (userData.twitterX === true) {
                setTwitterX(true);
            }


            if (!userData.telegram && userData.telegram !== false) {
                setTelegram(false);
                setTelegramNote('Join');
            } else if (userData.telegram === false) {
                setTelegram(false);
                setTelegramNote('Claim');
                
            } else if (userData.telegram === true) {
                setTelegram(true);
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



  const handleDialougeBoxClose = () => {
    setDialougeBox(false);
    setDialougeBox('')
  }

  const handleYoutube = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const currentBalance = parseInt(balance);

    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable

    if (youtubeNote === 'Subscribe') {

        try {
            const docSnap = await getDoc(userDocRef);
        
              await updateDoc(userDocRef, { youtube: false }); // Correct updateDoc syntax
              setTimeout(() => {
                setYoutubeNote('Claim');
              }, 1300);
      
          } catch (error) {
            console.error('Error updating user document:', error);
            setDialougeBox(true);
            setDialougeBoxButton(true);
            setDialougeBoxNote('An Error Occured');
            setBalance(currentBalance); // Revert balance on error
            return;
           }

           
           const youtubeUrl = `https://www.youtube.com/@Chypto`;
        
        setTimeout(() => {
            window.open(youtubeUrl, '_blank');
          }, 300);

     } else if (youtubeNote === 'Claim') {
        const newBalancee = 25000 + currentBalance;

        try {
            const docSnap = await getDoc(userDocRef);
        
              await updateDoc(userDocRef, { youtube: true, Balance: newBalancee }); // Correct updateDoc syntax
              setBalance(newBalancee);
              setYoutube(true);
      
          } catch (error) {
            console.error('Error updating user document:', error);
            setDialougeBox(true);
            setDialougeBoxButton(true);
            setDialougeBoxNote('An Error Occured');
            setBalance(currentBalance); // Revert balance on error
            return;
           }
     } };


     const handleTwitterX = async () => {
        if (!userId) return; // Check if userId is defined before proceeding
        const currentBalance = parseInt(balance);
    
        const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable
    
        if (twitterXNote === 'Follow') {
    
            try {
                const docSnap = await getDoc(userDocRef);
            
                  await updateDoc(userDocRef, { twitterX: false }); // Correct updateDoc syntax
                  setTimeout(() => {
                    setTwitterXNote('Claim');
                  }, 1300);
          
              } catch (error) {
                console.error('Error updating user document:', error);
                setDialougeBox(true);
                setDialougeBoxButton(true);
                setDialougeBoxNote('An Error Occured');
                setBalance(currentBalance); // Revert balance on error
                return;
               }
    
               
               const twitterXUrl = `https://X.com/@Chypto_Official`;
            
            setTimeout(() => {
                window.open(twitterXUrl, '_blank');
              }, 300);
    
         } else if (twitterXNote === 'Claim') {
            const newBalancee = 25000 + currentBalance;
    
            try {
                const docSnap = await getDoc(userDocRef);
            
                  await updateDoc(userDocRef, { twitterX: true, Balance: newBalancee }); // Correct updateDoc syntax
                  setBalance(newBalancee);
                  setTwitterX(true);
          
              } catch (error) {
                console.error('Error updating user document:', error);
                setDialougeBox(true);
                setDialougeBoxButton(true);
                setDialougeBoxNote('An Error Occured');
                setBalance(currentBalance); // Revert balance on error
                return;
               }
         } 
  }


  const handleTelegram = async () => {
    if (!userId) return; // Check if userId is defined before proceeding
    const currentBalance = parseInt(balance);

    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable

    if (telegramNote === 'Join') {

        try {
            const docSnap = await getDoc(userDocRef);
        
              await updateDoc(userDocRef, { telegram: false }); // Correct updateDoc syntax
              setTimeout(() => {
                setTelegramNote('Claim');
              }, 1300);
      
          } catch (error) {
            console.error('Error updating user document:', error);
            setDialougeBox(true);
            setDialougeBoxButton(true);
            setDialougeBoxNote('An Error Occured');
            setBalance(currentBalance); // Revert balance on error
            return;
           }

           
           const telegramUrl = `https://t.me/chyptochannel`;
        
        setTimeout(() => {
            window.location.href = telegramUrl; 
          }, 300);

     } else if (telegramNote === 'Claim') {
        const newBalancee = 15000 + currentBalance;

        try {
            const docSnap = await getDoc(userDocRef);
        
              await updateDoc(userDocRef, { telegram: true, Balance: newBalancee }); // Correct updateDoc syntax
              setBalance(newBalancee);
              setTelegram(true);
      
          } catch (error) {
            console.error('Error updating user document:', error);
            setDialougeBox(true);
            setDialougeBoxButton(true);
            setDialougeBoxNote('An Error Occured');
            setBalance(currentBalance); // Revert balance on error
            return;
           }
     } 
}

const handleSetTask = async () => {
 navigate('/set-task');
 console.log('clickeddd');
}

  

  if (loading) {
    return <div className='start-page-container'><div className='loader'></div></div>;
  }
  

  return (
    <div className='task-page-container'>
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

      <div className='to-set-task'>
        <div className='to-set-task-1'>Add Your Task <div className='to-set-task-1-button' onClick={handleSetTask}>Here</div></div>
        <div className='to-set-task-1'>Airdrop <div className='to-set-task-1-button'>Soon</div></div>
      </div>

      <div className='task-page-mid-container'>

          <div className='boost-page-mid-container-2'>
          <h3>Cumpolsory Tasks</h3> 

          <div className='boost-page-mid-container-2i'>
              <div className='boost-page-mid-container-2ii'>Subscribe To Youtube (25k)
                {youtube ? (
                        <div className='refer-page-done-button'>Done</div>
                ) : (
                    <button onClick={handleYoutube}>{youtubeNote}</button>
                )} </div>
          </div>
          
          <div className='boost-page-mid-container-2i'>
              <div className='boost-page-mid-container-2ii'>Follow our X (20k)
                {twitterX ? (
                        <div className='refer-page-done-button'>Done</div>
                ) : (
                    <button onClick={handleTwitterX}>{twitterXNote}</button>
                )} </div>
          </div>

          <div className='boost-page-mid-container-2i'>
              <div className='boost-page-mid-container-2ii'>Join Telegram Channel (15k)
                {telegram ? (
                        <div className='refer-page-done-button'>Done</div>
                ) : (
                    <button onClick={handleTelegram}>{telegramNote}</button>
                )} </div>
          </div>
          </div>



          <div className='task-page-mid-container-2'>
          <h3>Sponsored Tasks</h3> 
          <SponsoredTask />
          </div>
          <div className='height-100px'></div>
        
      </div>
    </div>
  );
};

export default Tasks;
 