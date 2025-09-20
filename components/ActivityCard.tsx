// components/ActivityCard.tsx
import { useState } from "react";

interface ActivityCardProps {
  id: string;
  title: string;
  category: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  date: string;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ActivityCard({
  id,
  title,
  category,
  description,
  start_time,
  end_time,
  date,
  onEdit,
  onDelete
}: ActivityCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTime = (timeString: string) => {
    if (!timeString) return "";
    const timePart = timeString.includes('T') 
      ? timeString.split('T')[1] 
      : timeString;
    
    const [hours, minutes] = timePart.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const calculateDuration = () => {
    if (!start_time || !end_time) return "";
    
    // This is the correct logic that handles different time string formats
    // from the database, preventing invalid date errors.
    const start = new Date(start_time.includes('T') ? start_time : `2000-01-01T${start_time}`);
    const end = new Date(end_time.includes('T') ? end_time : `2000-01-01T${end_time}`);

    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    onDelete(id);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-800 text-lg mb-1">
            {title}
          </h3>
          {category && (
            <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mb-2">
              {category}
            </span>
          )}
        </div>
        <div className="flex space-x-2 ml-4">
          <button
            onClick={() => onEdit(id)}
            className="text-blue-500 hover:text-blue-700 transition-colors"
            title="Edit activity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 disabled:text-red-300 transition-colors"
            title="Delete activity"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {description && (
        <p className="text-gray-600 text-sm mb-3">{description}</p>
      )}

      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <span className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(date).toLocaleDateString()}
        </span>

        {start_time && (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(start_time)}
          </span>
        )}

        {end_time && (
          <span className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(end_time)}
          </span>
        )}

        {start_time && end_time && (
          <span className="flex items-center bg-gray-100 px-2 py-1 rounded-md">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {calculateDuration()}
          </span>
        )}
      </div>
    </div>
  );
}