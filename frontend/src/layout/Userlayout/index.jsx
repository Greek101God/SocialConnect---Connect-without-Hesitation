import NavbarComponent from '@/Components/Navbar';
import React from 'react'    // typo shorthand rfce for jsx files to get boiler-plate code

function UserLayout({children}) {
  return (
    <div>
        <NavbarComponent/>
        {children}
        </div>
  )
}

export default UserLayout;  