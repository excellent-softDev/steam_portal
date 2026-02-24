// Quick login bypass for testing
localStorage.setItem('steam_lms_admin_token', 'test-token');
localStorage.setItem('steam_lms_admin', JSON.stringify({
    email: 'admin@steamlms.com',
    name: 'Administrator',
    role: 'admin',
    isLoggedIn: true
}));

console.log('Login bypass activated - you should now be able to access the admin dashboard');
