import { useState } from 'react'
import { GrLogout } from 'react-icons/gr'
import { FcSettings } from 'react-icons/fc'
import { AiOutlineBars } from 'react-icons/ai'
import { BsGraphUp } from 'react-icons/bs'
import useAuth from '../../../hooks/useAuth'
import { Link } from 'react-router-dom'
import useRole from '../../../hooks/useRole'
import MenuItem from './Manu/MenuItem'
import HostMenu from './Manu/HostMenu'
import GuestMenu from './Manu/GuestMenu'
import AdminMenu from './Manu/AdminMenu'
import ToggleBtn from '../../Shared/Button/ToggleBtn'


const Sidebar = () => {
  const { logOut } = useAuth()
  const [isActive, setActive] = useState(false)
  const [toggle, setToggle] = useState(true)

  const [role, isLoading] = useRole()
  console.log(role, isLoading)

  // Sidebar Responsive Handler
  const handleToggle = () => {
    setActive(!isActive)
  }

  // Toggle Handler
  const toggleHandler = event => {
        setToggle(event.target.checked)
  }
  return (
    <>
      {/* Small Screen Navbar */}
      <div className='bg-gray-100 text-gray-800 flex justify-between md:hidden'>
        <div>
          <div className='block cursor-pointer p-4 font-bold'>
            <Link to='/'>
            {/* <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text inline-block'>LuxuriousLodge</h1> */}
              <img
                // className='hidden md:block'
                src='https://i.ibb.co/4ZXzmq5/logo.png'
                alt='logo'
                width='100'
                height='100'
              />
            </Link>
          </div>
        </div>

        <button
          onClick={handleToggle}
          className='mobile-menu-button p-4 focus:outline-none focus:bg-gray-200'
        >
          <AiOutlineBars className='h-5 w-5' />
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`z-10 md:fixed flex flex-col justify-between overflow-x-hidden bg-gray-100 w-64 space-y-6 px-2 py-4 absolute inset-y-0 left-0 transform ${
          isActive && '-translate-x-full'
        }  md:translate-x-0  transition duration-200 ease-in-out`}
      >
        <div>
          <div>
            <div className='w-full hidden md:flex px-4 py-2 shadow-lg rounded-lg justify-center items-center bg-skyblue-400 mx-auto'>
              <Link to='/'>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text inline-block'>LuxuriousLodge</h1>
              </Link>
            </div>
          </div>

          {/* Nav Items */}
          <div className='flex flex-col justify-between flex-1 mt-6'>
            {/* Conditional toggle button here.. */}           
              {role === 'host' && <ToggleBtn 
              toggleHandler={toggleHandler}
              toggle={toggle}
               /> }
            {/*  Menu Items */}
            <nav>
              {/* Statistics */}
              <MenuItem
               label='Statistics'
                address= '/dashboard'
                icon= {BsGraphUp}
               />
              
              {/* Add Room */}
              {role === 'guest' && <GuestMenu/>}
              {role === 'host' ? toggle? <HostMenu/> : <GuestMenu/> : undefined}             
              {role === 'admin' && <AdminMenu/>}
              {/* My Listing */}            
            </nav>
          </div>
        </div>
        <div>
          <hr />
          {/* Profile Menu */}
          <MenuItem
               label='Profile'
                address= '/dashboard/profile'
                icon= {FcSettings}
               />
          
          <button
            onClick={logOut}
            className='flex w-full items-center px-4 py-2 mt-5 text-gray-600 hover:bg-gray-300   hover:text-gray-700 transition-colors duration-300 transform'
          >
            <GrLogout className='w-5 h-5' />

            <span className='mx-4 font-medium'>Logout</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default Sidebar