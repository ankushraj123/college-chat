import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Admin {
  id: number;
  username: string;
  role: 'chief' | 'college' | 'normal';
  collegeCode: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export function ChiefDashboardPage() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: '',
    role: 'normal' as 'chief' | 'college' | 'normal',
    collegeCode: ''
  });

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins');
      if (!response.ok) {
        throw new Error('Failed to fetch admins');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to fetch admins');
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAdmin(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCreateAdmin = async () => {
    try {
      const response = await fetch('/api/admins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username: newAdmin.username, 
          password: newAdmin.password, 
          collegeCode: newAdmin.collegeCode 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create admin');
      }

      // Refresh the list of admins
      fetchAdmins();

      // Clear the input fields
      setNewAdmin({
        username: '',
        password: '',
        role: 'normal',
        collegeCode: ''
      });
      toast.success('Admin created successfully');
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An unknown error occurred');
      }
    }
  };

  const handleUpdateAdmin = async (adminId: number, updates: Partial<Admin>) => {
    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      toast.error('Failed to update admin');
    }
  };

  const handleDeleteAdmin = async (adminId: number) => {
    try {
      const response = await fetch(`/api/admins/${adminId}`, {
        method: 'DELETE',
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
      toast.error('Failed to delete admin');
    }
  };

  const handleToggleStatus = async (adminId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/admins/${adminId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
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
      toast.error('Failed to update status');
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

  return (
    <div
      className="container mx-auto p-4 min-h-screen bg-cover bg-center"
      style={{
        backgroundImage: "url('https://img.freepik.com/free-vector/dark-gradient-background-with-copy-space_53876-99548.jpg?size=626&ext=jpg&ga=GA1.1.1141335507.1718755200&semt=ais_user')",
      }}
    >
      <div className="bg-black bg-opacity-50 p-4 rounded-lg">
        <h1 className="text-4xl font-bold mb-4 text-white text-center">Chief Dashboard</h1>

        <div className="bg-gray-800 bg-opacity-75 shadow-md rounded my-6 p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">Admin Management</h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-purple-600 text-white py-2 px-4 rounded hover:bg-purple-700 transition-colors"
            >
              Create New Admin
            </button>
          </div>
        </div>

        <div className="bg-gray-800 bg-opacity-75 shadow-md rounded my-6">
          <table className="min-w-max w-full table-auto">
            <thead>
              <tr className="bg-gray-900 text-gray-300 uppercase text-sm leading-normal">
                <th className="py-3 px-6 text-left">ID</th>
                <th className="py-3 px-6 text-left">Username</th>
                <th className="py-3 px-6 text-center">Role</th>
                <th className="py-3 px-6 text-center">College Code</th>
                <th className="py-3 px-6 text-center">Status</th>
                <th className="py-3 px-6 text-center">Created</th>
                <th className="py-3 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-gray-200 text-sm font-light">
              {admins.map(admin => (
                <tr key={admin.id} className="border-b border-gray-700 hover:bg-gray-700">
                  <td className="py-3 px-6 text-left whitespace-nowrap">{admin.id}</td>
                  <td className="py-3 px-6 text-left font-medium">{admin.username}</td>
                  <td className="py-3 px-6 text-center">
                    <span className={`py-1 px-3 rounded-full text-xs font-semibold ${
                      admin.role === 'chief' ? 'bg-red-600 text-red-100' :
                      admin.role === 'college' ? 'bg-blue-600 text-blue-100' :
                      'bg-gray-600 text-gray-100'
                    }`}>
                      {admin.role.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3 px-6 text-center font-mono">{admin.collegeCode}</td>
                  <td className="py-3 px-6 text-center">
                    <button
                      onClick={() => handleToggleStatus(admin.id, admin.status)}
                      className={`py-1 px-3 rounded-full text-xs font-semibold transition-colors ${
                        admin.status === 'active' 
                          ? 'bg-green-600 text-green-100 hover:bg-green-700' 
                          : 'bg-red-600 text-red-100 hover:bg-red-700'
                      }`}
                    >
                      {admin.status.toUpperCase()}
                    </button>
                  </td>
                  <td className="py-3 px-6 text-center">{new Date(admin.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-6 text-center">
                    <div className="flex item-center justify-center space-x-2">
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
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
                    value={newAdmin.username}
                    onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
                    placeholder="Enter username"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                  <input
                    type="password"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
                    value={newAdmin.password}
                    onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
                    placeholder="Enter password"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({...newAdmin, role: e.target.value as 'chief' | 'college' | 'normal'})}
                  >
                    <option value="normal">Normal Admin</option>
                    <option value="college">College Admin</option>
                    <option value="chief">Chief Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white placeholder-gray-400"
                    value={newAdmin.collegeCode}
                    onChange={(e) => setNewAdmin({...newAdmin, collegeCode: e.target.value.toUpperCase()})}
                    placeholder="Enter college code"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
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
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={editingAdmin.username}
                    disabled
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Role</label>
                  <select
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={editingAdmin.role}
                    onChange={(e) => setEditingAdmin({...editingAdmin, role: e.target.value as 'chief' | 'college' | 'normal'})}
                  >
                    <option value="normal">Normal Admin</option>
                    <option value="college">College Admin</option>
                    <option value="chief">Chief Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">College Code</label>
                  <input
                    type="text"
                    className="w-full border border-gray-600 p-2 rounded bg-gray-700 text-white"
                    value={editingAdmin.collegeCode}
                    onChange={(e) => setEditingAdmin({...editingAdmin, collegeCode: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateAdmin(editingAdmin.id, {
                    role: editingAdmin.role,
                    collegeCode: editingAdmin.collegeCode
                  })}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
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
              <h3 className="text-xl font-bold text-white mb-4">Confirm Deletion</h3>
              <p className="text-gray-300 mb-4">
                Are you sure you want to delete admin "{deletingAdmin.username}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAdmin(deletingAdmin.id)}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Delete Admin
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}