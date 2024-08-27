import React, { Component } from 'react';

export default class Logout extends Component {
  handleLogout = async () => {
    try {
        await localStorage.clear();

      const response = await fetch('http://localhost:3001/user/logout', {
        method: 'GET',
        credentials: 'include', // Include cookies in the request
      });

      const data = await response.json();
      await localStorage.clear();


      if (response.ok) {
        console.log('Logout successful:', data.message);
        // Redirect to the login page or home page after logout
        window.location.href = "/";
    } else {
        console.error('Logout failed:', data.message);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  componentDidMount() {
    this.handleLogout();
  }

  render() {
    return (
      <div>
        Logging out...
      </div>
    );
  }
}
