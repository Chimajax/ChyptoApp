import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import CoinPicture from '../assets/icons/Coin_Picture_Chypto.png';
import CoinScore from '../assets/icons/coin_score_use.png';
import './DailyLogin.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [expectedBalance, setExpectedBalance] = useState(0);
  const [day, setDay] = useState(0);
  const [dayReward, setDayReward] = useState(0);
  const [nextDayRewards, setNextDayRewards] = useState(1);
  const [hours, setHours] = useState(0);
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingTime0, setRemainingTime0] = useState('');
  const [remainingTime0Box, setRemainingTime0Box] = useState(false);
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
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUsername(userData.username || 'Username');
            setBalance(userData.Balance || 0);
            

           
            
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user document:', error);
        }
      } else {
        console.error('User ID is missing');
      }
      
      
    };

    
    fetchUserData();
  }, []);

// Ensure this useEffect is inside your component
useEffect(() => {
  const checkOrCreateDailyLogin = async () => {
    const userIdFromTelegram = window.Telegram.WebApp.initDataUnsafe.user?.id;

    if (!userIdFromTelegram) {
      console.error("User ID is missing");
      return;
    }

    const dailyLoginDocRef = doc(db, "dailylogin", String(userIdFromTelegram));

    try {
      const docSnap = await getDoc(dailyLoginDocRef);
      const dailyLoginDocRef1 = docSnap.data();

      if (!docSnap.exists()) {
        // Create a new document for the user in the "dailylogin" collection
        await setDoc(dailyLoginDocRef, {
          lastChecked: new Date(), // Example field: the last login time
          day: 1,       // Example field: starting login streak
        });
        setDay(1);
        setDayReward(500);
        setRemainingTime0Box(false);
        setRemainingTime(`24:00:00`);

      } else {
        await updateDoc(dailyLoginDocRef, {
            lastChecked: new Date(), // Example field: the last login time
          });
            setDay(dailyLoginDocRef1.day || 1);

            if (!dailyLoginDocRef1.dayReward || dailyLoginDocRef1.dayReward === null) {
                setDayReward(500);
            } else {
            setDayReward(dailyLoginDocRef1.dayReward || 500);
            }

          if (!dailyLoginDocRef1.expiringTime || dailyLoginDocRef1.expiringTime === null) {
            setRemainingTime(`${24}:00:00`);
            setRemainingTime0Box(false);
            setAlarmmTime(null);
            

          } else {
            
            const expiringTime = dailyLoginDocRef1.expiringTime.toDate ? dailyLoginDocRef1.expiringTime.toDate() : new Date(dailyLoginDocRef1.expiringTime);
        setAlarmmTime(expiringTime);

          // Calculate the time remaining
          const currentTime = new Date();
          const timeDiff = expiringTime - currentTime; // Difference in milliseconds

          if (timeDiff > 0) {
            const remainingSeconds = Math.floor(timeDiff / 1000); // Convert to seconds
            setCountDown(remainingSeconds); // Set countdown
              // Calculate hours, minutes, and seconds
              const hours = Math.floor(remainingSeconds / 3600);
              const minutes = Math.floor((remainingSeconds % 3600) / 60);
              const seconds = remainingSeconds % 60;

             // Format remaining time as HH:MM:SS
             setRemainingTime0Box(true);
              setRemainingTime0(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
              setRemainingTime(`${24}:00:00`);
            } else {
                const remainingSeconds = Math.floor(timeDiff / 1000); // Convert to seconds
                setCountDown(remainingSeconds); // Set countdown
                  // Calculate hours, minutes, and seconds
                  const hours = Math.floor(remainingSeconds / 3600);
                  const minutes = Math.floor((remainingSeconds % 3600) / 60);
                  const seconds = remainingSeconds % 60;
    
                 // Format remaining time as HH:MM:SS
                 setRemainingTime0Box(false);
                 setRemainingTime0(`${24}:00:00`);
                //  setRemainingTime(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                  
            

          }

        } 


          setLoading(false);
      }
    } catch (error) {
      console.error("Error checking/creating daily login document:", error);

      setLoading(true);
      checkOrCreateDailyLogin();
    }
  };

  checkOrCreateDailyLogin();
}, []);

  

useEffect(() => {
    const updateTimers = () => {
      const now = new Date();
  
      if (alarmmTime) {
        const remainingMs = alarmmTime - now; // Remaining time in milliseconds
  
        if (remainingMs > 0) {
          // Update remainingTime0 if still within the countdown
          const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const remainingMinutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          const remainingSeconds = Math.floor((remainingMs % (1000 * 60)) / 1000);
  
          setRemainingTime0Box(true);
          setRemainingTime0(
            `${remainingHours.toString().padStart(2, '0')}:${remainingMinutes
              .toString()
              .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
          );
  
          setRemainingTime(`${24}:00:00`); // Reset `remainingTime` to 24:00:00
        } else {
          // Switch to counting `remainingTime`
          setRemainingTime0Box(false);
          setRemainingTime0('00:00:00');
  
          const elapsedMs = now - alarmmTime; // Elapsed time since grace period started
          if (elapsedMs < 24 * 60 * 60 * 1000) {
            const elapsedHours = Math.floor(elapsedMs / (1000 * 60 * 60));
            const elapsedMinutes = Math.floor((elapsedMs % (1000 * 60 * 60)) / (1000 * 60));
            const elapsedSeconds = Math.floor((elapsedMs % (1000 * 60)) / 1000);

            
  
            setRemainingTime(
              `${elapsedHours.toString().padStart(2, '0')}:${elapsedMinutes
                .toString()
                .padStart(2, '0')}:${elapsedSeconds.toString().padStart(2, '0')}`
            );
          } else {
            // Grace period over; reset the document
            resetDailyLogin();
          }
        }
      }
    };
  
    const resetDailyLogin = async () => {
      const dailyLoginDocRef = doc(db, "dailylogin", String(userId));
  
      try {
        await setDoc(dailyLoginDocRef, {
          lastChecked: new Date(),
          day: 1,
        });
        setDay(1);

        setDayReward(500);
        setRemainingTime0(`${24}:00:00`);
        setRemainingTime(`${24}:00:00`);
        setRemainingTime0Box(false);
      } catch (error) {
        console.error("Error resetting daily login document:", error);
      }
    };
  
    // Start an interval to update timers every second
    const timer = setInterval(updateTimers, 1000);
  
    // Clean up the interval on unmount
    return () => clearInterval(timer);
  }, [alarmmTime, remainingTime]);
  
  




   // Countdown effect
   useEffect(() => {
    if (countDown > 0) {
      const interval = setInterval(() => {
        setCountDown(prevCountDown => {
          return prevCountDown - 1; // Decrement the countdown
        });
      }, 1000);

      return () => clearInterval(interval); // Cleanup on unmount
    }
  }, [countDown]);



  const handleDayClick = async () => {
    setDialougeBox11(true);
    setDialougeBoxNote11('Sucess');

    setTimeout(() => {
        setDialougeBox11(false);
       }, 2200);
    
    const hoursToMs = 24 * 60 * 60 * 1000;
    const newExpiringTime = new Date(Date.now() + hoursToMs);
  
    const newDay = day + 1 > 7 ? 1 : day + 1;
    const newDayReward =
      day + 1 === 1
        ? 2000
        : day + 1 === 2
        ? 5000
        : day + 1 === 3
        ? 8000
        : day + 1 === 4
        ? 11000
        : day + 1 === 5
        ? 20000
        : day + 1 === 6
        ? 35000
        : day + 1 === 7
        ? 50000
        : day + 1 >= 7
        ? 500 : 500
  
    try {
      const userDocRef = doc(db, 'users', String(userId));
      const dailyLoginDocRef = doc(db, 'dailylogin', String(userId));
  
      await updateDoc(userDocRef, {
        Balance: balance + dayReward,
      });
  
      await updateDoc(dailyLoginDocRef, {
        expiringTime: newExpiringTime,
        day: newDay,
        dayReward: newDayReward,
      });
  
      setDay(newDay);
      setBalance(balance + dayReward);
      setAlarmmTime(newExpiringTime);
      setRemainingTime0Box(true);
    } catch (error) {
      console.error('Error updating daily login:', error);
      setDialougeBox11(true);
    setDialougeBoxNote11('Error, Please Retry');

    setTimeout(() => {
        setDialougeBox11(false);
       }, 2200);
      return;
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



      {dialougeBox11 ? (
          <div className='home-page-dialouge-box-11'>
            {dialougeBoxNote11}
          </div>
      ) : (
          <div></div>
      )}






      <div className='home-page-mid-container'>
        <div className='daily-page-sign-container'>
          <div className='level'>Day {day}</div>
          {remainingTime0Box ? (
            <div className='press'>{remainingTime0}</div> 
          ) : (
            <div className='press' onClick={handleDayClick}>Claim {dayReward}</div> 
          )}
          
        </div>

        <div className='home-page-mine-container' >
          <div className='level'>{remainingTime}</div> 
        </div>
      </div>
    </div>
  );
};

export default Home;
 