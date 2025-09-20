"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

interface ActivityImport {
  title: string;
  category: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  date: string;
}

export default function ExportImport() {
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const exportToCSV = async () => {
    setExportLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: activities, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convert to CSV
      const csvHeaders = ['Title', 'Category', 'Description', 'Start Time', 'End Time', 'Date'];
      const csvData = activities.map(activity => [
        `"${activity.title.replace(/"/g, '""')}"`,
        `"${activity.category || ''}"`,
        `"${(activity.description || '').replace(/"/g, '""')}"`,
        `"${activity.start_time || ''}"`,
        `"${activity.end_time || ''}"`,
        `"${activity.date}"`
      ]);

      const csvContent = [csvHeaders, ...csvData].map(row => row.join(',')).join('\n');

      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `activities-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      alert('Activities exported successfully!');
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting activities');
    } finally {
      setExportLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportLoading(true);
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      // Skip header processing since we're not using it
      const activities: ActivityImport[] = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.replace(/^"|"$/g, '').trim());
        return {
          title: values[0],
          category: values[1],
          description: values[2],
          start_time: values[3] || undefined,
          end_time: values[4] || undefined,
          date: values[5],
        };
      }).filter(activity => activity.title && activity.date); // Filter out empty rows

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // Insert activities one by one to avoid SQL injection risks
      for (const activity of activities) {
        const { error } = await supabase
          .from('activities')
          .insert({
            ...activity,
            user_id: user.id
          });

        if (error) {
          console.error('Error inserting activity:', error);
        }
      }

      alert(`Successfully imported ${activities.length} activities!`);
      event.target.value = ''; // Reset file input
    } catch (error) {
      console.error('Import error:', error);
      alert('Error importing activities. Please check the CSV format.');
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">Export / Import Activities</h3>
      
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Export Button */}
        <button
          onClick={exportToCSV}
          disabled={exportLoading}
          className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center"
        >
          {exportLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Exporting...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
            </>
          )}
        </button>

        {/* Import File Input */}
        <label className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center cursor-pointer">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={importLoading}
            className="hidden"
          />
          {importLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Importing...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Import CSV
            </>
          )}
        </label>
      </div>
    </div>
  );
}