'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  XCircle,
  Loader2,
  MailIcon
} from 'lucide-react';

// Import components from shadcn
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/avatar";
// Date formatting is handled by native Date methods for now

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'on_leave';
  avatar?: string;
  phone?: string;
  joinDate: string;
  lastActive: string;
  projects: number;
  completedTasks: number;
  pendingTasks: number;
};

const TeamMemberPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<TeamMember[]>([]);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  // Active tab state (unused but kept for future use)
  const [_activeTab] = useState('all');
  // Sort config state (unused but kept for future use)
  const [_sortConfig, _setSortConfig] = useState<{ key: keyof TeamMember; direction: 'asc' | 'desc' } | null>(null);

  // Fetch team members from API
  useEffect(() => {
    fetchTeamMembers();
  }, []);
  const fetchTeamMembers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/auth/team-head/members/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();

      // Transform API data
      const transformed: TeamMember[] = data.map((m: any) => ({
        id: m.id.toString(),
        name: m.username,
        email: m.email,
        role: m.role || 'Team Member',
        status: m.is_active ? 'active' : 'inactive',
        avatar: m.avatar || '',
        phone: m.phone || '',
        joinDate: m.date_joined?.split('T')[0] || '',
        lastActive: m.last_login || new Date().toISOString(),
        projects: m.projects || 0,
        completedTasks: m.completed_tasks || 0,
        pendingTasks: m.pending_tasks || 0
      }));

      setTeamMembers(transformed);
    } catch (error) {
      console.error('Error:', error);
      setTeamMembers([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch team members from API
  useEffect(() => {
    fetchTeamMembers();
  }, []);

  // Filter and search functionality
  useEffect(() => {
    let result = [...teamMembers];

    // Apply status filter
    if (_activeTab !== 'all') {
      result = result.filter(member => member.status === _activeTab);
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        member =>
          member.name.toLowerCase().includes(query) ||
          member.email.toLowerCase().includes(query) ||
          member.role.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(result);
  }, [searchQuery, _activeTab, teamMembers]);

  // Commented out unused functions for future use




  const handleDeleteMember = async () => {
    if (!selectedMember) return;

    try {
      const response = await fetch(`http://localhost:8000/auth/team-head/members/${selectedMember.id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        }
      });

      if (!response.ok) throw new Error('Failed to delete');

      // Refresh the list
      fetchTeamMembers();
      setIsDeleteDialogOpen(false);
      setSelectedMember(null);
    } catch (error) {
      console.error('Error deleting member:', error);
      alert('Failed to delete team member');
    }
  };



  const handleAddMember = async (newMemberData: { name: string; email: string; phone?: string }) => {
    try {
      // Generate username from email (part before @)
      const username = newMemberData.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      const response = await fetch('http://localhost:8000/auth/team-head/members/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        body: JSON.stringify({
          username: username,
          email: newMemberData.email,
          first_name: newMemberData.name.split(' ')[0] || '',
          last_name: newMemberData.name.split(' ').slice(1).join(' ') || '',
          password: 'Welcome123!',
          phone: newMemberData.phone || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.username?.[0] || errorData.email?.[0] || 'Failed to add member';
        throw new Error(errorMessage);
      }

      // Refresh the list
      await fetchTeamMembers();
      setIsAddMemberOpen(false);

      alert('Team member added successfully! Default password: Welcome123!');
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert(`Failed to add team member: ${error.message || 'Unknown error'}`);
    }
  };







  // MailIcon is used in the JSX for displaying email icons

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-600 mt-1">Manage your team members and their permissions</p>
        </div>
        <div className="flex gap-3">
          <div className="relative flex-1 md:flex-initial">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by name, email, or role..."
              className="pl-10 pr-10 w-full md:w-80 h-11 bg-white border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XCircle className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            className="gap-2 h-11 px-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:shadow-md"
            onClick={() => setIsAddMemberOpen(true)}
          >
            <UserPlus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Member</span>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          <span className="ml-2 text-gray-600">Loading team members...</span>
        </div>
      ) : (
        <Card className="mb-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Projects
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <Avatar className="h-10 w-10">
                              <img src={member.avatar} alt={member.name} />
                              <span className="text-sm font-medium text-gray-900 group-hover:text-gray-600">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </Avatar>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <MailIcon className="h-3.5 w-3.5 mr-1 text-gray-400" />
                              {member.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{member.role}</div>
                        <div className="text-sm text-gray-500">
                          Joined {new Date(member.joinDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {member.status === 'active' ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : member.status === 'on_leave' ? (
                          <Badge className="bg-yellow-100 text-yellow-800">On Leave</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {member.projects} projects
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            // Handle edit action
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedMember(member);
                            setIsDeleteDialogOpen(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No team members found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Member Modal */}
      <AnimatePresence>
        {isAddMemberOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Add Team Member</h2>
                  <p className="text-sm text-gray-500 mt-1">Invite a new member to your team</p>
                </div>
                <button
                  onClick={() => setIsAddMemberOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>
              <div className="space-y-5">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    type="text"
                    className="block w-full h-11 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="block w-full h-11 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="email@example.com"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    id="phone"
                    type="tel"
                    className="block w-full h-11 border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> Default password will be <code className="bg-blue-100 px-1.5 py-0.5 rounded">Welcome123!</code>
                  </p>
                </div>
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddMemberOpen(false)}
                    className="px-5 h-11"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      const nameInput = document.getElementById('name') as HTMLInputElement;
                      const emailInput = document.getElementById('email') as HTMLInputElement;
                      const phoneInput = document.getElementById('phone') as HTMLInputElement;

                      if (nameInput?.value && emailInput?.value) {
                        handleAddMember({
                          name: nameInput.value,
                          email: emailInput.value,
                          phone: phoneInput?.value
                        });
                      } else {
                        alert('Please fill in all required fields');
                      }
                    }}
                    className="px-5 h-11 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all hover:shadow-md"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Dialog */}
      <AnimatePresence>
        {isDeleteDialogOpen && selectedMember && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="sm:flex sm:items-start">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 className="text-lg leading-6 font-bold text-gray-900">
                    Remove Team Member
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">
                      Are you sure you want to remove <strong>{selectedMember.name}</strong> from the team? This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3">
                <button
                  type="button"
                  className="w-full inline-flex justify-center items-center rounded-lg border border-transparent shadow-sm px-5 py-2.5 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all sm:w-auto sm:text-sm"
                  onClick={handleDeleteMember}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Remove
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-5 py-2.5 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setIsDeleteDialogOpen(false);
                    setSelectedMember(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamMemberPage;