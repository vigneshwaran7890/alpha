import React, { useEffect, useState, Fragment } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { LogOut, User, Search, Clock, Activity, ChevronRight, X, Filter, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';

const Home = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const userData = location.state;
  const [usersData, setUsersData] = useState([]);
  const [allSnippetsWithLogs, setAllSnippetsWithLogs] = useState([]);
  const [onClickData, setOnClickData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
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

  const getSnippetWithLogs = async (snippetId) => {
    try {
      const data = await axios.get(`http://localhost:5000/api/snippet-with-logs/${snippetId}`);
      setOnClickData(data.data);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching snippet data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch snippet details.',
        variant: 'destructive',
      });
    }
  };

  const handleClick = async (userId) => {
    try {
      const data = await axios.post(`http://localhost:5000/api/enrich/${userId}`);
      if (data) {
        const context_snippet_id = data.data.context_snippet_id;
        console.log('context_snippet_id', context_snippet_id);
        await getSnippetWithLogs(context_snippet_id);
        console.log('User details:', data.data);
      }
    } catch (error) {
      console.error('Error enriching user data:', error);
      toast({
        title: 'Error',
        description: 'Failed to enrich user data.',
        variant: 'destructive',
      });
    }
  };

  const getAllSnippetsWithLogs = async () => {
    setIsHistoryLoading(true);
    try {
      const { data } = await axios.get(`http://localhost:5000/api/all-snippets-with-logs`);
      if (data) {
        console.log('All snippets with logs:', data);
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">All Users</h2>
                <div className="flex items-center space-x-2">
                  <button className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                    <Filter size={16} />
                    <span>Filter</span>
                  </button>
                </div>
              </div>

              {filteredUsers.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                  <Search className="mx-auto text-gray-400" size={48} />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">No users found</h3>
                  <p className="mt-2 text-gray-500">Try adjusting your search or filter</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredUsers.map((user) => (
                    <div
                      key={user._id}
                      onClick={() => handleClick(user._id)}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer border border-gray-100"
                    >
                      <div className="p-6">
                        <div className="flex items-start">
                          <div className="flex-shrink-0 bg-indigo-100 p-3 rounded-lg">
                            <User className="text-indigo-600" size={20} />
                          </div>
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900">{user?.name || 'Unknown User'}</h3>
                            <p className="text-sm text-gray-500">{user?.email || 'No email'}</p>
                          </div>
                        </div>
                        <div className="mt-6 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Role</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">{user?.role || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Company</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">
                              {user?.company_id?.name || 'Unknown'}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 px-6 py-4 flex justify-between items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          {user?.title || 'No title'}
                        </span>
                        <button className="text-indigo-600 hover:text-indigo-800">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* User Details Modal */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                        Enrichment Details
                      </Dialog.Title>
                      <button
                        onClick={closeModal}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {onClickData && (
                      <div className="mt-6 space-y-8">
                        {/* Context Snippet Card */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                              <Activity className="text-indigo-600" size={18} />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Context Snippet</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Entity Type</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {onClickData.context_snippet?.entity_type || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Created At</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {new Date(onClickData.context_snippet?.created_at).toLocaleString() || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Snippet Type</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {onClickData.context_snippet?.snippet_type || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Company Value</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {onClickData.context_snippet?.payload?.company_value_prop || 'N/A'}
                              </p>
                            </div>
                          </div>
                          <div className="mt-6">
                            <p className="text-sm font-medium text-gray-500">Product Names</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {onClickData.context_snippet?.payload?.product_names || 'N/A'}
                            </p>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Target Customer</p>
                            <p className="mt-1 text-sm text-gray-900">
                              {onClickData.context_snippet?.payload?.target_customer || 'N/A'}
                            </p>
                          </div>
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-500">Source URLs</p>
                            <div className="mt-1 space-y-1">
                              {onClickData.context_snippet?.source_urls?.length > 0 ? (
                                onClickData.context_snippet.source_urls.map((url, index) => (
                                  <a
                                    key={index}
                                    href={url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-sm text-indigo-600 hover:underline truncate"
                                  >
                                    {url}
                                  </a>
                                ))
                              ) : (
                                <p className="text-sm text-gray-500">None</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Search Logs Section */}
                        <div>
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-blue-100 rounded-lg mr-3">
                              <Search className="text-blue-600" size={18} />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Search Logs</h4>
                          </div>
                          <div className="space-y-4">
                            {onClickData.search_logs?.map((log, index) => (
                              <div key={log._id} className="border border-gray-200 rounded-lg p-5">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">
                                      Iteration {log.iteration}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {new Date(log.created_at).toLocaleString()}
                                    </p>
                                  </div>
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Query #{index + 1}
                                  </span>
                                </div>
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-gray-500">Search Query</p>
                                  <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                                    {log.query || 'N/A'}
                                  </p>
                                </div>
                                <div className="mt-4">
                                  <p className="text-sm font-medium text-gray-500">Top Results</p>
                                  {log.top_results?.length > 0 ? (
                                    <ul className="mt-1 space-y-1">
                                      {log.top_results.map((result, i) => (
                                        <li key={i} className="text-sm text-gray-900">
                                          {i + 1}. {result}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p className="text-sm text-gray-500">None</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                      type="button"
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={closeModal}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* History Modal */}
      <Transition appear show={isHistoryOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeHistory}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-50" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex justify-between items-start">
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                        Search History
                      </Dialog.Title>
                      <button
                        onClick={closeHistory}
                        className="p-2 rounded-full hover:bg-gray-100"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {isHistoryLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <Loader2 className="animate-spin text-indigo-600" size={32} />
                      </div>
                    ) : (
                      <div className="mt-6 space-y-6">
                        {allSnippetsWithLogs.length === 0 ? (
                          <div className="text-center py-12">
                            <Clock className="mx-auto text-gray-400" size={48} />
                            <h4 className="mt-4 text-lg font-medium text-gray-900">No history found</h4>
                            <p className="mt-2 text-gray-500">Your search history will appear here</p>
                          </div>
                        ) : (
                          allSnippetsWithLogs.map((snippetData, index) => (
                            <div key={index} className="border border-gray-200 rounded-lg p-5">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="text-lg font-semibold text-gray-800">
                                    Search Session {index + 1}
                                  </h4>
                                  <p className="text-sm text-gray-500 mt-1">
                                    {new Date(snippetData.context_snippet?.created_at).toLocaleString()}
                                  </p>
                                </div>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  {snippetData.context_snippet?.entity_type}
                                </span>
                              </div>
                              
                              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Company Value</p>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {snippetData.context_snippet?.payload?.company_value_prop || 'N/A'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-500">Products</p>
                                  <p className="mt-1 text-sm text-gray-900">
                                    {snippetData.context_snippet?.payload?.product_names || 'N/A'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="mt-6">
                                <h5 className="text-md font-medium text-gray-700 mb-3">Search Queries</h5>
                                <div className="space-y-3">
                                  {snippetData.search_logs?.map((log, logIndex) => (
                                    <div key={logIndex} className="bg-gray-50 p-3 rounded-lg">
                                      <p className="text-sm font-medium text-gray-900">
                                        Iteration {log.iteration}: {log.query}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {new Date(log.created_at).toLocaleTimeString()}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={() => {
                                    setOnClickData(snippetData);
                                    setIsModalOpen(true);
                                    setIsHistoryOpen(false);
                                  }}
                                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                                >
                                  View details <ChevronRight size={16} className="ml-1" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  <div className="bg-gray-50 px-6 py-4 flex justify-end">
                    <button
                      type="button"
                      className="px-5 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                      onClick={closeHistory}
                    >
                      Close
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default Home;