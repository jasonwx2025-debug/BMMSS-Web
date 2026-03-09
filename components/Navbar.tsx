import React, { useState } from 'react';
import { Menu, X, Terminal } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'events', label: 'Events' },
    { id: 'press', label: 'Press' },
    { id: 'ai-lab', label: 'AI Modeling Lab' },
    { id: 'contact', label: 'Join Us' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setIsOpen(false);
  };


 return (
    <nav className="bg-white shadow-md fixed w-full z-50 top-0 border-t-4 border-[#BB0000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">

          <div className="flex items-center">
            <div
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => handleNavClick('home')}
            >
              <Terminal className="h-8 w-8 text-[#BB0000]" />

              <img
                src="logo2.png"
               className="w-[80px] h-[80px] rounded-full border border-gray-100 object-cover shadow-md"
              />

              <div className="flex flex-col justify-center">
                <h1 className="font-black text-xl tracking-tighter leading-none text-gray-900">
                  BMMSS
                </h1>
                <p className="text-[9px] uppercase tracking-widest text-gray-500 font-bold mt-1">
                  The Ohio State University
                </p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`${
                  activeTab === item.id
                    ? 'text-[#BB0000] border-b-2 border-[#BB0000]'
                    : 'text-gray-500 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                } px-1 pt-1 text-sm font-medium transition-colors duration-200 h-full flex items-center`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;