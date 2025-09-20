// // components/Timer.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { supabase } from "@/lib/supabase";

// interface TimerProps {
//   onActivityCreated?: () => void;
// }

// export default function Timer({ onActivityCreated }: TimerProps) {
//   const [isRunning, setIsRunning] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const [startTime, setStartTime] = useState<Date | null>(null); // State to hold the exact start time
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   // Load saved state from sessionStorage on component mount
//   useEffect(() => {
//     const savedState = sessionStorage.getItem('timerState');
//     if (savedState) {
//       const { isRunning: savedIsRunning, elapsedTime: savedElapsedTime, startTime: savedStartTime, title: savedTitle, category: savedCategory, description: savedDescription } = JSON.parse(savedState);
//       setIsRunning(savedIsRunning);
//       setElapsedTime(savedElapsedTime);
//       setStartTime(savedStartTime ? new Date(savedStartTime) : null);
//       setTitle(savedTitle || "");
//       setCategory(savedCategory || "");
//       setDescription(savedDescription || "");
//     }
//   }, []);

//   // Save state to sessionStorage whenever it changes
//   useEffect(() => {
//     const timerState = {
//       isRunning,
//       elapsedTime,
//       startTime: startTime ? startTime.toISOString() : null,
//       title,
//       category,
//       description
//     };
//     sessionStorage.setItem('timerState', JSON.stringify(timerState));
//   }, [isRunning, elapsedTime, startTime, title, category, description]);

//   // Timer logic to update elapsed time
//   useEffect(() => {
//     let interval: NodeJS.Timeout;

//     if (isRunning) {
//       interval = setInterval(() => {
//         setElapsedTime(prev => prev + 1);
//       }, 1000);
//     }

//     return () => clearInterval(interval);
//   }, [isRunning]);

//   // Formats the duration to HH:MM:SS
//   const formatTime = (seconds: number) => {
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     const secs = seconds % 60;
    
//     return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const handleStart = () => {
//     if (!isRunning) {
//       setStartTime(new Date(Date.now() - elapsedTime * 1000)); // Set start time, accounting for any paused duration
//       setIsRunning(true);
//     }
//   };

//   const handlePause = () => {
//     setIsRunning(false);
//   };

//   const handleReset = () => {
//     setIsRunning(false);
//     setElapsedTime(0);
//     setStartTime(null);
//     setTitle("");
//     setCategory("");
//     setDescription("");
//     sessionStorage.removeItem('timerState');
//   };

//   const handleStop = async () => {
//     if (!startTime) {
//       alert("Please start the timer first!");
//       return;
//     }

//     if (!title.trim()) {
//       alert("Please enter a title for this activity!");
//       return;
//     }

//     setIsSubmitting(true);
//     const endTime = new Date(); // Capture the exact end time now

//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         alert("You must be logged in to save activities!");
//         return;
//       }

//       const { error } = await supabase.from('activities').insert([
//         {
//           title: title.trim(),
//           category: category.trim() || null,
//           description: description.trim() || null,
//           start_time: startTime.toISOString(), // Use the precise start time
//           end_time: endTime.toISOString(),      // Use the precise end time
//           date: endTime.toISOString().split('T')[0],
//           user_id: user.id
//         }
//       ]);

//       if (error) {
//         throw error;
//       }

//       alert("Activity saved successfully!");
//       handleReset();
//       if (onActivityCreated) {
//         onActivityCreated();
//       }
//     } catch (error) {
//       console.error("Error saving activity:", error);
//       alert("Error saving activity. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         Activity Timer
//       </h2>

//       <div className="text-center mb-6">
//         <div className="text-3xl font-mono font-bold text-blue-600 mb-2">
//           {formatTime(elapsedTime)}
//         </div>
//         <div className="text-sm text-gray-500">Elapsed Time</div>
//       </div>

//       <div className="space-y-4 mb-6">
//         <div>
//           <label htmlFor="timer-title" className="block text-sm font-medium text-gray-700 mb-1">
//             Activity Title *
//           </label>
//           <input
//             id="timer-title"
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="What are you working on?"
//             required
//           />
//         </div>

//         <div>
//           <label htmlFor="timer-category" className="block text-sm font-medium text-gray-700 mb-1">
//             Category
//           </label>
//           <select
//             id="timer-category"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a category</option>
//             <option value="Work">Work</option>
//             <option value="Study">Study</option>
//             <option value="Exercise">Exercise</option>
//             <option value="Personal">Personal</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>

//         <div>
//           <label htmlFor="timer-description" className="block text-sm font-medium text-gray-700 mb-1">
//             Description
//           </label>
//           <textarea
//             id="timer-description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={2}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Add some details..."
//           />
//         </div>
//       </div>

