import React from 'react';
import PropTypes from 'prop-types';
import DashboardLayoutNavigationLinks from './Dashboard';

function Layout({ user = { name: 'Guest', role: 'guest' }, setIsEditing = () => {}, children }) {
  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <DashboardLayoutNavigationLinks />
      <main>{children}</main>
    </div>
  );
}

Layout.propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string,
    role: PropTypes.string
  }),
  setIsEditing: PropTypes.func,
  children: PropTypes.node.isRequired
};

export default Layout;