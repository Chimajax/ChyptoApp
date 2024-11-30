import React, { useEffect, useState } from 'react';
import { collection, getDocs, getDoc, doc, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import CoinScore from '../assets/icons/coin_score_use.png';
import './SponsoredTask.css';

const SponsoredTask = () => {
  const userId1 = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const userId = String(userId1);

  const [tasks, setTasks] = useState([]);
  const [infoBox, setInfoBox] = useState(null); // Store the ID of the opened info box
  const [completedTasks, setCompletedTasks] = useState([]); // Store completed task IDs
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksCollection = collection(db, 'tasks');
        const taskSnapshot = await getDocs(tasksCollection);
        const taskList = [];

        taskSnapshot.forEach((doc) => {
          const data = doc.data();

          // Iterate through each numbered field within the document
          Object.keys(data).forEach((key) => {
            const taskData = data[key];

            // Filter out tasks that the user has already completed
            if (taskData && (!taskData.doneBy || !taskData.doneBy.includes(userId))) {
              const alarmTime = taskData.alarmTime?.toDate?.() || new Date(); // Fallback to new Date() if missing/invalid
              taskList.push({
                id: `${doc.id}-${key}`,
                docId: doc.id,
                key: key,
                name: taskData.Name || 'Unnamed Task',
                note: taskData.Note || '',
                alarmTime, // Store as a Date object for sorting
                link: taskData.link || '#',
                reward: taskData.reward || 1000,
                ownerId: taskData.ownerId || null,
              });
            }
          });
        });

        // Sort tasks by alarmTime (newest first)
        taskList.sort((a, b) => b.alarmTime - a.alarmTime);

        setTasks(taskList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  const handleInfoBox = (taskId) => {
    setInfoBox(infoBox === taskId ? null : taskId);
  };

  const handleDoTask = async (task) => {
    if (!userId) {
      console.error('User ID not available');
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      const taskRef = doc(db, 'tasks', task.docId);

      // Parse the reward as an integer
      const reward = parseInt(task.reward, 10) || 1000;

      if (task.ownerId) {
        const ownerRef = doc(db, 'users', task.ownerId);
        const ownerDoc = await getDoc(ownerRef);

        if (!ownerDoc.exists()) {
          console.log('No ownerId found');
          // Add fallback reward to user's balance
          await updateDoc(userRef, {
            Balance: increment(reward),
          });
        } else {
          const ownerBalance = ownerDoc.data().Balance || 0;

          if (ownerBalance < reward) {
            console.log('Owner does not have enough balance');
            handleInfoBox(task.id);
            return; // Exit if owner doesn't have sufficient balance
          }

          // Deduct reward from owner's balance
          await updateDoc(ownerRef, {
            Balance: increment(-reward),
          });

          // Add reward to user's balance
          await updateDoc(userRef, {
            Balance: increment(reward),
          });
        }
      } else {
        console.log('No ownerId found');
        // Add fallback reward to user's balance
        await updateDoc(userRef, {
          Balance: increment(reward),
        });
      }

      // Mark the task as completed
      await updateDoc(taskRef, {
        [`${task.key}.doneBy`]: arrayUnion(userId),
        [`${task.key}.doneByCount`]: increment(1),
      });

      // Add to completed tasks and open task link
      setCompletedTasks((prevCompletedTasks) => [...prevCompletedTasks, task.id]);
      window.open(task.link, '_blank');
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  

  if (loading) {
    return <div className='just-white-text'>...Loading tasks...</div>;
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
    <div className="sponsored-task-container">
      {tasks.length > 0 ? (
        tasks.map((task) => (
          <div key={task.id} className="task-card">
            <div className="task-card-1">
                <div className="task-card-1b">{task.name}</div>
                <div className="task-card-1-image" ><img src={CoinScore} alt="Chypto" className='sponsored-task-balance-1' />{formatNumber(task.reward)}</div>
            </div>

            {!completedTasks.includes(task.id) ? (
              <div className="task-card-2" onClick={() => handleInfoBox(task.id)}>
                Start
              </div>
            ) : (
              <div className='non-sponsored-task-info-box'></div>
            )}

            {infoBox === task.id && (
              <div className='sponsored-task-info-box'>
                <div className='sponsored-task-info-box-11'>
                   <div className='sponsored-task-info-box-11-1'><h4>Note:</h4><h5 className='sponsored-task-info-box-11-1-1'>{task.note}</h5></div> 
                   <div className='sponsored-task-info-box-11-1'><h4>Receive: {task.reward} coins</h4></div>
                </div>
                <div className='sponsored-task-info-box-buttons'>
                  <div className='sponsored-task-info-box-button-1' onClick={() => handleInfoBox(task.id)}>Close</div>
                  <div className='sponsored-task-info-box-button-2' onClick={() => handleDoTask(task)}>GO</div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className='just-white-text'>
          <p>No tasks available</p>
        </div>
      )}
    </div>
  );
};

export default SponsoredTask;
