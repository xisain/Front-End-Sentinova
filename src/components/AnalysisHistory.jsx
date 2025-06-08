import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { getAnalysisHistory } from '../services/analysisService';
import { Card } from 'flowbite-react';
import { HiOutlineClock, HiOutlineDocumentText, HiOutlineChartBar } from 'react-icons/hi';

const AnalysisHistory = () => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching history for user:', user.id);
        const results = await getAnalysisHistory(user.id);
        console.log('Fetched results:', results);
        setHistory(results);
      } catch (error) {
        console.error('Failed to fetch history:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if user is loaded
    if (isUserLoaded && user) {
      fetchHistory();
    }
  }, [user, isUserLoaded]);

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'medium',
      timeStyle: 'medium'
    }).format(date);
  };

  // Wait for user to load
  if (!isUserLoaded) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
        <p className="font-medium">Authentication Required</p>
        <p className="text-sm">Please sign in to view your analysis history.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p className="font-medium">Error loading analysis history</p>
        <p className="text-sm">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 py-1 px-3 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <HiOutlineDocumentText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No analysis history</h3>
        <p className="mt-1 text-sm text-gray-500">Start your first analysis to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Analysis History</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {history.map((item) => (
          <Card key={item.id} className="hover:shadow-lg transition-shadow duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center text-gray-500">
                  <HiOutlineClock className="h-5 w-5 mr-2" />
                  <span className="text-sm">{formatDate(item.timestamp)}</span>
                </div>
                <div className="flex items-center">
                  <HiOutlineChartBar className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              
              <div className="flex-grow">
                {/* Display sentiment distribution if available */}
                {item.sentiment_distribution && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Sentiment Distribution</h4>
                    <div className="space-y-2">
                      {Object.entries(item.sentiment_distribution.transformer.IndoBERT).map(([sentiment, percentage]) => (
                        <div key={sentiment} className="flex items-center">
                          <span className="text-sm text-gray-600 w-24">{sentiment}</span>
                          <div className="flex-grow bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                sentiment === 'positive' ? 'bg-green-500' :
                                sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 ml-2">{percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Display top keywords if available */}
                {item.top_keywords && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Top Keywords</h4>
                    <div className="flex flex-wrap gap-2">
                      {item.top_keywords.slice(0, 5).map((keyword, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                        >
                          {keyword.text}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Display total reviews if available */}
              {item.total_reviews && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Total Reviews:</span>
                    <span className="font-medium">{item.total_reviews}</span>
                  </div>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AnalysisHistory; 