import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X, Clock, ChevronRight, Loader2, Search, Layers, User, ArrowRight, ChevronDown, ChevronUp } from 'lucide-react';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  historyData: any[];
  onViewDetails: (data: any) => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  isLoading,
  historyData,
  onViewDetails
}) => {
  const [expandedCards, setExpandedCards] = React.useState<Record<string, boolean>>({});
  const [expandedResults, setExpandedResults] = React.useState<Record<string, boolean>>({});

  const toggleCardExpand = (id: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const toggleResultExpand = (id: string) => {
    setExpandedResults(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const getEntityIcon = (entityType: string) => {
    switch (entityType?.toLowerCase()) {
      case 'person':
        return <User size={16} className="text-blue-500" />;
      case 'company':
        return <Layers size={16} className="text-green-500" />;
      default:
        return <Search size={16} className="text-purple-500" />;
    }
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

  const cleanResultText = (text: string) => {
    return text.replace(/[\[\]']+/g, '').replace(/\\'/g, "'");
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
                    <div>
                      <Dialog.Title as="h3" className="text-2xl font-bold text-gray-900">
                        Search History
                      </Dialog.Title>
                      <p className="text-sm text-gray-500 mt-1">
                        {historyData.length} search sessions found
                      </p>
                    </div>
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
                      <p className="text-gray-500">Loading your search history...</p>
                    </div>
                  ) : (
                    <div className="mt-6 space-y-4">
                      {historyData.length === 0 ? (
                        <div className="text-center py-12">
                          <Clock className="mx-auto text-gray-400" size={48} />
                          <h4 className="mt-4 text-lg font-medium text-gray-900">No history found</h4>
                          <p className="mt-2 text-gray-500">Your search history will appear here</p>
                        </div>
                      ) : (
                        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                          {historyData.map((snippetData, index) => {
                            const snippetId = snippetData.context_snippet?._id || index.toString();
                            const isExpanded = expandedCards[snippetId];

                            return (
                              <div
                                key={snippetId}
                                className="border border-gray-200 rounded-lg hover:border-indigo-200 hover:shadow-sm transition-all"
                              >
                                <div
                                  className="p-5 cursor-pointer"
                                  onClick={() => toggleCardExpand(snippetId)}
                                >
                                  <div className="flex justify-between items-start">
                                    <div className="flex items-start space-x-3">
                                      <div className="mt-1">
                                        {getEntityIcon(snippetData.context_snippet?.entity_type)}
                                      </div>
                                      <div>
                                        <h4 className="text-lg font-semibold text-gray-800">
                                          {snippetData.context_snippet?.entity_type === 'person' ?
                                            'Person Research' :
                                            'Company Research'}
                                        </h4>
                                        <p className="text-sm text-gray-500 mt-1">
                                          {formatDate(snippetData.context_snippet?.created_at)}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                        {snippetData.search_logs?.length || 0} searches
                                      </span>
                                      {isExpanded ? (
                                        <ChevronUp size={18} className="text-gray-500" />
                                      ) : (
                                        <ChevronDown size={18} className="text-gray-500" />
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {isExpanded && (
                                  <div className="px-5 pb-5 space-y-4 border-t border-gray-200">
                                    {/* Payload Information */}
                                    <div className="space-y-4">
                                      {snippetData.context_snippet?.payload?.company_value_prop && (
                                        <div>
                                          <h5 className="font-medium text-gray-700 mb-2">Company Value Proposition</h5>
                                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                                            {cleanMarkdown(snippetData.context_snippet.payload.company_value_prop)}
                                          </div>
                                        </div>
                                      )}

                                      {snippetData.context_snippet?.payload?.product_names && (
                                        <div>
                                          <h5 className="font-medium text-gray-700 mb-2">Product Names</h5>
                                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                                            {cleanMarkdown(snippetData.context_snippet.payload.product_names)}
                                          </div>
                                        </div>
                                      )}

                                      {snippetData.context_snippet?.payload?.target_customer && (
                                        <div>
                                          <h5 className="font-medium text-gray-700 mb-2">Target Customer</h5>
                                          <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line">
                                            {cleanMarkdown(snippetData.context_snippet.payload.target_customer)}
                                          </div>
                                        </div>
                                      )}
                                    </div>

                                    {/* Search Logs */}
                                    <div className="space-y-3">
                                      <h5 className="font-medium text-gray-700">Search Queries</h5>
                                      {snippetData.search_logs?.map((log: any, logIndex: number) => {
                                        const resultId = log._id || `${snippetId}-${logIndex}`;
                                        const isResultExpanded = expandedResults[resultId];

                                        return (
                                          <div key={resultId} className="bg-gray-50 rounded-lg p-3">
                                            <div
                                              className="flex items-start space-x-2 cursor-pointer"
                                              onClick={() => toggleResultExpand(resultId)}
                                            >
                                              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-white border border-gray-200 text-xs font-medium mt-0.5">
                                                {logIndex + 1}
                                              </span>
                                              <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                  <p className="text-sm font-medium text-gray-800">{log.query}</p>
                                                  {isResultExpanded ? (
                                                    <ChevronUp size={16} className="text-gray-500 mt-0.5" />
                                                  ) : (
                                                    <ChevronDown size={16} className="text-gray-500 mt-0.5" />
                                                  )}
                                                </div>
                                                {log.top_results?.[0] && (
                                                  <>
                                                    {isResultExpanded ? (
                                                      <div className="mt-2 text-xs text-gray-700 whitespace-pre-line bg-white p-2 rounded border border-gray-200">
                                                        {cleanResultText(log.top_results[0])}
                                                      </div>
                                                    ) : (
                                                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                        {cleanResultText(log.top_results[0])}
                                                      </p>
                                                    )}
                                                  </>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    <div className="flex justify-between items-center pt-2">
                                      <div className="text-sm text-gray-500">
                                        ID: {snippetId.slice(0, 8)}...
                                      </div>
                                      <button
                                        onClick={() => onViewDetails(snippetData)}
                                        className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center group"
                                      >
                                        View full details
                                        <ArrowRight
                                          size={16}
                                          className="ml-1 group-hover:translate-x-1 transition-transform"
                                        />
                                      </button>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
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

export default HistoryModal;