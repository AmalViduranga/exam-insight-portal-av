import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, ConfirmDialog } from '../components/ui';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { UserPlus, Shield, User, Ban, CheckCircle, Key } from 'lucide-react';

export function UserManagement() {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreating, setIsCreating] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'ADMIN' | 'USER'>('USER');
  
  const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean, action: string, userId: string | null, title: string, desc: string }>({
    isOpen: false, action: '', userId: null, title: '', desc: ''
  });

  if (user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      addToast('Failed to load users', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      addToast('Password must be at least 6 characters', 'error');
      return;
    }
    
    setIsCreating(true);
    try {
      await api.post('/admin/users', {
        username: newUsername,
        fullName: newFullName,
        password: newPassword,
        role: newRole
      });
      addToast('User created successfully', 'success');
      setNewUsername('');
      setNewFullName('');
      setNewPassword('');
      setNewRole('USER');
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Failed to create user', 'error');
    } finally {
      setIsCreating(false);
    }
  };

  const executeAction = async () => {
    const { action, userId } = confirmDialog;
    if (!userId) return;
    
    try {
      if (action === 'disable') {
        await api.patch(`/admin/users/${userId}/disable`);
        addToast('User disabled', 'success');
      } else if (action === 'enable') {
        await api.patch(`/admin/users/${userId}/enable`);
        addToast('User enabled', 'success');
      } else if (action === 'reset') {
        const tempPassword = Math.random().toString(36).slice(-8);
        await api.patch(`/admin/users/${userId}/password`, { password: tempPassword });
        addToast(`Password reset successfully to: ${tempPassword}`, 'success');
      }
      fetchUsers();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Action failed', 'error');
    } finally {
      setConfirmDialog({ ...confirmDialog, isOpen: false });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access, create new accounts, and assign roles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
        {/* Create User Form */}
        <div className="xl:col-span-1">
          <Card className="shadow-sm border-slate-200 rounded-2xl sticky top-24">
            <CardHeader className="bg-slate-50/80 border-b border-slate-200 pb-5 pt-6 px-6">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-900">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-inner">
                  <UserPlus className="w-5 h-5" />
                </div>
                Create New User
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleCreateUser} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Full Name</label>
                  <Input required value={newFullName} onChange={e => setNewFullName(e.target.value)} placeholder="e.g. John Doe" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Username</label>
                  <Input required value={newUsername} onChange={e => setNewUsername(e.target.value)} placeholder="e.g. johndoe" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Password</label>
                  <Input required type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Minimum 6 characters" className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700 block mb-1.5 ml-1">Role</label>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setNewRole('USER')}
                      className={`flex-1 py-2.5 px-3 border-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${newRole === 'USER' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      <User className="w-4 h-4" />
                      User
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewRole('ADMIN')}
                      className={`flex-1 py-2.5 px-3 border-2 rounded-xl text-sm font-bold transition-all flex flex-col items-center gap-1 ${newRole === 'ADMIN' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'}`}
                    >
                      <Shield className="w-4 h-4" />
                      Admin
                    </button>
                  </div>
                </div>
                <Button type="submit" disabled={isCreating} className="w-full h-12 rounded-xl mt-4 font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm">
                  {isCreating ? 'Creating User...' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <div className="xl:col-span-2">
          <Card className="shadow-sm border-slate-200 rounded-2xl overflow-hidden h-full">
            <CardHeader className="bg-white border-b border-slate-200 py-5 px-6 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold text-slate-900">Active Accounts</CardTitle>
              <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold">{users.length} Users</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-200 uppercase text-xs font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-4">User</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Joined</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {loading ? (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium">Loading user data...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={5} className="text-center py-12 text-slate-500 font-medium">No users found.</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold shadow-sm shrink-0">
                                {u.fullName.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-base">{u.fullName}</div>
                                <div className="text-slate-500 text-sm font-medium mt-0.5">@{u.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {u.role === 'ADMIN' ? (
                              <Badge className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 px-2.5 py-1">Admin</Badge>
                            ) : (
                              <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 px-2.5 py-1" variant="outline">User</Badge>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {u.isActive ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-xs border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Disabled
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-slate-500 font-medium">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="h-9 w-9 p-0 rounded-lg bg-white border-slate-200 hover:border-indigo-300 hover:text-indigo-600 shadow-sm transition-colors"
                                title="Reset Password"
                                onClick={() => setConfirmDialog({
                                  isOpen: true, action: 'reset', userId: u.id, 
                                  title: 'Reset Password', desc: `Are you sure you want to reset the password for ${u.fullName}? A random password will be generated.`
                                })}
                              >
                                <Key className="w-4 h-4" />
                              </Button>
                              {u.isActive ? (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-lg bg-white border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-colors"
                                  title="Disable User"
                                  disabled={u.id === user.id}
                                  onClick={() => setConfirmDialog({
                                    isOpen: true, action: 'disable', userId: u.id, 
                                    title: 'Disable User', desc: `Are you sure you want to disable access for ${u.fullName}?`
                                  })}
                                >
                                  <Ban className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  className="h-9 w-9 p-0 rounded-lg bg-white border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 shadow-sm transition-colors"
                                  title="Enable User"
                                  onClick={() => setConfirmDialog({
                                    isOpen: true, action: 'enable', userId: u.id, 
                                    title: 'Enable User', desc: `Are you sure you want to restore access for ${u.fullName}?`
                                  })}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={executeAction}
        title={confirmDialog.title}
        description={confirmDialog.desc}
        variant={confirmDialog.action === 'disable' ? 'destructive' : 'default'}
      />
    </div>
  );
}
