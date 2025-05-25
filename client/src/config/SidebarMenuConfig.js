// src/config/SidebarMenuConfig.js

export const sidebarMenu = {
  admin: [
    { name: 'Dashboard', path: '/dashboard' },
    {
      name: 'Reports',
      path: '/admin/reports',
      submenu: [
        { name: 'Movement Reports', path: '/admin/MovementReports' },
        { name: 'Leader Reports', path: '/admin/LeaderReports' }
      ]
    },
    { name: 'User Profile', path: '/admin/UserProfile' },
    { name: 'Users', path: '/admin/Users' },
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
    { name: 'Upload Report', path: '/team/upload-report' },
    { name: 'Leader Report', path: '/team/LeaderReport' },
    { name: 'Team Reports', path: '/team/TeamReports' },
  ],
  user: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Movement Status', path: '/user/upload-report' },
    { name: 'Movement Report', path: '/user/UserReport' },
  ],
};
