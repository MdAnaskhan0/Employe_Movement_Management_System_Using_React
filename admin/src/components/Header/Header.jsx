import React from 'react'
import logo from '../../assets/logo.png'
import { Link } from 'react-router-dom'

export default function Header() {
    return (
        <>
            <div className="bg-gray-100 py-2 px-6 shadow-md">
                <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">

                    {/* Logo */}
                    <div className="w-full md:w-1/2 flex justify-center md:justify-start items-center">
                        <img src={logo} alt="Logo" className="w-40 md:w-48 items-center p-4" />
                    </div>

                    {/* Management System */}
                    <div className="w-full md:w-1/2 text-center md:text-right">
                        <h1 className="text-sm md:text-3xl font-bold text-gray-800">
                            Employee Movement Management System
                        </h1>
                    </div>
                </div>
            </div>
        </>
    )
}