//       <div className="flex flex-wrap gap-2 justify-center">
//         {!isRunning ? (
//           <button
//             onClick={handleStart}
//             className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             Start
//           </button>
//         ) : (
//           <button
//             onClick={handlePause}
//             className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             Pause
//           </button>
//         )}
        
//         <button
//           onClick={handleStop}
//           disabled={isSubmitting || elapsedTime === 0}
//           className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
//           </svg>
//           {isSubmitting ? "Saving..." : "Stop & Save"}
//         </button>
        
//         <button
//           onClick={handleReset}
//           className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
//         >
//           <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//           </svg>
//           Reset
//         </button>
//       </div>
//     </div>
//   );
// }




// "use client";

// import { useState } from "react";
// import { supabase } from "@/lib/supabase";

// interface TimerProps {
//   onActivityCreated?: () => void;
// }

// export default function Timer({ onActivityCreated }: TimerProps) {
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [description, setDescription] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [startTime, setStartTime] = useState("");
//   const [endTime, setEndTime] = useState("");
//   const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

//   const handleSubmit = async () => {
//     if (!title.trim() || !date.trim() || !startTime.trim() || !endTime.trim()) {
//       alert("Please fill in the title, date, and start/end times.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (!user) {
//         alert("You must be logged in to save activities!");
//         return;
//       }
      
//       const combinedStartTime = `${date}T${startTime}:00.000Z`;
//       const combinedEndTime = `${date}T${endTime}:00.000Z`;

//       const { error } = await supabase.from('activities').insert([
//         {
//           title: title.trim(),
//           category: category.trim() || null,
//           description: description.trim() || null,
//           start_time: combinedStartTime,
//           end_time: combinedEndTime,
//           date: date,
//           user_id: user.id
//         }
//       ]);

//       if (error) {
//         throw error;
//       }

//       alert("Activity saved successfully!");
//       setTitle("");
//       setCategory("");
//       setDescription("");
//       setStartTime("");
//       setEndTime("");
//       setDate(new Date().toISOString().split('T')[0]);

//       if (onActivityCreated) {
//         onActivityCreated();
//       }
//     } catch (error) {
//       console.error("Error saving activity:", error);
//       alert("Error saving activity. Please try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="bg-white rounded-xl shadow-md p-6">
//       <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
//         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//         Log Activity Manually
//       </h2>

//       <div className="space-y-4 mb-6">
//         <div>
//           <label htmlFor="timer-title" className="block text-sm font-medium text-gray-700 mb-1">
//             Activity Title *
//           </label>
//           <input
//             id="timer-title"
//             type="text"
//             value={title}
//             onChange={(e) => setTitle(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="What did you work on?"
//             required
//           />
//         </div>
        
//         <div>
//           <label htmlFor="timer-category" className="block text-sm font-medium text-gray-700 mb-1">
//             Category
//           </label>
//           <select
//             id="timer-category"
//             value={category}
//             onChange={(e) => setCategory(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//           >
//             <option value="">Select a category</option>
//             <option value="Work">Work</option>
//             <option value="Study">Study</option>
//             <option value="Exercise">Exercise</option>
//             <option value="Personal">Personal</option>
//             <option value="Other">Other</option>
//           </select>
//         </div>
        
//         <div>
//           <label htmlFor="timer-description" className="block text-sm font-medium text-gray-700 mb-1">
//             Description
//           </label>
//           <textarea
//             id="timer-description"
//             value={description}
//             onChange={(e) => setDescription(e.target.value)}
//             rows={2}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="Add some details..."
//           />
//         </div>

//         <div className="grid grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="timer-start-time" className="block text-sm font-medium text-gray-700 mb-1">
//               Start Time *
//             </label>
//             <input
//               id="timer-start-time"
//               type="time"
//               value={startTime}
//               onChange={(e) => setStartTime(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//           <div>
//             <label htmlFor="timer-end-time" className="block text-sm font-medium text-gray-700 mb-1">
//               End Time *
//             </label>
//             <input
//               id="timer-end-time"
//               type="time"
//               value={endTime}
//               onChange={(e) => setEndTime(e.target.value)}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//               required
//             />
//           </div>
//         </div>

//         <div>
//           <label htmlFor="timer-date" className="block text-sm font-medium text-gray-700 mb-1">
//             Date *
//           </label>
//           <input
//             id="timer-date"
//             type="date"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//             required
//           />
//         </div>
//       </div>
      
//       <button
//         onClick={handleSubmit}
//         disabled={isSubmitting}
//         className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
//       >
//         {isSubmitting ? (
//           <>
//             <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//             </svg>
//             Adding...
//           </>
//         ) : (
//           "Add Activity"
//         )}
//       </button>
//     </div>
//   );
// }