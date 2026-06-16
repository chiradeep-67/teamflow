import { useState, useEffect } from 'react';
import {
  Building2, Plus, Trash2, Save, Loader2, Check,
  AlertTriangle, Tag,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { workspaceAPI } from '../services/api';
import { cn } from '../utils/cn';

export default function SettingsPage() {
  const { workspace, setWorkspace, isAdmin, workspaceLoaded } = useAuth();

  const [name, setName]           = useState('');
  const [departments, setDepts]   = useState([]);
  const [newDept, setNewDept]     = useState('');
  const [saving, setSaving]       = useState(false);
  const [deptLoading, setDeptLoading] = useState(null);
  const [saved, setSaved]         = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    if (workspace) {
      setName(workspace.name || '');
      setDepts(workspace.departments || []);
    }
  }, [workspace]);

  const handleSaveName = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Workspace name is required'); return; }
    setSaving(true);
    setError('');
    try {
      const { data } = await workspaceAPI.update({ name: name.trim() });
      setWorkspace(data.workspace);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save workspace settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDept = async () => {
    const trimmed = newDept.trim();
    if (!trimmed) return;
    if (departments.includes(trimmed)) { setError('Department already exists'); return; }
    setDeptLoading('add');
    setError('');
    try {
      const { data } = await workspaceAPI.addDepartment(trimmed);
      setWorkspace(data.workspace);
      setDepts(data.workspace.departments || []);
      setNewDept('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add department');
    } finally {
      setDeptLoading(null);
    }
  };

  const handleRemoveDept = async (dept) => {
    setDeptLoading(dept);
    setError('');
    try {
      const { data } = await workspaceAPI.deleteDepartment(dept);
      setWorkspace(data.workspace);
      setDepts(data.workspace.departments || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove department');
    } finally {
      setDeptLoading(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center py-24">
        <Building2 size={32} className="text-gray-300 dark:text-gray-700 mx-auto mb-3" />
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Admin access required</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Only workspace admins can change settings.
        </p>
      </div>
    );
  }

  if (!workspaceLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={24} className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          Manage your organisation name and departments
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Workspace name */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">General</h2>
        </div>
        <form onSubmit={handleSaveName} className="space-y-4">
          <Input
            label="Workspace name"
            value={name}
            onChange={e => { setName(e.target.value); setError(''); }}
            placeholder="Your organisation name"
            leftIcon={<Building2 size={14} />}
          />
          {workspace?.slug && (
            <p className="text-xs text-gray-400 dark:text-gray-600">
              Slug: <span className="font-mono">{workspace.slug}</span>
            </p>
          )}
          <div className="flex justify-end">
            <Button type="submit" size="sm" isLoading={saving}
              leftIcon={saved ? <Check size={13} /> : <Save size={13} />}>
              {saved ? 'Saved!' : 'Save changes'}
            </Button>
          </div>
        </form>
      </div>

      {/* Departments */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200/70 dark:border-gray-800 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Tag size={16} className="text-indigo-500" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Departments</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Departments appear when adding team members. Members can be assigned to a department.
        </p>

        <div className="flex gap-2 mb-4">
          <Input
            placeholder="e.g. Engineering, Design…"
            value={newDept}
            onChange={e => setNewDept(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddDept())}
          />
          <Button
            size="sm"
            onClick={handleAddDept}
            isLoading={deptLoading === 'add'}
            disabled={!newDept.trim()}
            leftIcon={<Plus size={13} />}
            className="shrink-0"
          >
            Add
          </Button>
        </div>

        {departments.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-600 py-4 text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl">
            No departments yet — add one above
          </p>
        ) : (
          <div className="space-y-2">
            {departments.map(dept => (
              <div
                key={dept}
                className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
              >
                <span className="text-sm text-gray-800 dark:text-gray-200">{dept}</span>
                <button
                  onClick={() => handleRemoveDept(dept)}
                  disabled={deptLoading === dept}
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center transition-colors',
                    'text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10',
                    deptLoading === dept && 'opacity-50',
                  )}
                  title="Remove department"
                >
                  {deptLoading === dept
                    ? <Loader2 size={13} className="animate-spin" />
                    : <Trash2 size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Danger zone */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-100 dark:border-red-500/20 p-6">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={16} className="text-red-500" />
          <h2 className="text-sm font-semibold text-red-600 dark:text-red-400">Danger zone</h2>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          Organisation deletion is not available yet. To remove test data, contact support or use the seed/reset scripts locally.
        </p>
        <Button variant="danger" size="sm" disabled>
          Delete organisation
        </Button>
      </div>
    </div>
  );
}
