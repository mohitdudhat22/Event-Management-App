import React from 'react';
import PropTypes from 'prop-types';

function Navbar({ user, setIsEditing }) {
  return (
    <nav className="bg-blue-500 p-4 rounded-lg mb-8 flex justify-between items-center">
      <div className="text-white text-lg font-bold">Event Management</div>
      <div className="flex space-x-4">
        {user.role === "admin" && (
          <button
            onClick={() => setIsEditing(false)}
            className="bg-white text-blue-500 px-3 py-1 rounded-full transition duration-300 ease-in-out"
          >
            Create Event
          </button>
        )}
        <button
          className="bg-white text-blue-500 px-3 py-1 rounded-full transition duration-300 ease-in-out"
        >
          View Events
        </button>
        <button
          className="bg-white text-blue-500 px-3 py-1 rounded-full transition duration-300 ease-in-out"
        >
          Booked Events
        </button>
        <div className="text-white">{user.name}</div>
      </div>
    </nav>
  );
}

Navbar.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string
  }),
  setIsEditing: PropTypes.func
};

Navbar.defaultProps = {
  user: { name: 'Guest', role: 'guest' },
  setIsEditing: () => {}
};

export default Navbar;