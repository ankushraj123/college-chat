import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import chiefDashboardBg from '../assets/chief dashboard bg img.jpg';
import { useLogout } from '@/hooks/use-auth';
import { useLocation } from 'wouter';

interface Admin {
  id: number;
  username: string;
  collegeCode: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function ChiefDashboardPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const logoutMutation = useLogout();
  const [, setLocation] = useLocation();
  
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    collegeCode: ''
  });

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        setLocation('/chief-login');
        toast.success('Logged out successfully!');
      },
    });
  };

  const fetchAdmins = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch('/api/admins', {
        headers: {
          'x-session-token': sessionToken || '',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      // Ensure all admins have proper status and role values
      const normalizedAdmins = data.map((admin: any) => ({
        ...admin,
        collegeCode: admin.collegeId,
        status: admin.status || 'active',
        role: admin.role || 'normal'
      }));
      setAdmins(normalizedAdmins);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to fetch admins');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleCreateAdmin = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken || '',
        },
        body: JSON.stringify(newAdmin),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create admin');
      }

      // Refresh the list of admins
      fetchAdmins();

      // Clear the input fields
      setNewAdmin({ username: '', password: '', collegeCode: '' });
      setShowCreateModal(false);
      toast.success('Admin created successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to create admin');
    }
  };

  const handleUpdateAdmin = async (adminId: number, updates: Partial<Admin>) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken || '',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update admin');
      }

      setAdmins(admins.map(admin => 
        admin.id === adminId ? { ...admin, ...updates } : admin
      ));
      setShowEditModal(false);
      setEditingAdmin(null);
      toast.success('Admin updated successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
        headers: {
          'x-session-token': sessionToken || '',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }

      setAdmins(admins.filter(admin => admin.id !== adminId));
      setShowDeleteConfirm(false);
      setDeletingAdmin(null);
      toast.success('Admin deleted successfully');
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete admin');
    }
  };

  const handleToggleStatus = async (adminId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const sessionToken = localStorage.getItem('sessionToken');
      const response = await fetch(`/api/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-session-token': sessionToken || '',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setAdmins(admins.map(admin => 
        admin.id === adminId ? { ...admin, status: newStatus as 'active' | 'inactive' } : admin
      ));
      toast.success(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to update status');
    }
  };

  const openEditModal = (admin: Admin) => {
    setEditingAdmin(admin);
    setShowEditModal(true);
  };

  const openDeleteConfirm = (admin: Admin) => {
    setDeletingAdmin(admin);
    setShowDeleteConfirm(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-4 min-h-screen bg-cover bg-center bg-gray-900"
      style={{
        backgroundImage: `url(${chiefDashboardBg})`,
      }}
    >
      <div className="bg-black bg-opacity-50 p-4 rounded-lg">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white text-center">Chief Dashboard</h1>

        <div className="bg-gray-800 bg-opacity-75 shadow-md rounded my-6 p-6">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-4">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4 md:mb-0">Admin Management</h2>
            <div className="flex flex-col sm:flex-row">
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors mb-2 sm:mb-0 sm:mr-4"
              >
                Create New Admin
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-75 shadow-md rounded-lg overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Username</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">College Code</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{admin.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 font-medium">{admin.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300 font-mono">{admin.collegeCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleStatus(admin.id, admin.status)}
                      className={`px-2 py-1 text-xs font-semibold rounded-full transition-colors ${
                        admin.status === 'active' 
                          ? 'bg-green-600 text-green-100 hover:bg-green-700' 
                          : 'bg-red-600 text-red-100 hover:bg-red-700'
                      }`}
                    >
                      {(admin.status || 'active').toUpperCase()}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-300">
                    {new Date(admin.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(admin)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                        title="Edit Admin"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => openDeleteConfirm(admin)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
                        title="Delete Admin"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Create Admin Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Create New Admin</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={newAdmin.collegeCode}
                    onChange={(e) => setNewAdmin({ ...newAdmin, collegeCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAdmin}
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Create Admin
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Admin Modal */}
        {showEditModal && editingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Edit Admin</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Username</label>
                  <input
                    type="text"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white opacity-50"
                    value={editingAdmin.username}
                    disabled
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={editingAdmin.collegeCode}
                    onChange={(e) => setEditingAdmin({ ...editingAdmin, collegeCode: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateAdmin(editingAdmin.id, { collegeCode: editingAdmin.collegeCode })}  
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && deletingAdmin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-white mb-4">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete admin "{deletingAdmin.username}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAdmin(deletingAdmin.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}