export const sidebarMenu = {
  admin: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Movement Reports', path: '/admin/MovementReports' },
    { name: 'User Profile', path: '/admin/UserProfile' },
    { name: 'Users', path: '/admin/Users' },
  ],
  manager: [
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
    { name: 'Upload Report', path: '/user/upload-report' },
    { name: 'My Reports', path: '/user/UserReport' },
  ],
};
