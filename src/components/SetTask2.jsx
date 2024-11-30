import React, { useState, useEffect } from 'react';
import { doc, setDoc, updateDoc, getDoc, deleteField } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import './SetTask.css';

const SetTask = () => {
  const userId1 = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const userId = String(userId1);

  const [tasks, setTasks] = useState({});
  const [currentTask, setCurrentTask] = useState(null);
  const [name, setName] = useState('');
  const [note, setNote] = useState('');
  const [link, setLink] = useState('');
  const [addingBox, setAddingBox] = useState(false);
  const [loading, setLoading] = useState(false);
  const [taskAdded, setTaskAdded] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const userDocRef = doc(db, 'tasks', userId);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setTasks(userDoc.data());
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, [userId]);

  const handleAddTaskBox = () => {
    setCurrentTask(null); // Reset to add a new task
    setName('');
    setNote('');
    setLink('');
    setAddingBox(addingBox === true ? false : true);
  };

  const handleShowTaskBox = (taskNumber) => {
    const taskData = tasks[taskNumber];
    if (taskData) {
      setCurrentTask(taskNumber);
      setName(taskData.Name || '');
      setNote(taskData.Note || '');
      setLink(taskData.link || '');
      setAddingBox(addingBox === true ? false : true);
    }
  };

  const handleAddOrUpdateTask = async (e) => {
    e.preventDefault();
    if (!name || !note || !link) {
      return;
    }

    setLoading(true);

    try {
      const userDocRef = doc(db, 'tasks', userId);
      const taskKey = currentTask || Object.keys(tasks).length + 1;

      const updatedTask = {
        Name: name,
        Note: note,
        link: link,
        alarmTime: new Date(),
        doneBy: tasks[taskKey]?.doneBy || [], // Preserve existing doneBy array if updating
      };

      await updateDoc(userDocRef, {
        [`${taskKey}`]: updatedTask,
      });

      setTasks((prevTasks) => ({
        ...prevTasks,
        [taskKey]: updatedTask,
      }));

      setTaskAdded(true);
      setName('');
      setNote('');
      setLink('');
      setAddingBox(false);
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
        [taskNumber]: deleteField(), // Use deleteField() to remove the field
      });
  
      // Update local state
      setTasks((prevTasks) => {
        const updatedTasks = { ...prevTasks };
        delete updatedTasks[taskNumber];
        return updatedTasks;
      });
  
      setAddingBox(false);
    } catch (error) {
      console.error('Error removing task:', error);
    }
  };
  

  return (
    <div className="set-task-container">
      <h2>Your Tasks</h2>
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
            onClick={() => handleShowTaskBox(taskNumber)}
          >
            {taskNumber}
          </div>
        ))}

        {/* Form for adding or updating task */}
        {addingBox && (
            <div className="adding-box">
              <form onSubmit={handleAddOrUpdateTask} className="task-form">
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
                  <label htmlFor="link">Task Link</label>
                  <input
                    type="url"
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                  />
                </div>

                {/* Add or Update Task Button */}
                <button type="submit" disabled={loading}>
                  {loading ? 'Processing...' : currentTask ? 'Update Task' : 'Add Task'}
                </button>

                {/* Remove Task Button */}
                {currentTask && (
                  <button
                    type="button"
                    onClick={() => handleRemoveTask(currentTask)}
                    className="remove-task-button"
                  >
                    Remove Task
                  </button>
                )}
              </form>
            </div>
          )}


        {/* Success message */}
        {taskAdded && !loading && (
          <div className="task-success-message">
            Task successfully {currentTask ? 'updated' : 'added'}!
          </div>
        )}
      </div>
    </div>
  );
};

export default SetTask;
