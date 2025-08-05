import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User } from 'lucide-react';
import axios from 'axios';

const Home = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userData = location.state;
  const [usersData, setUsersData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been successfully logged out.',
    });
    navigate('/login');
  };

  useEffect(() => {
    if (!userData) {
      console.log('No user data in location state, skipping fetch.');
      return;
    }

    console.log('User data from state:', userData);
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await axios.get('http://localhost:5000/api/people');
        console.log('User data fetched:', res.data);
        setUsersData(res.data || []);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to fetch user data. Please try again later.');
        toast({
          title: 'Error',
          description: 'Failed to fetch user data.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userData, toast]);


  const getSnippetWithLogs = async (snippetId: string) => {
    const data = await axios.get(`http://localhost:5000/api/snippet-with-logs/${snippetId}`);
    console.log('getSnippetWithLogs', data);
    // Navigate to user details page or handle as needed
  };

  const handleClick = async (userId: string) => {
    const data = await axios.post(`http://localhost:5000/api/enrich/${userId}`);
    if (data.status !== 200) {
      // await getSnippetWithLogs()
      console.log('User details:', data);
      // Navigate to user details page or handle as needed
    };
  };



    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Your Dashboard</h1>
              <p className="text-sm text-gray-600">
                Welcome back, {userData.user?.name || 'User'}!
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">


          {/* Error or Loading State */}
          {isLoading && (
            <div className="text-center text-gray-600">Loading user data...</div>
          )}
          {error && <div className="text-center text-red-600">{error}</div>}

          {/* User Cards */}
          {!isLoading && !error && usersData.length === 0 && (
            <div className="text-center text-gray-600">No users found.</div>
          )}
          {!isLoading && !error && usersData.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {usersData.map((user) => (
                <div
                  key={user._id}
                  onClick={() => handleClick(user._id)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="bg-blue-100 p-3 rounded-full">
                      <User size={24} className="text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Role:</span> {user?.role || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Title:</span> {user?.title || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Company:</span>{' '}
                      {user?.company_id?.name || 'Unknown Company'}
                    </p>

                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  };

  export default Home;