import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaUsers, FaUserShield, FaUserPlus, FaUserMinus, FaTrash } from 'react-icons/fa';
import LogoutButton from '../../../../components/LogoutButton';

const TeamDetails = () => {
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [membersToRemove, setMembersToRemove] = useState([]);
    const [usersToAdd, setUsersToAdd] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const baseUrl = import.meta.env.VITE_API_BASE_URL;

    const navigate = useNavigate();
    const { teamID } = useParams();

    useEffect(() => {
        const fetchTeamDetails = async () => {
            try {
                const response = await axios.get(`${baseUrl}/teams/${teamID}`);
                setTeamData(response.data.data);
            } catch (err) {
                setError('Failed to fetch team details');
                toast.error('Failed to load team details');
            } finally {
                setLoading(false);
            }
        };

        fetchTeamDetails();
    }, [teamID]);

    const handleDeleteTeam = async () => {
        if (!window.confirm('Are you sure you want to delete this team?')) return;

        try {
            await axios.delete(`${baseUrl}/teams/${teamID}`);
            toast.success('Team deleted successfully');
            navigate('/dashboard/allteam');
        } catch (err) {
            toast.error('Failed to delete team');
        }
    };

    const handleAddMemberClick = async () => {
        try {
            const response = await axios.get(`${baseUrl}/unassigned-users`);
            const unassignedUsers = response.data.data;

            if (!unassignedUsers || unassignedUsers.length === 0) {
                toast.info("No unassigned users available.");
                return;
            }

            setUsersToAdd(unassignedUsers);
            setShowAddModal(true);
        } catch (err) {
            toast.error('Failed to load unassigned users');
        }
    };

    const confirmAddMember = async () => {
        if (!selectedUser) {
            toast.warn("Please select a user to add");
            return;
        }

        try {
            await axios.patch(`${baseUrl}/teams/${teamID}/add-member`, {
                member_id: selectedUser.userID
            });

            toast.success(`${selectedUser.Name} added successfully`);
            setShowAddModal(false);
            setSelectedUser(null);

            const updatedResponse = await axios.get(`${baseUrl}/teams/${teamID}`);
            setTeamData(updatedResponse.data.data);
        } catch (err) {
            toast.error(`Failed to add member: ${err.response?.data?.message || err.message}`);
        }
    };

    const handleRemoveMemberClick = async () => {
        try {
            const response = await axios.get(`${baseUrl}/teams/${teamID}`);
            const teamMembers = response.data.data?.team_members;

            if (!teamMembers || teamMembers.length === 0) {
                toast.info("No team members found.");
                return;
            }

            setMembersToRemove(teamMembers);
            setShowRemoveModal(true);
        } catch (err) {
            toast.error("Failed to load team members");
        }
    };

    const confirmRemoveMember = async () => {
        if (!selectedMember) {
            toast.warn("Please select a member to remove");
            return;
        }

        try {
            await axios.patch(`${baseUrl}/teams/${teamID}/remove-member`, {
                member_id: selectedMember.userID
            });

            toast.success(`${selectedMember.name} removed successfully`);
            setShowRemoveModal(false);
            setSelectedMember(null);

            const updatedResponse = await axios.get(`${baseUrl}/teams/${teamID}`);
            setTeamData(updatedResponse.data.data);
        } catch (err) {
            toast.error(`Failed to remove member: ${err.response?.data?.message || err.message}`);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='flex items-center justify-end mb-4'>
                <LogoutButton />
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-sm text-red-700">{error}</p>
                </div>
            ) : teamData && (
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white shadow rounded p-6 mb-6">
                        <h2 className="text-2xl font-semibold mb-4 flex items-center">
                            <FaUsers className="mr-2 text-blue-600" /> Team Info
                        </h2>
                        <p><strong>Team Name:</strong> {teamData.team_name}</p>
                        <p><strong>Team Leader:</strong> {teamData.team_leader?.name}</p>
                        <h3 className="text-lg mt-4 font-medium">Members</h3>
                        <ul className="list-disc pl-6">
                            {teamData.team_members.map(member => (
                                <li key={member.userID}>{member.name}</li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex gap-4">
                        <button onClick={handleAddMemberClick} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center">
                            <FaUserPlus className="mr-2" /> Add Member
                        </button>
                        <button onClick={handleRemoveMemberClick} className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center">
                            <FaUserMinus className="mr-2" /> Remove Member
                        </button>
                        <button onClick={handleDeleteTeam} className="bg-red-600 text-white px-4 py-2 rounded flex items-center">
                            <FaTrash className="mr-2" /> Delete Team
                        </button>
                    </div>
                </div>
            )}

            {showAddModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-gray-50 p-6 rounded w-full max-w-md shadow-lg">
                        <h3 className="text-lg font-semibold mb-4">Select User to Add</h3>
                        {usersToAdd.map(user => (
                            <div
                                key={user.userID}
                                onClick={() => setSelectedUser(user)}
                                className={`p-2 rounded cursor-pointer ${selectedUser?.userID === user.userID ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                            >
                                {user.Name}
                            </div>
                        ))}
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={confirmAddMember} className="px-4 py-2 bg-green-600 text-white rounded">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            {showRemoveModal && (
                <div className="fixed inset-0 bg-transparent bg-opacity-30 flex items-center justify-center z-50">
                    <div className="bg-gray-50 p-6 rounded shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Select Member to Remove</h3>
                        {membersToRemove.map(member => (
                            <div
                                key={member.userID}
                                onClick={() => setSelectedMember(member)}
                                className={`p-2 rounded cursor-pointer ${selectedMember?.userID === member.userID ? 'bg-red-100' : 'hover:bg-gray-100'}`}
                            >
                                {member.name}
                            </div>
                        ))}
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setShowRemoveModal(false)} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
                            <button onClick={confirmRemoveMember} className="px-4 py-2 bg-red-600 text-white rounded">Confirm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TeamDetails;
