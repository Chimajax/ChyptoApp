import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import CoinPicture from '../assets/icons/Coin_Picture_Chypto.png';
import CoinScore from '../assets/icons/coin_score_use.png';
import './Comment.css';

const Home = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [comment, setComment] = useState('');
const [sendNote, setSendNote] = useState('Send');
  const [day, setDay] = useState(0);

  const [nextDayRewards, setNextDayRewards] = useState(1);
  const [loading, setLoading] = useState(true);
  const [remainingTime0, setRemainingTime0] = useState('');
  const [remainingTime0Box, setRemainingTime0Box] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [alarmmTime, setAlarmmTime] = useState('');  //alarmm was written with double m on purpose
  const [userId, setUserId] = useState(null); // Define userId as a state variable
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
      
      setLoading(false);
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

    const commentDocRef = doc(db, "comments", String(userIdFromTelegram));

    try {
      const docSnap = await getDoc(commentDocRef);
      const commentDocRef1 = docSnap.data();

      if (!docSnap.exists()) {
        // Create a new document for the user in the "dailylogin" collection
        await setDoc(commentDocRef, {
          lastChecked: new Date(), // Example field: the last login time
        });
        

      } else {
        await updateDoc(commentDocRef, {
            lastChecked: new Date(), // Example field: the last login time
          });


      
      }
    } catch (error) {
      console.error("Error checking/creating daily login document:", error);

      setLoading(true);
      checkOrCreateDailyLogin();
    }
  };

  setTimeout(() => {
  checkOrCreateDailyLogin();
    }, 3000);
}, []);



  const handleSendComment = async () => {
  if (!userId || !comment.trim()) {
    console.error("User ID or comment is missing");
    return;
  }
  setSendNote('Sending...');

  const commentDocRef = doc(db, "comments", String(userId));
  const userDocRef = doc(db, "users", String(userId));

  try {
    // Fetch the existing comments
    const commentDocSnap = await getDoc(commentDocRef);
    let commentsArray = [];

    if (commentDocSnap.exists()) {
      commentsArray = commentDocSnap.data().messages || [];
    }

    // Check the number of existing messages
    const messageNumber = commentsArray.length + 1;
    const newComment = {
      username: username,
      comment: comment,
      time: new Date(),
      messageNumber: messageNumber > 7 ? "return" : messageNumber,
      task: false,
      sender: true,
      admin: false,
    };

    // Add the new comment
    if (messageNumber <= 7) {
      commentsArray.push(newComment);
      setSendNote('...Sending...');
    } else {
      console.log("Maximum message limit reached");
      setSendNote('Limit Reached');
      return;
    }

    // Update the "comments" collection
    await setDoc(commentDocRef, { messages: commentsArray });

    // Update the user's balance
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const currentBalance = userDocSnap.data().Balance || 0;
      const commentBalance = currentBalance + 500;
      await updateDoc(userDocRef, {
        Balance: commentBalance,
      });
      setBalance(commentBalance);
    } else {
      console.error("User document does not exist");
    }

    // Reset the comment input
    setComment("");
    console.log("Comment sent successfully");
    setSendNote('SENT');
  } catch (error) {
    console.error("Error sending comment:", error);
    setSendNote('Error, Retry');
  }
};



 

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
        <div className='comment-dialouge-box-1'>
          <div className='comment-dialouge-box-11'>
            {dialougeBoxNote11}
          </div>
          <div className='comment-dialouge-box-11'>
                OKK
            </div>
          </div>
      ) : (
          <div></div>
      )}






        <div className='comment-mid-container'>
     
        <div className="comment-message-div">
            <div className="comment-message-div-1">
                <textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => {setComment(e.target.value), setSendNote('Send')}}
                />
            </div>
            <div className="comment-message-div-2">
                <button onClick={handleSendComment}>{sendNote}</button>
            </div>
              </div>


      </div>
    </div>
  );
};

export default Home;
 