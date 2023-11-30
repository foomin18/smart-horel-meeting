import React from 'react';
import './Navbar.css';

const Navbar = ({ account }) => {
    return (
        <div className='navbar bg-black-90 fixed w-100 ph3 pv3 ph4-m ph5-l'>
            <nav className='flex justify-between items-center f6 fw6 ttu tracked'>
                <p className='branding white dib mr3' title='SmartHotel'>SmartHotel</p>
                <p className='address white dib' title='account'>Your Address : {account}</p>
            </nav>
        </div>
    )
}

export default Navbar;
