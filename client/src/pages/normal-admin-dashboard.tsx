import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';

interface Confession {
  id: number;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  collegeCode: string;
  createdAt: string;
  reportedCount: number;
}

export function NormalAdminDashboardPage() {
  const { data: user } = useAuth();
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const collegeCode = user?.collegeCode || 'C001';

  const fetchConfessions = async () => {
    try {
      const response = await fetch(`/api/confessions/college/${collegeCode}`);
      if (!response.ok) throw new Error('Failed to fetch confessions');
      const data = await response.json();
      setConfessions(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch confessions');
    }
  };

  useEffect(() => {
    fetchConfessions();
  }, []);

  const handleConfessionAction = async (confessionId: number, action: 'approve' | 'reject') => {
    try {
      const response = await fetch(`/api/confessions/${confessionId}/${action}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to update confession');
      
      setConfessions(confessions.map(confession => 
        confession.id === confessionId 
          ? { ...confession, status: action === 'approve' ? 'approved' : 'rejected' }
          : confession
      ));
      toast.success(`Confession ${action}d successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} confession`);
    }
  };

  const handleReportAction = async (confessionId: number, action: 'review' | 'dismiss') => {
    try {
      const response = await fetch(`/api/confessions/${confessionId}/report/${action}`, {
        method: 'PUT',
      });
      if (!response.ok) throw new Error('Failed to handle report');
      
      setConfessions(confessions.map(confession => 
        confession.id === confessionId 
          ? { ...confession, reportedCount: action === 'dismiss' ? 0 : confession.reportedCount }
          : confession
      ));
      toast.success(`Report ${action}d successfully`);
    } catch (error) {
      console.error(error);
      toast.error(`Failed to ${action} report`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-600 text-green-100';
      case 'rejected': return 'bg-red-600 text-red-100';
      case 'pending': return 'bg-yellow-600 text-yellow-100';
      default: return 'bg-gray-600 text-gray-100';
    }
  };

  const filteredConfessions = filter === 'pending' 
    ? confessions.filter(c => c.status === 'pending')
    : confessions;

  return (
    <div
      className="container mx-auto p-4 min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://img.freepik.com/free-vector/dark-gradient-background-with-copy-space_53876-99548.jpg?size=626&ext=jpg&ga=GA1.1.1141335507.1718755200&semt=ais_user')",
      }}
    >
      <div className="bg-black bg-opacity-50 p-4 rounded-lg">
        <h1 className="text-4xl font-bold mb-6 text-white text-center">Normal Admin Dashboard</h1>
        <p className="text-center text-gray-300 mb-6">Moderate confessions and content</p>

        {/* Filter Controls */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setFilter('pending')}
              className={`px-6 py-2 rounded-md transition-colors ${
                filter === 'pending'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Pending Only
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-6 py-2 rounded-md transition-colors ${
                filter === 'all'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              All Confessions
            </button>
          </div>
        </div>

        {/* Confessions Management */}
        <div className="bg-gray-800 bg-opacity-75 shadow-md rounded-lg">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">Confessions Moderation</h2>
            <p className="text-gray-300 text-sm mt-1">
              {filter === 'pending' ? 'Review pending confessions' : 'View all confessions'}
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Content</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">College</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Reports</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredConfessions.map((confession) => (
                  <tr key={confession.id} className="hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{confession.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-300 max-w-md">
                      <div className="max-h-20 overflow-y-auto">{confession.content}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300 font-mono">
                      {confession.collegeCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(confession.status)}`}>
                        {confession.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                      {confession.reportedCount > 0 ? (
                        <span className="text-red-400 font-semibold">{confession.reportedCount}</span>
                      ) : (
                        <span className="text-green-400">0</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex justify-center space-x-2">
                        {confession.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfessionAction(confession.id, 'approve')}
                              className="text-green-400 hover:text-green-300 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleConfessionAction(confession.id, 'reject')}
                              className="text-red-400 hover:text-red-300 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {confession.reportedCount > 0 && (
                          <>
                            <button
                              onClick={() => handleReportAction(confession.id, 'review')}
                              className="text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleReportAction(confession.id, 'dismiss')}
                              className="text-gray-400 hover:text-gray-300 transition-colors"
                            >
                              Dismiss
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredConfessions.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">No confessions to display</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}