
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import ActivityCard from "@/components/ActivityCard";
import Timer from "@/components/Timer";
import ExportImport from "@/components/ExportImport";
import Charts from "@/components/Charts";
import Reports from "@/app/dashboard/reports/page";



interface Activity {
  id: string;
  title: string;
  category: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  date: string;
  created_at: string;
  user_id: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false); // New state for form visibility
  
  // New state to manage which tab is active (Activities, Charts, Reports, etc.)
  const [activeTab, setActiveTab] = useState('activities');

  const [activity, setActivity] = useState({
    title: "",
    description: "",
    category: "",
    start_time: "",
    end_time: "",
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        fetchActivities(data.user.id);
        setLoading(false);
      }
    };
    getUser();
  }, [router]);

  const fetchActivities = async (userId: string) => {
    const { data, error } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data || []);
    }
  };

  // Helper function to format time for database
  const formatTimeForDB = (date: string, time: string): string | null => {
    if (!time) return null;

    // Ensure time is in HH:MM format (add colon if missing)
    let formattedTime = time;
    if (time.length === 4 && !time.includes(':')) {
      formattedTime = `${time.slice(0, 2)}:${time.slice(2)}`;
    }

    // Combine date and time into a proper ISO string
    return `${date}T${formattedTime}:00.000Z`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setFormLoading(true);

    // Format times for database
    const startTimeDB = formatTimeForDB(activity.date, activity.start_time);
    const endTimeDB = formatTimeForDB(activity.date, activity.end_time);

    const { error } = await supabase
      .from('activities')
      .insert([
        {
          title: activity.title,
          description: activity.description,
          category: activity.category,
          start_time: startTimeDB,
          end_time: endTimeDB,
          date: activity.date,
          user_id: user.id
        }
      ]);

    if (error) {
      alert("Error adding activity: " + error.message);
      console.error("Full error details:", error);
    } else {
      setActivity({
        title: "",
        description: "",
        category: "",
        start_time: "",
        end_time: "",
        date: new Date().toISOString().split('T')[0],
      });
      setShowForm(false); // Close form after submission
      fetchActivities(user.id);
    }
    setFormLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setActivity((prev) => ({ ...prev, [name]: value }));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this activity?")) return;

    const { error } = await supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      alert("Error deleting activity: " + error.message);
    } else {
      fetchActivities(user.id);
    }
  };

  const handleEdit = (id: string) => {
    console.log("Edit activity:", id);
    // Implement edit functionality
  };

  const handleActivityCreated = () => {
    if (user) {
      fetchActivities(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // A component to display based on the activeTab state
  const renderContent = () => {
    switch (activeTab) {
      case 'activities':
        return (
          <>
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">Your Activities</h2>
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-600 bg-gray-100 px-3 py-1 rounded-full text-sm">
                      {activities.length} total
                    </span>
                    <button
                      onClick={() => setShowForm(!showForm)}
                      className="lg:hidden bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                    >
                      {showForm ? 'Hide Form' : 'Add Activity'}
                    </button>
                  </div>
                </div>

                {activities.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-300 text-6xl mb-4">📊</div>
                    <p className="text-gray-600 mb-2">No activities found</p>
                    <p className="text-gray-500 text-sm">Get started by adding your first activity!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <ActivityCard
                        key={activity.id}
                        id={activity.id}
                        title={activity.title}
                        category={activity.category}
                        description={activity.description}
                        start_time={activity.start_time}
                        end_time={activity.end_time}
                        date={activity.date}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="lg:col-span-2">
              <Timer onActivityCreated={handleActivityCreated} />
            </div>
          </>
        );
      case 'charts':
        // No longer passing the activities prop, Charts will handle its own data fetching.
        return <Charts />;
      case 'reports':
        return <Reports />;
      case 'export-import':
        return <ExportImport />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">Activity Tracker</h1><br /><p><i> By Menuo CleanTech</i></p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700 hidden md:block">Welcome, {user?.email}</span>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  router.push("/login");
                }}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Floating Add Button */}
        <div className="fixed bottom-6 right-6 z-10 lg:hidden">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {showForm ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              )}
            </svg>
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="mb-8 flex space-x-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 font-medium ${activeTab === 'activities' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 font-medium ${activeTab === 'charts' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium ${activeTab === 'reports' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('export-import')}
            className={`px-4 py-2 font-medium ${activeTab === 'export-import' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Export/Import
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className={`lg:col-span-1 ${showForm ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 mb-8 sticky top-8">
              <div className="flex justify-between items-center mb-4 lg:hidden">
                <h2 className="text-xl font-semibold text-gray-800">Log New Activity</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={activity.title}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    placeholder="What did you work on?"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={activity.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={activity.description}
                    onChange={handleChange}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add some details about this activity..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time (HH:MM)
                    </label>
                    <input
                      type="time"
                      id="start_time"
                      name="start_time"
                      value={activity.start_time}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      pattern="[0-9]{2}:[0-9]{2}"
                      placeholder="23:41"
                    />
                  </div>

                  <div>
                    <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-1">
                      End Time (HH:MM)
                    </label>
                    <input
                      type="time"
                      id="end_time"
                      name="end_time"
                      value={activity.end_time}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      pattern="[0-9]{2}:[0-9]{2}"
                      placeholder="23:41"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    name="date"
                    value={activity.date}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2.5 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  {formLoading ? (
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
              </form>
            </div>
          </div>

          {/* Right Column - Dynamic Content based on activeTab */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-8">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

