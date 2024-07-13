import React, { useEffect, useState, createContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/home.jsx';
import SignIn from './pages/signin.jsx';
import Dashboard from './pages/dashboard.jsx';

const UserContext = createContext();

const App = () => {
  const [user, setUser] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function fetchData() {
      console.log("Fetching user data...");
      try {
        const response = await fetch('http://localhost:3000/login', {
          method: "GET",
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include'
        });
        const info = await response.json();
        console.log("Fetched data:", info);

        if (info.loggedIn && info.user) {
          setUser(info.user.username);
          setLoggedIn(true);
        } else {
          setUser('');
          setLoggedIn(false);
          console.log("User not logged in or no user data available.");
        }

      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }

    fetchData();
  }, []);

  const handleLogOut = async () => {
    console.log("Logging out");
    try {
      const response = await fetch('http://localhost:3000/logout', {
        method: "GET",
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      if (response.ok) {
        console.log(response);
        setLoggedIn(false); // Update local state
        setUser(''); // Clear user information
      } else {
        console.error("Logout failed with status:", response.status);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <UserContext.Provider value={{ user, loggedIn }}>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/signin' element={<SignIn handleLogOut={handleLogOut} />} />
          <Route path='/dashboard' element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </UserContext.Provider>
  );
};

export { UserContext };
export default App;
