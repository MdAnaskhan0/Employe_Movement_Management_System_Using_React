import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import { FiDownload, FiSearch, FiCalendar } from 'react-icons/fi';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select';
import {
    FiEdit,
    FiSave,
    FiUser,
    FiBriefcase,
    FiHome,
    FiPhone,
    FiClock,
    FiMapPin,
    FiUsers,
    FiTarget,
    FiFileText,
    FiChevronLeft,
    FiChevronRight,
    FiChevronsLeft,
    FiChevronsRight
} from 'react-icons/fi';
import styled from 'styled-components';
import { Skeleton } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Styled Components
const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.h1`
  color: #2c3e50;
  font-weight: 600;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ProfileSection = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ProfileCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3498db, #2c3e50);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
`;

const UserName = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
`;

const UserTitle = styled.p`
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
`;

const UserDetails = styled.div`
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.75rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const DetailIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #f0f7ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  color: #3498db;
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailLabel = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 0.2rem;
`;

const DetailValue = styled.div`
  font-size: 1rem;
  font-weight: 500;
  color: #2c3e50;
`;

const SectionTitle = styled.h2`
  color: #2c3e50;
  font-weight: 600;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const TableContainer = styled.div`
  overflow-x: auto;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
`;

const TableHeader = styled.thead`
  background-color: #000000;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f8f9fa;
  }
  &:hover {
    background-color: #f0f7ff;
  }
`;

const TableCell = styled.td`
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
  text-align: left;
  color: #4a5568;
`;

const TableHeaderCell = styled.th`
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #ffffff;
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.5px;
`;

const InputField = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
  font-family: inherit;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  background-color: ${props => props.primary ? '#3498db' : '#f8f9fa'};
  color: ${props => props.primary ? 'white' : '#495057'};
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : '#e9ecef'};
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const PaginationInfo = styled.div`
  font-size: 0.85rem;
  color: #718096;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#4a5568'};
  cursor: pointer;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s;
  min-width: 36px;
  justify-content: center;

  &:hover {
    background-color: ${props => props.active ? '#2980b9' : '#f8f9fa'};
    border-color: #cbd5e0;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  background-color: ${props =>
        props.status === 'In' ? '#e3f9e5' :
            props.status === 'Out' ? '#ffe3e3' : '#f0f7ff'};
  color: ${props =>
        props.status === 'In' ? '#1b7052' :
            props.status === 'Out' ? '#c92a2a' : '#1864ab'};
`;

const SkeletonRow = styled.tr`
  td {
    padding: 15px;
  }
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  align-items: center;
`;

const SearchInput = styled.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  input {
    padding: 8px 12px 8px 35px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    width: 100%;
    font-family: inherit;
    font-size: 0.9rem;
    transition: all 0.2s;

    &:focus {
      outline: none;
      border-color: #3498db;
      box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    }
  }

  svg {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #7f8c8d;
  }
`;

const DateFilterContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;

  .react-datepicker-wrapper {
    width: 120px;
  }

  .react-datepicker__input-container input {
    border: none;
    width: 100%;
    font-size: 0.9rem;
    color: #4a5568;
  }
`;

const DownloadButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #2980b9;
  }
`;

const DropdownWrapper = styled.div`
  .dropdown__control {
    color: #4a5568;
    font-size: 0.9rem;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background-color: white;
    padding: 2px 4px;
    min-height: 38px;
    transition: all 0.2s;
  }

  .dropdown__control--is-focused {
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }

  .dropdown__menu {
    z-index: 9999;
  }
