import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '../hooks/use-toast';
import { LogOut, User, Search, Clock, Filter, Loader2 } from 'lucide-react';
import {
  fetchUsers,
  fetchSnippetWithLogs,
  enrichUser,
  fetchAllSnippetsWithLogs,
} from '../api/userApi';
import UserCard from '../components/cards/UserCard.tsx';
import DetailsModal from '../components/cards/DetailsModal.tsx';
import HistoryModal from '../components/cards/HistoryModal.tsx';

const Home = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userData = location.state;
  const [usersData, setUsersData] = useState([]);
  const [allSnippetsWithLogs, setAllSnippetsWithLogs] = useState([]);
  const [onClickData, setOnClickData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState<string | null>(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('users');

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
        const data = await fetchUsers();
        console.log('User data fetched:', data);
        setUsersData(data || []);
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

  const getSnippetWithLogs = async (snippetId) => {
    try {
      setIsUserLoading(snippetId);
      const data = await fetchSnippetWithLogs(snippetId);
      setOnClickData(data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching snippet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch snippet details.',
        variant: 'destructive',
      });
    } finally {
      setIsUserLoading(null);
    }
  };

  const handleClick = async (userId) => {
    setIsUserLoading(userId);
    try {
      const data = await enrichUser(userId);
      if (data) {
        const context_snippet_id = data.context_snippet_id;
        await getSnippetWithLogs(context_snippet_id);
      }
    } catch (error) {
      console.error('Error enriching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to enrich user data.',
        variant: 'destructive',
      });
    } finally {
      setIsUserLoading(null);
    }
  };

  const getAllSnippetsWithLogs = async () => {
    setIsHistoryLoading(true);
    setActiveTab('history');
    try {
      const data = await fetchAllSnippetsWithLogs();
      if (data) {
        setAllSnippetsWithLogs(data);
        setIsHistoryOpen(true);
      }
    } catch (error) {
      console.error('Error fetching all snippets:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch history data.',
        variant: 'destructive',
      });
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setOnClickData(null);
  };

  const closeHistory = () => {
    setIsHistoryOpen(false);
    setAllSnippetsWithLogs([]);
  };

  const filteredUsers = usersData.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.company_id?.name && user.company_id.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-indigo-700 text-white p-6 hidden md:block">
        <div className="flex items-center space-x-2 mb-10">
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <span className="text-indigo-700 font-bold text-lg">D</span>
          </div>
          <h1 className="text-xl font-bold">DataEnrich</h1>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeTab === 'users' ? 'bg-indigo-600 bg-opacity-30' : 'hover:bg-indigo-600 hover:bg-opacity-20'}`}
          >
            <User className="mr-3" size={18} />
            Users
          </button>
          <button
            onClick={getAllSnippetsWithLogs}
            className={`flex items-center w-full p-3 rounded-lg transition-colors ${activeTab === 'history' ? 'bg-indigo-600 bg-opacity-30' : 'hover:bg-indigo-600 hover:bg-opacity-20'}`}
          >
            <Clock className="mr-3" size={18} />
            History
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center w-full p-3 rounded-lg hover:bg-indigo-600 hover:bg-opacity-20 transition-colors mt-8"
          >
            <LogOut className="mr-3" size={18} />
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="md:ml-64">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden">
          <h1 className="text-xl font-bold text-gray-800">DataEnrich</h1>
          <button
            onClick={handleLogout}
            className="p-2 rounded-full bg-gray-100 text-gray-600"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Desktop Header */}
        <header className="bg-white shadow-sm p-6 hidden md:block">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800">
              {activeTab === 'users' ? 'User Dashboard' : 'Search History'}
            </h1>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2 bg-gray-100 p-2 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                  <User className="text-indigo-600" size={18} />
                </div>
                <span className="font-medium">{userData?.user?.name || 'User'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="p-6">
          {/* Mobile Tabs */}
          <div className="flex border-b border-gray-200 mb-6 md:hidden">
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-3 font-medium ${activeTab === 'users' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              Users
            </button>
            <button
              onClick={getAllSnippetsWithLogs}
              className={`flex-1 py-3 font-medium ${activeTab === 'history' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
            >
              History
            </button>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <X className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab Content */}
          {activeTab === 'users' && !isLoading && (
            <div>

              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <Search className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <UserCard
                      key={user._id}
                      user={user}
                      onClick={handleClick}
                      isLoading={isUserLoading === user._id}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <DetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        data={onClickData}
        isLoading={!!isUserLoading}
      />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={closeHistory}
        isLoading={isHistoryLoading}
        historyData={allSnippetsWithLogs}
        onViewDetails={(data) => {
          setOnClickData(data);
          setIsModalOpen(true);
        }}
      />
    </div>
  );
};

export default Home;