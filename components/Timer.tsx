// components/Timer.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface TimerProps {
  onActivityCreated?: () => void;
}

export default function Timer({ onActivityCreated }: TimerProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = async () => {
    if (!title.trim() || !date.trim() || !startTime.trim() || !endTime.trim()) {
      alert("Please fill in the title, date, and start/end times.");
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("You must be logged in to save activities!");
        return;
      }
      
      const combinedStartTime = `${date}T${startTime}:00.000Z`;
      const combinedEndTime = `${date}T${endTime}:00.000Z`;

      const { error } = await supabase.from('activities').insert([
        {
          title: title.trim(),
          category: category.trim() || null,
          description: description.trim() || null,
          start_time: combinedStartTime,
          end_time: combinedEndTime,
          date: date,
          user_id: user.id
        }
      ]);

      if (error) {
        throw error;
      }

      alert("Activity saved successfully!");
      setTitle("");
      setCategory("");
      setDescription("");
      setStartTime("");
      setEndTime("");
      setDate(new Date().toISOString().split('T')[0]);

      if (onActivityCreated) {
        onActivityCreated();
      }
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Error saving activity. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Log Activity Manually
      </h2>

      <div className="space-y-4 mb-6">
        <div>
          <label htmlFor="timer-title" className="block text-sm font-medium text-gray-700 mb-1">
            Activity Title *
          </label>
          <input
            id="timer-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="What did you work on?"
            required
          />
        </div>
        
        <div>
          <label htmlFor="timer-category" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="timer-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          >
            <option value="">Select a category</option>
            <option value="Work">Work</option>
            <option value="Study">Study</option>
            <option value="Exercise">Exercise</option>
            <option value="Personal">Personal</option>
            <option value="Other">Other</option>
          </select>
        </div>
        
        <div>
          <label htmlFor="timer-description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="timer-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
            placeholder="Add some details..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="timer-start-time" className="block text-sm font-medium text-gray-700 mb-1">
              Start Time *
            </label>
            <input
              id="timer-start-time"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
          <div>
            <label htmlFor="timer-end-time" className="block text-sm font-medium text-gray-700 mb-1">
              End Time *
            </label>
            <input
              id="timer-end-time"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="timer-date" className="block text-sm font-medium text-gray-700 mb-1">
            Date *
          </label>
          <input
            id="timer-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
            required
          />
        </div>
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
      >
        {isSubmitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Adding...
          </>
        ) : (
          "Add Activity"
        )}
      </button>
    </div>
  );
}