`;



const UserReport = () => {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [movementData, setMovementData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [editRowId, setEditRowId] = useState(null);
    const [editFormData, setEditFormData] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState({
        startDate: null,
        endDate: null
    });

    useEffect(() => {
        const fetchData = async () => {
            if (!user || !user.userID) return;

            setIsLoading(true);
            try {
                const userRes = await axios.get(`http://192.168.111.140:5137/users/${user.userID}`);
                const movementRes = await axios.get(`http://192.168.111.140:5137/get_movement/${user.userID}`);

                setUserData(userRes.data.data);
                const movement = movementRes.data;
                const dataArray = Array.isArray(movement) ? movement : [movement];
                setMovementData(dataArray);
                setFilteredData(dataArray);
            } catch (err) {
                console.error('Error fetching user or movement data:', err);
                toast.error('Failed to load data. Please try again.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [user]);

    // Apply filters whenever search term or date range changes
    useEffect(() => {
        let result = movementData;

        // Apply search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item =>
                (item.placeName && item.placeName.toLowerCase().includes(term)) ||
                (item.partyName && item.partyName.toLowerCase().includes(term)) ||
                (item.purpose && item.purpose.toLowerCase().includes(term)) ||
                (item.punchTime && item.punchTime.toLowerCase().includes(term))

            );
        }

        // Apply status filter
        if (statusFilter) {
            result = result.filter(item => item.punchTime?.includes(statusFilter));
        }

        // Apply date filter
        if (dateFilter.startDate || dateFilter.endDate) {
            result = result.filter(item => {
                const itemDate = new Date(item.dateTime);
                const start = dateFilter.startDate ? new Date(dateFilter.startDate) : null;
                const end = dateFilter.endDate ? new Date(dateFilter.endDate) : null;

                if (start && end) {
                    start.setHours(0, 0, 0, 0);
                    end.setHours(23, 59, 59, 999);
                    return itemDate >= start && itemDate <= end;
                } else if (start) {
                    start.setHours(0, 0, 0, 0);
                    return itemDate >= start;
                } else if (end) {
                    end.setHours(23, 59, 59, 999);
                    return itemDate <= end;
                }
                return true;
            });
        }

        setFilteredData(result);
        setCurrentPage(1); // Reset to first page when filters change
    }, [searchTerm, dateFilter, movementData, statusFilter]);

    // Pagination logic
    const indexOfLastRow = currentPage * rowsPerPage;
    const indexOfFirstRow = indexOfLastRow - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const handleEditClick = (movement) => {
        setEditRowId(movement.movementID);
        setEditFormData({
            ...movement,
            punchingTime: movement.punchingTime || '',
            purpose: movement.purpose || '',
            remark: movement.remark || ''
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSaveClick = async () => {
        try {
            await axios.put(`http://192.168.111.140:5137/update_movement/${editRowId}`, editFormData);

            setMovementData((prevData) =>
                prevData.map((item) =>
                    item.movementID === editRowId ? { ...item, ...editFormData } : item
                )
            );

            setEditRowId(null);
            toast.success('Movement record updated successfully!');
        } catch (err) {
            console.error('Error updating movement record:', err);
            toast.error('Failed to update record. Please try again.');
        }
    };

    const handleCancelClick = () => {
        setEditRowId(null);
    };

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const getInitials = (name) => {
        if (!name) return '';
        const names = name.split(' ');
        return names.map(n => n[0]).join('').toUpperCase();
    };

    const pageSizeOptions = [
        { value: 5, label: '5 rows' },
        { value: 10, label: '10 rows' },
        { value: 20, label: '20 rows' },
        { value: 50, label: '50 rows' },
        { value: 100, label: '100 rows' }
    ];

    const downloadCSV = () => {
        // Prepare CSV header
        const headers = [
            'Date',
            'Status',
            'Punch Time',
            'Visit Status',
            'Place',
            'Party',
            'Purpose',
            'Remarks'
        ].join(',');

        // Prepare CSV rows
        const rows = filteredData.map(row => {
            return [
                new Date(row.dateTime).toLocaleDateString('en-US'),
                row.punchTime || 'N/A',
                row.punchingTime || 'N/A',
                row.visitingStatus,
                row.placeName,
                row.partyName,
                row.purpose || '-',
                row.remark || '-'
            ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
        });

        // Combine header and rows
        const csvContent = [headers, ...rows].join('\n');

        // Create download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `movement_report_${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const clearDateFilters = () => {
        setDateFilter({ startDate: null, endDate: null });
    };

    if (isLoading && !userData) {
        return (
            <Container>
                <Header>User Report</Header>
                <ProfileSection>
                    <ProfileCard>
                        <Skeleton variant="circular" width={100} height={100} />
                        <Skeleton variant="text" width={120} height={30} style={{ marginBottom: '0.5rem' }} />
                        <Skeleton variant="text" width={80} height={20} />
                    </ProfileCard>
                    <UserDetails>
                        {[...Array(5)].map((_, i) => (
                            <DetailItem key={i}>
                                <Skeleton variant="rectangular" width={40} height={40} style={{ marginRight: '1rem' }} />
                                <DetailContent>
                                    <Skeleton variant="text" width={80} height={15} style={{ marginBottom: '0.2rem' }} />
                                    <Skeleton variant="text" width={120} height={20} />
                                </DetailContent>
                            </DetailItem>
                        ))}
                    </UserDetails>
                </ProfileSection>
                <SectionTitle>Movement Data</SectionTitle>
                <TableContainer>
                    <StyledTable>
                        <TableHeader>
                            <tr>
                                {[...Array(8)].map((_, i) => (
                                    <TableHeaderCell key={i}>
                                        <Skeleton variant="text" width={80} height={15} />
                                    </TableHeaderCell>
                                ))}
                            </tr>
                        </TableHeader>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <SkeletonRow key={i}>
                                    {[...Array(8)].map((_, j) => (
                                        <TableCell key={j}>
                                            <Skeleton variant="text" width="80%" height={20} />
                                        </TableCell>
                                    ))}
                                </SkeletonRow>
                            ))}
                        </tbody>
                    </StyledTable>
                </TableContainer>
            </Container>
        );
    }

    if (!user || !userData) {
        return (
            <Container>
                <Header>User Report</Header>
                <div>No user data available.</div>
            </Container>
        );
    }

    return (
        <Container>
            <ToastContainer position="top-right" autoClose={3000} />
            <Header>User Report</Header>

            <ProfileSection>
                <ProfileCard>
                    <Avatar>{getInitials(userData.Name)}</Avatar>
                    <UserName>{userData.Name}</UserName>
                    <UserTitle>{userData.Designation}</UserTitle>
                </ProfileCard>

                <UserDetails>
                    <DetailItem>
                        <DetailIcon>
                            <FiBriefcase size={18} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Designation</DetailLabel>
                            <DetailValue>{userData.Designation}</DetailValue>
                        </DetailContent>
                    </DetailItem>
                    <DetailItem>
                        <DetailIcon>
                            <FiHome size={18} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Department</DetailLabel>
                            <DetailValue>{userData.Department}</DetailValue>
                        </DetailContent>
                    </DetailItem>
                    <DetailItem>
                        <DetailIcon>
                            <FiBriefcase size={18} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Company</DetailLabel>
                            <DetailValue>{userData.Company_name}</DetailValue>
                        </DetailContent>
                    </DetailItem>
                    <DetailItem>
                        <DetailIcon>
                            <FiPhone size={18} />
                        </DetailIcon>
                        <DetailContent>
                            <DetailLabel>Phone</DetailLabel>
                            <DetailValue>{userData.Phone}</DetailValue>
                        </DetailContent>
                    </DetailItem>
                </UserDetails>
            </ProfileSection>

            <SectionTitle>
                <FiClock size={20} />
                Movement History
            </SectionTitle>

            <FilterContainer>
                <SearchInput>
                    <FiSearch size={18} />
                    <input
                        type="text"
                        placeholder="Search by place, party, purpose..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </SearchInput>

                {/* Sort by Status */}
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-2 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
                    <option value="">Punch Status</option>
                    <option value="Punch In">Punch In</option>
                    <option value="Punch Out">Punch Out</option>
                </select>

                <DateFilterContainer>
                    <FiCalendar size={16} />
                    <span>From:</span>
                    <DatePicker
                        selected={dateFilter.startDate}
                        onChange={(date) => setDateFilter({ ...dateFilter, startDate: date })}
                        selectsStart
                        startDate={dateFilter.startDate}
                        endDate={dateFilter.endDate}
                        placeholderText="Start date"
                        dateFormat="dd MMM yyyy"
                        isClearable
                    />
                    <span>To:</span>
                    <DatePicker
                        selected={dateFilter.endDate}
                        onChange={(date) => setDateFilter({ ...dateFilter, endDate: date })}
                        selectsEnd
                        startDate={dateFilter.startDate}
                        endDate={dateFilter.endDate}
                        minDate={dateFilter.startDate}
                        placeholderText="End date"
                        dateFormat="dd MMM yyyy"
                        isClearable
                    />
                    {(dateFilter.startDate || dateFilter.endDate) && (
                        <ActionButton onClick={clearDateFilters} style={{ marginLeft: '0.5rem' }}>
                            Clear
                        </ActionButton>
                    )}
                </DateFilterContainer>

                <DownloadButton onClick={downloadCSV}>
                    <FiDownload size={16} />
                    Download CSV ({filteredData.length} records)
                </DownloadButton>
            </FilterContainer>

            {filteredData.length === 0 ? (
                <TableContainer style={{ padding: '2rem', textAlign: 'center' }}>
                    {isLoading ? 'Loading...' : 'No movement data found matching your criteria.'}
                </TableContainer>
            ) : (
                <>
                    <TableContainer>
                        <StyledTable>
                            <TableHeader className='bg-gray-600'>
                                <tr>
                                    <TableHeaderCell>Date</TableHeaderCell>
                                    <TableHeaderCell>Punch Time</TableHeaderCell>
                                    <TableHeaderCell>Punch Status</TableHeaderCell>
                                    <TableHeaderCell>Visit Status</TableHeaderCell>
                                    <TableHeaderCell>Place</TableHeaderCell>
                                    <TableHeaderCell>Party</TableHeaderCell>
                                    <TableHeaderCell>Purpose</TableHeaderCell>
                                    <TableHeaderCell>Remarks</TableHeaderCell>
                                    <TableHeaderCell>Actions</TableHeaderCell>
                                </tr>
                            </TableHeader>
                            <tbody>
                                {currentRows.map((mv) => (
                                    <TableRow key={mv.movementID}>
                                        <TableCell>
                                            {new Date(mv.dateTime).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell>
                                            {editRowId === mv.movementID ? (
                                                <InputField
                                                    type="time"
                                                    name="punchingTime"
                                                    value={editFormData.punchingTime}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                mv.punchingTime
                                                    ? new Date(`1970-01-01T${mv.punchingTime}`).toLocaleTimeString('en-US', {
                                                        hour: 'numeric',
                                                        minute: 'numeric',
                                                        hour12: true,
                                                    })
                                                    : 'N/A'
                                            )}
                                        </TableCell>

                                        <TableCell>
                                            <StatusBadge status={mv.punchTime?.includes('In') ? 'In' : 'Out'}>
                                                {mv.punchTime || 'N/A'}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell>
                                            <StatusBadge status={mv.visitingStatus}>
                                                {mv.visitingStatus}
                                            </StatusBadge>
                                        </TableCell>
                                        <TableCell>{mv.placeName}</TableCell>
                                        <TableCell>{mv.partyName}</TableCell>
                                        <TableCell>
                                            {editRowId === mv.movementID ? (
                                                <InputField
                                                    type="text"
                                                    name="purpose"
                                                    value={editFormData.purpose}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                mv.purpose || '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editRowId === mv.movementID ? (
                                                <InputField
                                                    type="text"
                                                    name="remark"
                                                    value={editFormData.remark}
                                                    onChange={handleInputChange}
                                                />
                                            ) : (
                                                mv.remark || '-'
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {editRowId === mv.movementID ? (
                                                <div style={{ display: 'flex', gap: '5px' }}>
                                                    <ActionButton primary onClick={handleSaveClick}>
                                                        <FiSave size={14} /> Save
                                                    </ActionButton>
                                                    <ActionButton onClick={handleCancelClick}>
                                                        Cancel
                                                    </ActionButton>
                                                </div>
                                            ) : (
                                                <ActionButton onClick={() => handleEditClick(mv)}>
                                                    <FiEdit size={14} /> Edit
                                                </ActionButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </tbody>
                        </StyledTable>
                    </TableContainer>

                    <PaginationContainer>
                        <DropdownWrapper>
                            <Select
                                options={pageSizeOptions}
                                onChange={(e) => setRowsPerPage(e.value)}
                                value={pageSizeOptions.find(opt => opt.value === rowsPerPage)}
                                placeholder="Rows per page"
                                classNamePrefix="dropdown"
                                menuPlacement="auto" // ensures it opens upward if needed
                            />
                        </DropdownWrapper>


                        <PaginationInfo>
                            Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredData.length)} of {filteredData.length} entries
                        </PaginationInfo>
                        <PaginationButtons>
                            <PaginationButton
                                onClick={() => paginate(1)}
                                disabled={currentPage === 1}
                            >
                                <FiChevronsLeft size={16} />
                            </PaginationButton>
                            <PaginationButton
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <FiChevronLeft size={16} />
                            </PaginationButton>

                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) {
                                    pageNum = i + 1;
                                } else if (currentPage <= 3) {
                                    pageNum = i + 1;
                                } else if (currentPage >= totalPages - 2) {
                                    pageNum = totalPages - 4 + i;
                                } else {
                                    pageNum = currentPage - 2 + i;
                                }

                                return (
                                    <PaginationButton
                                        key={pageNum}
                                        onClick={() => paginate(pageNum)}
                                        active={currentPage === pageNum}
                                    >
                                        {pageNum}
                                    </PaginationButton>
                                );
                            })}

                            <PaginationButton
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <FiChevronRight size={16} />
                            </PaginationButton>
                            <PaginationButton
                                onClick={() => paginate(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <FiChevronsRight size={16} />
                            </PaginationButton>
                        </PaginationButtons>
                    </PaginationContainer>
                </>
            )}
        </Container>
    );
};

export default UserReport;