import React, { useEffect, useState } from 'react';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Ensure this is correctly configured
import { useNavigate } from 'react-router-dom';
import CoinScore from '../assets/icons/coin_score_use.png';
import './Refer.css';

const Refer = () => {
  const [username, setUsername] = useState('');
  const [balance, setBalance] = useState(0);
  const [referred, setReferred] = useState(false);
  const [referredId, setReferredId] = useState(null);
  const [referredIdHelp, setReferredIdHelp] = useState(false);
  const [referredIdName, setReferredIdName] = useState(null);
  const [referLinkLoad, setReferLinkLoad] = useState(false);
  const [referLinkLoadNote, setReferLinkLoadNote] = useState('...Loading...');
  const [referLinkLoad1, setReferLinkLoad1] = useState(false);
  const [userData1, setUserData1] = useState(null);
  const [referName, setReferName] = useState('');
  const [hours, setHours] = useState(0);
  const [countDown, setCountDown] = useState(0);
  const [loading, setLoading] = useState(true);
  const [remainingTime, setRemainingTime] = useState('');
  const [userId, setUserId] = useState(null); // Define userId as a state variable
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [referralsNumber, setReferralsNumber] = useState(0);
  const [referralUserNames, setReferralUserNames] = useState({});
  const [referralBalance, setReferralBalance] = useState('X');

  useEffect(() => {
    const fetchUserData = async () => {
      const userIdFromTelegram = window.Telegram.WebApp.initDataUnsafe.user?.id;
      
      if (userIdFromTelegram) {
        setUserId(userIdFromTelegram); // Update userId state
        const userDocRef = doc(db, 'users', String(userIdFromTelegram));
        setUserData1(userIdFromTelegram);
        
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUsername(userData.username || '@Username');
            setBalance(userData.Balance || 0);
            setHours(userData.hours || 3);
            setReferrals(userData.referrals || []); 

            if (!userData.referredBy || userData.referredBy === null) {
              setReferred(false);
            } else if (userData.referredBy || userData.referredBy !== null) {
              setReferred(true);
              console.log(`you were referred by ${userData.referredBy}`);
              setReferredId(`${userData.referredBy}`);
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
    getReferredByUsername();
  }, [referred]);

  useEffect(() => {
  // Fetch referred username whenever referredId changes
  if (referredId) {
    getReferredByUsername();
  }
}, [referredId]);

useEffect(() => {
  // Fetch usernames for each referral when referrals change
  const fetchReferralUserNames = async () => {
    const usernames = {};
    const RBalance = {};
    for (const referralId of referrals) {
      const userDocRef = doc(db, 'users', String(referralId));
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
        usernames[referralId] = `@${userData.username}` || referralId; // Fallback to ID if username is not found
        RBalance[referralId] = userData.Balance || 0;
      } else {
        usernames[referralId] = '@Username' || referralId; // Fallback to ID if user document does not exist
        RBalance[referralId] = 1000;
      }
    }
    setReferralUserNames(usernames);
    setReferralBalance(RBalance)
  };

  if (referrals.length > 0) {
    fetchReferralUserNames();
    setReferralsNumber(referrals.length);

  }
}, [referrals]);


  const getReferredByUsername = async () => {
    setReferredIdName(`...Loading...`);
    setReferredIdHelp(false);
    if (!referredId || referredId === null) {
      console.log('No referredById found');
      setReferred(false);
    }
  
    try {
      // Query the 'users' collection where the document id matches the referredId
      const q = query(collection(db, 'users'), where('__name__', '==', referredId));
      
      // Get the documents from the query
      const querySnapshot = await getDocs(q);

  
      if (!querySnapshot.empty) {
        // Assume that only one user is referred by this ID
        const referredUserDoc = querySnapshot.docs[0];
        const referredUserData = referredUserDoc.data();
        const referredUsername = referredUserData.username || 'Unknown';
        const referredId1 = referredUserData.id;


        if ( referredId1 === userData1 ) {
          setReferredIdName(`'Yourself', Change needed`);
          setReferredIdHelp(true);
          return;
  
        }

        setReferredIdName(`@${referredUsername}`);
        setReferredIdHelp(false);
  
        // pay the referred username
        getReferredByUsernamePaid();
      } else if (querySnapshot.empty) {
        console.log('No user found with the referredById');
        setReferredIdName(`'Not Found'`);
        setReferredIdHelp(true);
         }
    } catch (error) {
     // console.error('Error fetching referred username:', error);
      console.log('Error fetching referred username:');
      setReferredIdName(`'Error Processing'`);
      setReferredIdHelp(true);
    }
  };


  const getReferredByUsernamePaid = async () => {
    console.log('starting payment');
  
    const userDocRef = doc(db, 'users', String(userId));
  
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const userData = docSnap.data();
  
        // Check if already paid
        if (userData.referredByPaid) {
          console.log(`Already Paid: ${userData.referredByPaid}`);
          return;
        }
  
        // Pay the referring user
        try {
          // Query the 'users' collection where the document id matches the referredId
          const q = query(collection(db, 'users'), where('__name__', '==', referredId));
  
          // Get the documents from the query
          const querySnapshot = await getDocs(q);
  
          if (!querySnapshot.empty) {
            // Assume only one user is referred by this ID
            const referredUserDoc = querySnapshot.docs[0];
            const referredUserData = referredUserDoc.data();
            const referredUserDocRef = referredUserDoc.ref;  // Get the document reference
  
            const referredBalance = parseInt(referredUserData.Balance) || 0;
            const newReferredBalance = referredBalance + 25000;
  
            const currentReferrals = referredUserData.referrals || [];
                    if (!currentReferrals.includes(userId)) {
                        // Update referred user's balance and referrals list
                        await updateDoc(referredUserDocRef, {
                            Balance: newReferredBalance,
                            referrals: [...currentReferrals, userId],  // Append the current userId
                        });
                        console.log('Paid referring user and updated referrals');
                    } else {
                        console.log('User  ID already in referrals, no update needed');
                    }
          } else {
            console.log('No referred user found');
          }
        } catch (error) {
          console.error('Failed to pay referring user:', error);
        }
  
        // Pay the current user
        const oldUserBalance = balance;
        const newUserBalance = parseInt(oldUserBalance) + 15000;
  
        try {
          await updateDoc(userDocRef, {
            Balance: newUserBalance,
            referredByPaid: true,  // Mark as paid
          });
          console.log('Paid current user');
          setBalance(newUserBalance);
        } catch (error) {
          console.error('Failed to pay current user:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
    }
  };
  



  const handlePasteReferLink = async () => {
    setReferLinkLoad1(false);
    if (!referName) {
      return;
    }

    setReferLinkLoad(true);
    
    setReferLinkLoadNote('...Please Wait...');

    const referralPattern = /https:\/\/t\.me\/Chypto_Official_Bot\/Chypto\?start=ref_(\d+)/; // Pattern to match the referral link
    const match = referName.match(referralPattern); // Check if the input matches the pattern
  
    if (match && match[1]) {
      const referralNumber = match[1]; // Extract the referral number
      console.log('Referral number:', referralNumber);
  
      try {
        const userDocRef = doc(db, 'users', String(userData1));
        await updateDoc(userDocRef, { referredBy: referralNumber }); // Update Firestore with the referral number
  
        console.log('Referral number saved to Firestore');
        setReferredId(referralNumber); // Update referredId state
        setReferLinkLoad(true);
        setReferLinkLoadNote('Completed');
        setReferLinkLoad1(true);
        
      } catch (error) {
        console.error('Error updating referredBy in Firestore:', error);
        setReferLinkLoadNote('An Error Occured');
        setReferLinkLoad1(true);
      }
    } else {
      setReferLinkLoad(true);
      
      setReferLinkLoadNote('...Please Wait...');
      setTimeout(() => {
        setReferLinkLoadNote('Invalid Referral Link');
        setReferLinkLoad1(true);
      }, 2500);
    }
  };

  const handleCloseReferLinkLoad = () => {

    if (referLinkLoadNote === 'Completed') {
      setReferred(true);
      setReferLinkLoad(false);
      
    } else {
    setReferLinkLoad(false);
    setReferName('');
    console.log('box closed');
    }
    
  }


  const handleResetReferralLink = async () => {
    try {
      const userDocRef = doc(db, 'users', String(userData1));
      await updateDoc(userDocRef, { referredBy: null }); // Update Firestore with the referral number

       setTimeout(() => {
        setReferred(false);
        setReferName(''); 
      }, 1500);
      
    } catch (error) {
      return;
    }
  };

  
  const handleCopyReferralLink = () => {
    const linkk = `Start Playing Chypto. Copy My Referral link: https://t.me/Chypto_Official_Bot/Chypto?start=ref_${userData1}`;
  
    
      // Fallback for older browsers or if Clipboard API is blocked
      const textArea = document.createElement('textarea');
      textArea.value = linkk;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setReferLinkLoad(true);
        setReferLinkLoad1(false);
        setReferLinkLoadNote('Copied');

        setTimeout(() => {
          setReferLinkLoad(false);
        }, 1500);

      } catch (error) {
        console.error('Failed to copy referral link:', error);
        setReferLinkLoad(true);
        setReferLinkLoad1(false);
        setReferLinkLoadNote('Failed to Copy');

        setTimeout(() => {
          setReferLinkLoad(false);
        }, 1500);
      }
      document.body.removeChild(textArea);
    
  };

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
      return (num / 1000000).toFixed(0) + 'm'; // Format to millions
    } else if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'k'; // Format to thousands
    }
    return num.toString(); // Return as is for numbers less than 1000
  };
  



  if (loading) {
    return <div className='start-page-container'><div className='loader'></div></div>;
  }

  return (
    <div className='refer-page-container'>
      <div className='home-page-container-balance'>
          <img src={CoinScore} alt="Chypto" className='home-page-container-balance-1' /> 
          <div className='home-page-container-balance-2'>{balance}</div>
        </div>

      <div className="your-referral-link">
          <div className="your-referral-link-1">
          Referral link: https://t.me/Chypto_Official_Bot/Chypto?start=ref_{userData1}
          </div>
          <div className="your-referral-link-2" onClick={handleCopyReferralLink}>
            Copy
          </div>
      </div>

      {referred ? (
        <div className="start-page-refer-box-0">
          You Were Referred By {referredIdName}

          {referredIdHelp ? (
            <div className="no-refer-link" onClick={handleResetReferralLink}>
            reset referral link
           </div>
          ) : (
            <div></div>
          )}
        </div>
      ) : (
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

              <div className="start-page-refer-box-info"> Paste Your Referrers link above</div>

             {/* <div className="start-page-refer-box-1" onClick={handleNoReferLink} >
                    <div className="no-refer-link">
                     i don't have a referral link
                    </div>
               </div> */}
        </div>
      )}

      {referLinkLoad ? (
        <div className='referpage-link-load-box'>
          {referLinkLoadNote} 

          {referLinkLoad1 ? (
            <div className='refer-paste-button' onClick={handleCloseReferLinkLoad}> <div className='refer-paste-button-h4'>OK</div></div>
          ) : (
            <div></div>
          )}

        </div>
      ) : (
        <div></div>
      )}

      <div className='refer-page-mid-container'>

      <div className='refer-page-mid-container-0'>My Referrals: {formatNumber(referralsNumber)}</div>

      <div className='refer-page-mid-container-1'>
      {referrals.length > 0 ? (
        referrals.map((referralId, index) => (
            <div className='refer-page-mid-container-1i' key={index}>
              <div className='refer-page-mid-container-1ball' ></div>
                  {referralUserNames[referralId] || referralId} {/* Display username or fallback to ID */}
                  <div className='refer-page-mid-container-1ii'> {formatNumber(referralBalance[referralId])} </div>
              </div>
          ))
      ) : (
        <div className='refer-page-mid-container-1b'>
          <p>No referrals found.</p>
        <div className="your-referral-link-2" onClick={handleCopyReferralLink}>
            Copy & Share Referral Link
          </div>
        </div>
      )}
    </div>
         
      </div>
    </div>
  );
};

export default Refer;
 