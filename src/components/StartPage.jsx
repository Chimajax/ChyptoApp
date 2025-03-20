import React, { useEffect, useState } from 'react';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import Bowser from 'bowser';
import CoinLoadingPicture from '../assets/icons/Coin_Loading_Page1.png';
import './StartPage.css';

const StartPage = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [buttonState, setButtonState] = useState(false);
  const [buttonState1, setButtonState1] = useState(true);
  const [buttonNote, setButtonNote] = useState('Play');
  const [referTab, setReferTab] = useState(false);
  const [referLinkLoad, setReferLinkLoad] = useState(false);
  const [referLinkLoad1, setReferLinkLoad1] = useState(false);
  const [referLinkLoadNote, setReferLinkLoadNote] = useState('...Loading...');
  const [referName, setReferName] = useState('');
  const [userData, setUserData] = useState(null); // Add this state
  const [userId1, setUserId1] = useState(null); // Add this state
  const [userName, setUserName] = useState(''); // Add this state

  useEffect(() => {
    const botUsername = '@Chypto_Official_Bot';

    // Check if Telegram SDK is available
    if (window.Telegram && window.Telegram.WebApp) {
      const user = window.Telegram.WebApp.initDataUnsafe.user;

      // Log the full initData for further inspection
      console.log('Full initData:', window.Telegram.WebApp.initData);
      console.log('initDataUnsafe:', window.Telegram.WebApp.initDataUnsafe);

      // Get the referral parameter from initData
      const referralData = window.Telegram.WebApp.initDataUnsafe.start_param; // Telegram's start parameter

      console.log('Referral from initData:', referralData); // Log the referral from initData

      // Function to get query parameters
function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

// Extract and store the referral ID
const referralId = getQueryParam("start");
if (referralId) {
    console.log("Referral ID is a:", referralId);
}


      if (user) {
        setUserData(user); // Save user data to state
        // Prepare Firestore document data
        const userData = {
          first_name: user.first_name || '',
          username: user.username || '',
          last_name: user.last_name || '',
          id: user.id,
          referred_by: referralData ? referralData.replace('ref_', '') : '', // Save the referrer if present
        };

        setUserId1(user.id);
        setUserName(user.username);

        // Log userData to check if referral is being stored
        console.log('User Data:', userData);

        // Reference the user's document using their Telegram user.id
        const userDocRef = doc(db, 'users', String(user.id));

        // Check if the user document already exists
        getDoc(userDocRef)
          .then((docSnap) => {
            if (docSnap.exists()) {
              // If the document exists, update it
              updateDoc(userDocRef, userData)
                .then(() => {
                  setMessage(`Welcome Back ${user.first_name}`);
                  setButtonState(true);
                  setButtonNote('Continue');
                  setButtonState1(true);
                  setReferTab(false);
                })
                .catch((error) => {
                  console.error('Error updating user document:', error);
                  setButtonState(false);
                  setMessage('Failed to update user data.');
                });
            } else {
              // If the document does not exist, create a new one
              setDoc(userDocRef, userData)
                .then(() => {
                  setMessage(`Welcome ${user.first_name}`);
                  setButtonState(true);
                  setButtonNote('Start');
                  handleReferTab();
                  setButtonState1(false);
                  setReferTab(true);
                  
                })
                .catch((error) => {
                  console.error('Error creating user document:', error);
                  setButtonState(false);
                  setMessage('Failed to create user data.');
                });
            }
          })
          .catch((error) => {
            console.error('Error fetching user document:', error);
            setMessage('Error fetching user data.');
          });
      } else {
        setMessage('User data not found.');
      }
    } else {
      // Fallback to browser detection using Bowser if not in Telegram
      const browser = Bowser.getParser(window.navigator.userAgent);
      const browserName = browser.getBrowserName();
      setMessage(`This is not Telegram. This is ${browserName}`);
    }
  }, []);

  const handleNextPage = () => {
    if (buttonNote === 'Start') {
      navigate('/refer');
    } else {
    navigate('/home');
    }
  };

  const handleReferTab = () => {
    setReferTab(true);
  }

  const handlePasteReferLink = async () => {

    if (!referName || !userData) {
      return;
    }

    setReferTab(false);
    setReferLinkLoad(true);
    setReferLinkLoadNote('Please Wait');

    const referralPattern = /https:\/\/t\.me\/Chypto_Official_Bot\/Chypto\?start=ref_(\d+)/; // Pattern to match the referral link
    const match = referName.match(referralPattern); // Check if the input matches the pattern
  
    if (match && match[1]) {
      const referralNumber = match[1]; // Extract the referral number
      console.log('Referral number:', referralNumber);
  
      try {
        const userDocRef = doc(db, 'users', String(userData.id));
        await updateDoc(userDocRef, { referredBy: referralNumber }); // Update Firestore with the referral number
  
        console.log('Referral number saved to Firestore');
        setReferLinkLoadNote('Completed');
        setReferTab(false); // Move to the next step after referral is processed
        setReferLinkLoad1(true);
        
      } catch (error) {
        console.error('Error updating referredBy in Firestore:', error);
        setReferLinkLoadNote('An Error Occured');
        setReferLinkLoad1(true);
        setButtonState1(false);
      }
    } else {
      setReferLinkLoad(true);
      setReferLinkLoadNote('Invalid Referral Link');
      setReferLinkLoad1(true);
      setButtonState1(false);
    }

    // Call the function to send the "/start" command to the bot
    sendStartCommandToBot();
  };
  

  const handleNoReferLink = () => {
    setReferTab(false);
    setButtonState1(true);
    // Call the function to send the "/start" command to the bot
    sendStartCommandToBot();
  }

  const handleReferEnd = () => {
    if ( referLinkLoadNote === 'Completed') {
      setReferLinkLoad(false);
      setButtonState1(true);
    } else {
      setButtonState1(false);
      setReferLinkLoad(false);
      setReferTab(true);
      setReferName('');
    }
  }


  const sendStartCommandToBot  = () => {
    handleSendStartCommand1();

    setTimeout(() => {
      sendStartCommandToBot1();
    }, 1500);

  }

  const sendStartCommandToBot1  = () => {
    const telegramBotUrl = `https://t.me/Chypto_Official_Bot?start=${userId1}`;
   /// window.open(telegramBotUrl, '_blank');
   window.location.href = telegramBotUrl; 

   setTimeout(() => {
    handleSendStartCommand()
  }, 1500);
  

  };


  
  const handleSendStartCommand = async () => {
  

    const botToken = '6478165635:AAF0XtrVbQb8YptnY3jkIprdfMOwHOYcdCA';
    const referlinkkk = `https://t.me/Chypto_Official_Bot/Chypto?start=ref_${userId1}`;
    const message = `Hello @${userName}, Welcome to Chypto.\n\nUse ${referlinkkk} to Share and Earn`;
    const CHATID = userId1;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHATID,
          text: message,
        }),
      });

      const data = await response.json();
      

      if (!response.ok) {
        console.error('Response error:', data);
        throw new Error('Failed to send message to the bot');
      }

      console.log('Message sent to bot:', data);
    } catch (error) {
      console.error('Error sending /start to bot:', error.message);
    }
  };

  const handleSendStartCommand1 = async () => {
  

    const botToken = '6478165635:AAF0XtrVbQb8YptnY3jkIprdfMOwHOYcdCA';
    const message = ` @${userName}, Just Started Chypto.`;
    const CHATID = 1395717860;

    try {
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: CHATID,
          text: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Response error:', data);
        throw new Error('Failed to send message to the bot');
      }

      console.log('Message sent to bot:', data);
    } catch (error) {
      console.error('Error sending /start to bot:', error.message);
    }
  };
  
  

  

  return (
    <div className="start-page-container">

    <img src={CoinLoadingPicture} alt="Chypto" className='start-container-pic' /> 
    <div className="start-page-container-1">
      <div className="header">
        <h1>{message}</h1>
      </div>

      {referTab ? (
        <div className="start-page-refer-box-0" >
            <div className="start-page-refer-box" >
            <input
                    type="text"
                    value={referName} 
                    onChange={(e) => {
                      setReferName(e.target.value); 
                    }}
                    placeholder="Paste Referral Link"
                    className="Refer-input"
                  />
              <button className='paste-button' onClick={handlePasteReferLink}>OK</button>
              </div>

              <div className="start-page-refer-box-1" onClick={handleNoReferLink} >
                    <div className="no-refer-link">
                     i don't have a referral link
                    </div>
               </div>
        </div>
      ) : (
        <div></div>
      )}

      {referLinkLoad ? (
          <div className='refer-link-load-box'>
              {referLinkLoadNote}

              {referLinkLoad1 ? (
                  <div className='paste-button' onClick={handleReferEnd}>
                    Okay
                  </div>
              ) : ( 
                <div></div>
              )}
          </div>
      ) : (
        <div></div>
      )}

      {buttonState ? (

          buttonState1 ? (
            <button className="start-page-container-button" onClick={handleNextPage}>
              <p>{buttonNote}</p>
            </button>
          ) : (
            <div></div>
          )

      ) : (
        <div className="loader"></div>
      )}
    </div>
    </div>
  );
};

export default StartPage;
