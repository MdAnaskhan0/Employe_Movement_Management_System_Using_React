// src/config/SidebarMenuConfig.js

export const sidebarMenu = {
  admin: [
    { name: 'Dashboard', path: '/dashboard' },
    {
      name : 'Users',
      path : '/admin/users',
      submenu : [
        { name : 'Create User', path : '/admin/create-user'},
        { name : 'All Users', path : '/admin/users'},
      ]
    },
    {
      name : 'Teams',
      path : '/admin/teams',
      submenu : [
        { name : 'Create Team', path : '/admin/create-team'},
        { name : 'All Teams', path : '/admin/teams'},
      ]
    },
    {
      name: 'Reports',
      path: '/admin/reports',
      submenu: [
        { name: 'Movement Reports', path: '/admin/MovementReports' },
        { name: 'Leader Reports', path: '/admin/LeaderReports' }
      ]
    },
    {
      name : 'Settings',
      path : '/admin/settings',
      submenu : [
        { name : 'Departments', path : '/admin/departments'},
        { name : 'Branch Names', path : '/admin/branchnames'},
        { name : 'Designations', path : '/admin/designations'},
        { name : 'Visiting Status', path : '/admin/visitingstatus'},
      ]
    }
  ],
  manager: [
    { name: 'Dashboard', path: '/dashboard' },
    {
      name: 'Reports',
      path: '/manager/reports',
      submenu: [
        { name: 'All Movement Reports', path: '/movement-reports' },
        { name: 'Archived Reports', path: '/movement-reports/archived' }
      ]
    }
  ],
  accounce: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'All Movement Reports', path: '/movement-reports' },
  ],
  teamleader: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Movement Status', path: '/user/upload-report' },
    { name: 'Movement Report', path: '/user/UserReport' },
    { name: 'Team Reports', path: '/team/TeamReports' },
  ],
  user: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Movement Status', path: '/user/upload-report' },
    { name: 'Movement Report', path: '/user/UserReport' },
  ],
};
