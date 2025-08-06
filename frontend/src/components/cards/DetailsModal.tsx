import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Activity, Search, Loader2, ChevronDown, ChevronUp } from 'lucide-react';

interface SearchLog {
  _id: string;
  iteration: number;
  created_at: string;
  query: string;
  top_results?: string[];
}

interface ContextSnippet {
  entity_type: string;
  created_at: string;
  snippet_type: string;
  payload: {
    company_value_prop?: string;
    product_names?: string;
    target_customer?: string;
  };
  source_urls?: string[];
}

interface DetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    context_snippet?: ContextSnippet;
    search_logs?: SearchLog[];
  } | null;
  isLoading?: boolean;
}

const DetailsModal: React.FC<DetailsModalProps> = ({ isOpen, onClose, data, isLoading }) => {
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});

  const toggleResultExpand = (id: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const cleanResultText = (text: string) => {
    return text.replace(/[\[\]']+/g, '').replace(/\\'/g, "'");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/\*\*/g, '') // Remove bold markers
      .replace(/\\'/g, "'") // Fix escaped quotes
      .replace(/[\[\]']+/g, ''); // Remove brackets
  };
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />
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
                      onClick={onClose}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      disabled={isLoading}
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {isLoading ? (
                    <div className="flex flex-col justify-center items-center h-64 space-y-3">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                      <p className="text-gray-500">Loading details...</p>
                    </div>
                  ) : (
                    data && (
                      <div className="mt-6 space-y-8">
                        {/* Context Snippet Card */}
                        <div className="bg-gray-50 rounded-xl p-6">
                          <div className="flex items-center mb-4">
                            <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                              <Activity className="text-indigo-600" size={18} />
                            </div>
                            <h4 className="text-lg font-semibold text-gray-800">Context Snippet</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <p className="text-sm font-medium text-gray-500">Entity Type</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {data.context_snippet?.entity_type || 'N/A'}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-500">Created At</p>
                              <p className="mt-1 text-sm text-gray-900">
                                {formatDate(data.context_snippet?.created_at) || 'N/A'}
                              </p>
                            </div>
                          </div>

                          {/* Payload Information */}
                          <div className="space-y-6">
                            {data.context_snippet?.payload?.company_value_prop && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Company Value Proposition</h5>
                                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line border border-gray-200">
                                  {cleanMarkdown(data.context_snippet.payload.company_value_prop)}
                                </div>
                              </div>
                            )}

                            {data.context_snippet?.payload?.product_names && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Product Names</h5>
                                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line border border-gray-200">
                                  {data.context_snippet.payload.product_names}
                                </div>
                              </div>
                            )}

                            {data.context_snippet?.payload?.target_customer && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Target Customer</h5>
                                <div className="bg-white rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line border border-gray-200">
                                  {data.context_snippet.payload.target_customer}
                                </div>
                              </div>
                            )}
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
                            {data.search_logs?.map((log, index) => {
                              const isExpanded = expandedResults[log._id];
                              return (
                                <div key={log._id} className="border border-gray-200 rounded-lg p-5 hover:border-blue-200 transition-colors">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <p className="text-sm font-medium text-gray-900">
                                        Iteration {log.iteration}
                                      </p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {formatDate(log.created_at)}
                                      </p>
                                    </div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Query #{index + 1}
                                    </span>
                                  </div>

                                  <div className="mt-4 space-y-3">
                                    <div>
                                      <p className="text-sm font-medium text-gray-500">Search Query</p>
                                      <p className="mt-1 text-sm text-gray-900 font-mono bg-gray-50 p-2 rounded">
                                        {log.query || 'N/A'}
                                      </p>
                                    </div>

                                    {log.top_results?.[0] && (
                                      <div>
                                        <div
                                          className="flex justify-between items-center cursor-pointer"
                                          onClick={() => toggleResultExpand(log._id)}
                                        >
                                          <p className="text-sm font-medium text-gray-500">Top Results</p>
                                          {isExpanded ? (
                                            <ChevronUp size={16} className="text-gray-500" />
                                          ) : (
                                            <ChevronDown size={16} className="text-gray-500" />
                                          )}
                                        </div>
                                        <div className={`mt-1 overflow-hidden transition-all ${isExpanded ? 'max-h-[500px]' : 'max-h-20'}`}>
                                          <pre className="text-xs text-gray-700 whitespace-pre-wrap bg-gray-50 p-2 rounded border border-gray-200 overflow-auto">
                                            {cleanResultText(log.top_results[0])}
                                          </pre>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end border-t border-gray-200">
                  <button
                    type="button"
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    <span>Close</span>
                    <X size={16} />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DetailsModal;