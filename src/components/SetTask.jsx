import React, { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CoinScore from '../assets/icons/coin_score_use.png';
import './SetTask.css';

const SetTask = () => {
  const userId1 = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const userId = String(userId1);

  const [tasks, setTasks] = useState({});
  const [currentTask, setCurrentTask] = useState(null);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [reward, setReward] = useState(5000);
  const [addingBox, setAddingBox] = useState(false);
  const [updatingBox, setUpdatingBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);
  const [socialBox, setSocialBox] = useState(false);
  const [taskNewsBox, setTaskNewsBox] = useState(false);
  const [taskNewsBoxNote, setTaskNewsBoxNote] = useState('');
  const [clickCount, setClickCount] = useState(0);

  const [chargingPrice, setChargingPrice] = useState(100000);
  const [updatingPrice, setUpdatingPrice] = useState(20000);
  const [balance, setBalance] = useState(0);
  const [level, setLevel] = useState(1);
  const [hours, setHours] = useState(0);

  const [youtube, setYoutube] = useState(false);
  const [twitterX, setTwitterX] = useState(false);
  const [telegram, setTelegram] = useState(false);



  useEffect(() => {
    const fetchUserData = async () => {
      const userIdFromTelegram = window.Telegram.WebApp.initDataUnsafe.user?.id;
      
      if (userIdFromTelegram) {
        const userDocRef = doc(db, 'users', String(userIdFromTelegram));
        
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setBalance(userData.Balance || 0);
            setLevel(userData.level || 1);
            setHours(userData.hours || 2);

            setYoutube(userData.youtube);
            setTwitterX(userData.twitterX);
            setTelegram(userData.telegram);
            
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
    const fetchTasks = async () => {
      try {
        const userDocRef = doc(db, 'tasks', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setTasks(userDoc.data());
        } else {setDoc(userDocRef);}
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [userId]);

  const handleAddTaskBox = () => {
    if (youtube === true && twitterX === true && telegram === true) {
    handleAddTaskBox1();
    } else {
      setSocialBox(true);

      setTimeout(() => {
        setSocialBox(false);
                  }, 2000);
      return;
    }
   }

  const handleAddTaskBox1 = () => {
    setCurrentTask(null); // Reset for adding a new task
    setName('');
    setNote('');
    setLink('');
    setReward(5000);
    setAddingBox(!addingBox);
    setUpdatingBox(false); // Close the updating box if open
  };

  const handleUpdateTaskBox = (taskNumber) => {
    const taskData = tasks[taskNumber];

    if (taskData) {
      setCurrentTask(taskNumber);
      setName(taskData.Name || '');
      setNote(taskData.Note || '');
      setLink(taskData.link || '');
      setReward(taskData.reward || 5000);
      setClickCount(taskData.doneByCount || 0);
      setAddingBox(false); // Close the adding box if open
      setUpdatingBox(!updatingBox);
    }
  };


  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!name || !note || !link || !reward) {
      return;
    }
    

    if (balance > chargingPrice) {
      setLoading(true);
    const newPaidBalance = balance - chargingPrice; 

    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable
      handleAddTask1(e);
    try {
      const docSnap = await getDoc(userDocRef);
  
        await updateDoc(userDocRef, { Balance: newPaidBalance }); // Correct updateDoc syntax
        setBalance(newPaidBalance);

    } catch (error) {
      setAddingBox(false);
      setTaskNewsBox(true);
      setTaskNewsBoxNote('An Error Occured, Please try Again');
      setTimeout(() => {
        setTaskNewsBox(false);
                  }, 2000);
      return;
     }

    
    } else {
      setAddingBox(false);
      const remainderrr = chargingPrice - balance;

      setTaskNewsBox(true);
      setTaskNewsBoxNote(`Not Enough Balance, Remaining ${remainderrr}`);
      setTimeout(() => {
        setTaskNewsBox(false);
                  }, 2000);
      return;

    }

  }


  const handleAddTask1 = async (e) => {
    e.preventDefault();
    if (!name || !note || !link) {
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, 'tasks', userId);
      const taskKey = Object.keys(tasks).length + 1;
      const rewarding = parseInt(reward);

      const newTask = {
        Name: name,
        Note: note,
        link: link,
        reward: rewarding,
        alarmTime: new Date(),
        doneBy: [], // Initialize as an empty array
        ownerId: userId,
      };

      await updateDoc(userDocRef, {
        [`${taskKey}`]: newTask,
      });

      setTasks((prevTasks) => ({
        ...prevTasks,
        [taskKey]: newTask,
      }));

      setTaskAdded(true);
      setName('');
      setNote('');
      setLink('');
      setReward(5000);
      setAddingBox(false);
    } catch (error) {
      console.error('Error adding task:', error);
      return;
    } finally {
      setLoading(false);
      //off the box
    setAddingBox(false);
    }
    
  };


  const handleUpdateTask = async (e) => {
    e.preventDefault();
    if (!name || !note || !link || !currentTask || !reward) {
      return;
    }

    if (balance > updatingPrice) {
      setLoading(true);
    const newPaidBalance = balance - updatingPrice; 

    const userDocRef = doc(db, 'users', String(userId)); // Use the userId state variable
    try {
      const docSnap = await getDoc(userDocRef);
  
        await updateDoc(userDocRef, { Balance: newPaidBalance }); // Correct updateDoc syntax
        setBalance(newPaidBalance);

    } catch (error) {
      setUpdatingBox(false);
      setTaskNewsBox(true);
      setTaskNewsBoxNote('An Error Occured, Please try Again');
      setTimeout(() => {
        setTaskNewsBox(false);
                  }, 2000);
      return;
     }

     handleUpdateTask1(e);
    
    } else {
      setUpdatingBox(false);
      const remainderrr = updatingPrice - balance;

      setTaskNewsBox(true);
      setTaskNewsBoxNote(`Not Enough Balance, Remaining ${remainderrr}`);
      setTimeout(() => {
        setTaskNewsBox(false);
                  }, 2000);
      return;

    }


  }


  const handleUpdateTask1 = async (e) => {
    e.preventDefault();
    if (!name || !note || !link || !currentTask) {
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, 'tasks', userId);

      const updatedTask = {
        ...tasks[currentTask],
        Name: name,
        Note: note,
        link: link,
        reward: reward,
      };

      await updateDoc(userDocRef, {
        [`${currentTask}`]: updatedTask,
      });

      setTasks((prevTasks) => ({
        ...prevTasks,
        [currentTask]: updatedTask,
      }));

      setTaskAdded(true);
      setUpdatingBox(false);
    } catch (error) {
      console.error('Error updating task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTask = async (taskNumber) => {
    if (!taskNumber) return;

    try {
      const userDocRef = doc(db, 'tasks', userId);

      // Remove the task by updating Firestore
      await updateDoc(userDocRef, {
        [taskNumber]: deleteField(),
      });

      // Update local state
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        delete updatedTasks[taskNumber];
        return updatedTasks;
      });

      setUpdatingBox(false);
    } catch (error) {
      console.error('Error removing task:', error);
    }
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

  return (
    <div className="set-task-container">
      <h2>Your Tasks</h2>
      <div className='home-page-container-balance'>
          <img src={CoinScore} alt="Chypto" className='home-page-container-balance-1' /> 
          <div className='home-page-container-balance-2'>{balance.toFixed(1)}</div>
        </div>
      <div className="set-task-container-1">
        {/* Button to add new task */}
        <div className="add-box" onClick={handleAddTaskBox}>
          +
        </div>

        {/* Buttons for existing tasks */}
        {Object.keys(tasks).map((taskNumber) => (
          <div
            key={taskNumber}
            className="add-box"
            onClick={() => handleUpdateTaskBox(taskNumber)}
          >
            {taskNumber}
          </div>
        ))}

        {socialBox && (
          <div className='home-page-dialouge-box-11'>
            <h4>Make Sure You Are Following Our Socials</h4>
          </div>
        )}

        {taskNewsBox && (
          <div className='home-page-dialouge-box-11'>
            {taskNewsBoxNote}
          </div>
        )}

        {/* Form for adding tasks */}
        {addingBox && (
          <div className="adding-box">
            <form onSubmit={handleAddTask} className="task-form">
              <div className="form-field">
                <label htmlFor="name">Task Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="note">Task Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="reward">Task Reward</label>
                <input
                  type="number"
                  id="reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="link">Task Link</label>
                <input
                  type="url"
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>

              <button type="submit" disabled={loading}>
                {loading ? 'Adding...' : `Add Task @${formatNumber(chargingPrice)}`}
              </button>
            </form>
          </div>
        )}

        {/* Form for updating tasks */}
        {updatingBox && (
          <div className="updating-box">
            <form onSubmit={handleUpdateTask} className="task-form">
              <div className="form-field">
                <label htmlFor="name">Task Name</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="note">Task Note</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="reward">Task Reward</label>
                <input
                  type="number"
                  id="reward"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              </div>

              <div className="form-field">
                <label htmlFor="link">Task Link</label>
                <input
                  type="url"
                  id="link"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                />
              </div>


              <div className="form-field">
                <label htmlFor="link">Link Clicks</label>
                {clickCount}
              </div>



              <button type="submit" disabled={loading}>
                {loading ? 'Updating...' : `Update Task @${formatNumber(updatingPrice)}`}
              </button>

              <button
                type="button"
                onClick={() => handleRemoveTask(currentTask)}
                className="remove-task-button"
              >
                Remove Task
              </button>
            </form>
          </div>
        )}

        {/* Success message */}
        {taskAdded && !loading && (
          <div className="task-success-message">
            Task successfully {addingBox ? 'added' : 'updated'}!
          </div>
        )}
      </div>
    </div>
  );
};  

export default SetTask;
