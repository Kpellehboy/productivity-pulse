"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { User } from '@supabase/supabase-js';
import ExportImport from "@/components/ExportImport";
import Charts from "@/components/Charts";
import Reports from "@/app/dashboard/reports/page";
import Timer from "@/components/Timer";


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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activeTab, setActiveTab] = useState('activities');

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/");
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

  const handleActivityCreated = () => {
    if (user) {
      fetchActivities(user.id);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-green-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'activities':
        return (
          <Timer onActivityCreated={handleActivityCreated} />
        );
      case 'charts':
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
    <div className="min-h-screen bg-gray-100">
      <style jsx global>{`
        @keyframes glowing-border {
          0% {
            border-color: #ef4444; /* red-500 */
          }
          25% {
            border-color: #f97316; /* orange-500 */
          }
          50% {
            border-color: #eab308; /* yellow-500 */
          }
          75% {
            border-color: #22c55e; /* green-500 */
          }
          100% {
            border-color: #0ea5e9; /* sky-500 */
          }
        }
        @keyframes glowing-text {
          0% {
            color: #ef4444; /* red-500 */
          }
          25% {
            color: #f97316; /* orange-500 */
          }
          50% {
            color: #eab308; /* yellow-500 */
          }
          75% {
            color: #22c55e; /* green-500 */
          }
          100% {
            color: #0ea5e9; /* sky-500 */
          }
        }
        .glowing-border-pulse {
          animation: glowing-border 2s linear infinite alternate;
        }
        .glowing-text-pulse {
          animation: glowing-text 2s linear infinite alternate;
        }
        .animate-rainbow-bg {
          background-size: 200% auto;
          animation: rainbow-bg 3s linear infinite;
        }
        @keyframes rainbow-bg {
          to {
            background-position: 200% center;
          }
        }
      `}</style>
      
      <header className="bg-white shadow-sm border-b">
        <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 md:bg-gradient-to-br md:from-pink-500 md:via-purple-500 md:to-indigo-500 p-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 bg-white rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Activity Tracker</h1>
                <p><i> By Menuo CleanTech</i></p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-gray-700 hidden md:block">Welcome, {user?.email}</span>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push("/");
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-orange-500 hover:to-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gradient-to-br from-purple-50 via-blue-50 to-green-50 rounded-lg shadow-inner mt-4">
        <div className="mb-8 flex space-x-4 border-b-2 border-gray-200">
          <button
            onClick={() => setActiveTab('activities')}
            className={`px-4 py-2 font-medium transition-all duration-300 ${activeTab === 'activities' ? 'glowing-text-pulse border-b-2 glowing-border-pulse' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Activities
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-4 py-2 font-medium transition-all duration-300 ${activeTab === 'charts' ? 'glowing-text-pulse border-b-2 glowing-border-pulse' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-4 py-2 font-medium transition-all duration-300 ${activeTab === 'reports' ? 'glowing-text-pulse border-b-2 glowing-border-pulse' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Reports
          </button>
          <button
            onClick={() => setActiveTab('export-import')}
            className={`px-4 py-2 font-medium transition-all duration-300 ${activeTab === 'export-import' ? 'glowing-text-pulse border-b-2 glowing-border-pulse' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Export/Import
          </button>
        </div>

        <div className="grid grid-cols-1 gap-8">
          <div className="col-span-1 rounded-xl shadow-lg p-1 bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 animate-rainbow-bg">
            <div className="bg-white rounded-xl h-full w-full">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}