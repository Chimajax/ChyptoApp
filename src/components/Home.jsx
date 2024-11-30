import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import CoinPicture from '../assets/icons/Coin_Picture_Chypto.png';
import CoinScore from '../assets/icons/coin_score_use.png';
import './Home.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [expectedBalance, setExpectedBalance] = useState(0);
  const [level, setLevel] = useState(1);
  const [hours, setHours] = useState(0);
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [alarmmTime, setAlarmmTime] = useState('');  //alarmm was written with double m on purpose
  const [userId, setUserId] = useState(null); // Define userId as a state variable
  const [balanceDelta, setBalanceDelta] = useState(0); // new state variable
  const [dialougeBox, setDialougeBox] = useState(false);
  const [dialougeBoxExplain, setDialougeBoxExplain] = useState(false);
  const [dialougeBoxNote, setDialougeBoxNote] = useState(``);
  const [dialougeBoxButton, setDialougeBoxButton] = useState(false);
  const [dialougeBox11, setDialougeBox11] = useState(false);
  const [dialougeBoxNote11, setDialougeBoxNote11] = useState(``);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdFromTelegram = window.Telegram.WebApp.initDataUnsafe.user?.id;
      
      if (userIdFromTelegram) {
        setUserId(userIdFromTelegram); // Update userId state
        const userDocRef = doc(db, 'users', String(userIdFromTelegram));
        
        try {
          const docSnap = await getDoc(userDocRef);
          await updateDoc(userDocRef, {
            lastSeen: new Date(), // Example field: the last login time
          });

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUsername(userData.username || 'Username');
            setBalance(userData.Balance || 0);
            setExpectedBalance(userData.addBalance || 0);
            setLevel(userData.level || 1);
            setHours(userData.hours || 2);
            

            if (!userData.alarmTime || userData.alarmTime === null) {
              setRemainingTime(`${userData.hours || 2}:00:00`);
              setAlarmmTime(null);
              
              console.log('No alarm time');
            } else {
              const alarmTime = userData.alarmTime.toDate ? userData.alarmTime.toDate() : new Date(userData.alarmTime);
          setAlarmmTime(alarmTime);

            // Calculate the time remaining
            const currentTime = new Date();
            const timeDiff = alarmTime - currentTime; // Difference in milliseconds

            if (timeDiff > 0) {
              const remainingSeconds = Math.floor(timeDiff / 1000); // Convert to seconds
              setCountDown(remainingSeconds); // Set countdown
                // Calculate hours, minutes, and seconds
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
  
               // Format remaining time as HH:MM:SS
                setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
              } else {
              setRemainingTime(`${userData.hours || 2}:00:00`); // Time has passed
                

              // Delete alarmTime from Firestore
              const userDocRef = doc(db, 'users', String(userIdFromTelegram));
              try {
                await updateDoc(userDocRef, { alarmTime: null }); // Set alarmTime to null
                console.log('alarmTime deleted from Firestore');
                setAlarmmTime(null);
              } catch (error) {
                console.error('Error deleting alarmTime from Firestore:', error);
              }
              

            }
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



   // Countdown effect
   useEffect(() => {
    if (countDown > 0) {
      const interval = setInterval(() => {
        setCountDown(prevCountDown => {
          if (prevCountDown <= 1) {
            clearInterval(interval);

             // When countdown reaches zero, set alarmmTime to null and update Firestore
          const userDocRef = doc(db, 'users', String(userId));
          updateDoc(userDocRef, { alarmTime: null }) // Update Firestore
            .then(() => {
              console.log('alarmTime set to null in Firestore');
              setAlarmmTime(null); // Set alarmmTime to null
              setRemainingTime(`${hours || 2}:00:00`); // Time has passed
            })
            .catch(error => {
              console.error('Error updating alarmTime in Firestore:', error);

            });


            return 0; // Stop the countdown
          }
          return prevCountDown - 1; // Decrement the countdown
        });
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [countDown]);

  useEffect(() => {
    // Update remaining time whenever countDown changes
    const hours = Math.floor(countDown / 3600);
    const minutes = Math.floor((countDown % 3600) / 60);
    const seconds = countDown % 60;

    setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
  }, [countDown]);








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

  const handleMine1 = async () => {
    if (!userId) return; 

    if (dialougeBox === true) { 
      setDialougeBox(false);
    } else {


    if (alarmmTime !== null) {
      setDialougeBox(true);
      setDialougeBoxNote(`${expectedBalance} Coins on the Way`);
      setDialougeBoxButton(false);
      return;


    } else if (alarmmTime === null && expectedBalance !== 0) {
      setDialougeBox(true);
      setDialougeBoxNote(`claim your ${expectedBalance} Coins`);
      setDialougeBoxButton(true);
      return;


    } else if (alarmmTime === null && expectedBalance === 0) {
    const hoursToSeconds = parseInt(hours) * 60 * 60;

    //calculate money
    const additionalAmount = level * hoursToSeconds;
    const addBalance = additionalAmount;
    setExpectedBalance(addBalance);
    
    //calculate time
    const hoursToSeconds1 = parseInt(hours) * 60 * 60 * 1000;
    
    // Get the current time
    const currentTime = new Date();

  // Add the hours to the current time
  const updatedTime = new Date(currentTime.getTime() + hoursToSeconds1);

  try {
    // Reference to the user's document in Firestore (assuming user ID is stored in userData)
    const userDocRef = doc(db, 'users', String(userId));

    // Upload the updated time to Firestore as "alarmTime"
    await updateDoc(userDocRef, {
      addBalance: addBalance,
      alarmTime: updatedTime
    });



    setAlarmmTime(updatedTime);

            // Calculate the time remaining
            const currentTime = new Date();
            const timeDiff = updatedTime - currentTime; // Difference in milliseconds

            if (timeDiff > 0) {
              const remainingSeconds = Math.floor(timeDiff / 1000); // Convert to seconds
              setCountDown(remainingSeconds); // Set countdown
                // Calculate hours, minutes, and seconds
                const hours = Math.floor(remainingSeconds / 3600);
                const minutes = Math.floor((remainingSeconds % 3600) / 60);
                const seconds = remainingSeconds % 60;
  
               // Format remaining time as HH:MM:SS
                setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
              }

    setDialougeBox11(true);
    setDialougeBoxNote11('Success');
    

    setTimeout(() => {
      setDialougeBox11(false);
                }, 1000);

  } catch (error) {
    console.error('Error updating alarm time:', error);
    setDialougeBox11(true);
    setDialougeBoxNote11('An Error Occured');

    setTimeout(() => {
      setDialougeBox11(false);
                }, 1200);
    return;
            }
          }
        }
  };


  const handleClaimCoins = async () => {

    const currentBalance = parseInt(balance);
    const addingBalance = parseInt(expectedBalance);

    const toppedBalance = currentBalance + addingBalance;

    try {
      // Reference to the user's document in Firestore (assuming user ID is stored in userData)
      const userDocRef = doc(db, 'users', String(userId));
  
      // Upload the updated time to Firestore as "alarmTime"
      await updateDoc(userDocRef, {
        addBalance: 0,
        Balance: toppedBalance,
        alarmTime: null
      });


      setBalance(toppedBalance);
      setExpectedBalance(0);
      setAlarmmTime(null);
      setDialougeBox(false);
  
      setDialougeBox11(true);
      setDialougeBoxNote11('Success');
  
      setTimeout(() => {
        setDialougeBox11(false);
                  }, 1000);
  
    } catch (error) {
      setDialougeBox(false);
      console.error('Error updating alarm time:', error);
      setDialougeBox11(true);
      setDialougeBoxNote11('An Error Occured');
  
      setTimeout(() => {
        setDialougeBox11(false);
       }, 1200);

      return;
        }
      



  }


  const handleCloseBox = () => {

    setTimeout(() => {
    setDialougeBox(false);
      setDialougeBoxNote('');
      setDialougeBoxButton(false);
    }, 500);
}

  const handleDailyLogin = () => {
    navigate('/dailylogin');
  }

  const handleSetTask = () => {
    navigate('/set-task');
  }

  const handleSetComment = () => {
    navigate('/comment');
  }

  const handleDialougeBoxExplain = () => {

    setDialougeBoxExplain(!dialougeBoxExplain);

    const hoursToSeconds = parseInt(hours) * 60 * 60;

    //calculate money
    const additionalAmount = level * hoursToSeconds;
    const addBalance = additionalAmount;

    
    setDialougeBoxNote(`Your expected Earnings is ${additionalAmount}`);


    setTimeout(() => {
      setDialougeBoxNote('')
      setDialougeBoxExplain(false);
      }, 4500);
  }

  if (loading) {
    return <div className='start-page-container'><div className='loader'></div></div>;
  }

  const formatNumber = (num) => {

    if (num === undefined || num === null) {
      return 'N/A'; // Return a default value if num is undefined or null
    }
  if (typeof num !== 'number') {
      num = parseFloat(num); // Attempt to convert to a number
    }
  if (isNaN(num)) {
      return 'N/A'; // Return a default value if conversion fails
    }

    if (num >= 1000000) {
      return (num / 1000000).toFixed(0) + 'M'; // Format to millions
    } else if (num >= 1000) {
      // return (num / 1000).toFixed(0) + 'K'; // Format to thousands
      return num.toString();
    }
    return num.toString(); // Return as is for numbers less than 1000
  };

  return (
    <div className='home-page-container'>
      <div className='home-page-container-top'>
        <div className='home-page-container-top-1'>
          <h3>@{username}</h3>
        </div>
          <div className='home-page-container-balance'>
            <img src={CoinScore} alt="Chypto" className='home-page-container-balance-1' /> 
            <div className='home-page-container-balance-2'>{formatNumber(balance)}</div>
          </div>
        </div>

        <div className='home-page-pre-mid-container'>
            <div className='home-page-pre-mid-container-1' onClick={handleDailyLogin}>
              Daily Login
            </div>
            <div className='home-page-pre-mid-container-1' onClick={handleDialougeBoxExplain}>
              Earning Info
            </div>
            <div className='home-page-pre-mid-container-1' onClick={handleSetTask}>
              + Task
            </div>
            <div className='home-page-pre-mid-container-1' onClick={handleSetComment}>
              + Comment
            </div>
            <div className='home-page-pre-mid-container-1'>
              Airdrop
            </div>
        </div>

        {dialougeBoxExplain ? (
        <div className='home-page-dialouge-box'>
           <div className='home-page-dialouge-box-note-1'>
              <div>Current Level = {level}</div>
              <div>Current Hours = {hours}</div>

              <div>level x Hours(convert to Seconds):</div>

              <div>{dialougeBoxNote}</div>
            </div>
        </div>
      ) : (
        <div></div>
      )}

      {dialougeBox ? (
        <div className='home-page-dialouge-box'>
           <div className='home-page-dialouge-box-note'>
              {dialougeBoxNote}
            </div>

          {dialougeBoxButton ? (
            <div className='home-page-dialouge-box-button' onClick={handleClaimCoins}>
                Claim
            </div>
          ) : (
            <div className='home-page-dialouge-box-button' onClick={handleCloseBox}>
                Remaining {remainingTime}s
            </div>
          )}
        </div>
      ) : (
        <div></div>
      )}



      {dialougeBox11 ? (
          <div className='home-page-dialouge-box-11'>
            {dialougeBoxNote11}
          </div>
      ) : (
          <div></div>
      )}






      <div className='home-page-mid-container'>
        <div className='home-page-sign-container' onClick={handleTap}>
        <img src={CoinPicture} alt="Chypto" className='home-page-sign-container-1' />
          <div className='level'>{level}X</div> 
        </div>

        <div className='home-page-mine-container' onClick={handleMine1}>
          <div className='level'>{remainingTime}</div> 
        </div>
      </div>
    </div>
  );
};

export default Home;
 