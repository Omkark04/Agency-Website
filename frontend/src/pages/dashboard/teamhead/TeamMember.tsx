'use client';

import { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Edit,
  Trash2,
  XCircle,
  Loader2,
  Mail as MailIcon
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
      const response = await fetch('http://localhost:8000/auth/team-head/members/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access')}`
        },
        body: JSON.stringify({
          username: newMemberData.name,
          email: newMemberData.email,
          password: 'Welcome123!', // Default password - user should change
          phone: newMemberData.phone || ''
        })
      });

      if (!response.ok) throw new Error('Failed to add member');

      // Refresh the list
      await fetchTeamMembers();
      setIsAddMemberOpen(false);


      alert('Team member added successfully! Default password: Welcome123!');
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add team member');
    }
  };






  // MailIcon is used in the JSX for displaying email icons

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
          <p className="text-gray-500">Manage your team members and their permissions</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="text"
              placeholder="Search team members..."
              className="pl-10 w-full md:w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button className="gap-2" onClick={() => setIsAddMemberOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Add Member
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
      {isAddMemberOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add Team Member</h2>
              <button
                onClick={() => setIsAddMemberOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XCircle className="h-6 w-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="name"
                  type="text"
                  className="mt-1 block w-full"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1 block w-full"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="developer">Developer</option>
                  <option value="designer">Designer</option>
                  <option value="manager">Project Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsAddMemberOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    const nameInput = document.getElementById('name') as HTMLInputElement;
                    const emailInput = document.getElementById('email') as HTMLInputElement;

                    if (nameInput?.value && emailInput?.value) {
                      handleAddMember({
                        name: nameInput.value,
                        email: emailInput.value
                      });
                    }
                  }}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Remove team member
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Are you sure you want to remove {selectedMember.name} from the team? This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={handleDeleteMember}
              >
                Remove
              </button>
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:w-auto sm:text-sm"
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setSelectedMember(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamMemberPage;