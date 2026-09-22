"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  GridIcon, 
  ProductsIcon, 
  CategoriesIcon, 
  OrdersIcon, 
  SettingsIcon, 
  LogOutIcon, 
  MenuIcon, 
  BellIcon, 
  ExternalLinkIcon 
} from './admin-icons';
import './admin.css';

interface AdminFrameProps {
  children: React.ReactNode;
  signOutAction?: () => Promise<void> | void;
  userProfile?: {
    name: string;
    role: string;
  };
}

export function AdminFrame({ 
  children, 
  signOutAction,
  userProfile = {
    name: 'Elena Rostova',
    role: 'Store Director',

  }
}: AdminFrameProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: GridIcon },
    { label: 'Products', href: '/admin/products', icon: ProductsIcon },
    { label: 'Categories', href: '/admin/categories', icon: CategoriesIcon },
    { label: 'Orders', href: '/admin/orders', icon: OrdersIcon },
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ];

  const handleSignOut = async () => {
    if (signOutAction) {
      await signOutAction();
    } else {
      console.log('Sign-out action triggered');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-stone-200/80 flex-shrink-0 flex flex-col justify-between z-30 sticky top-0 md:h-screen">
        <div>
          {/* Brand Header */}
          <div className="p-6 flex items-center justify-between border-b border-stone-100">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-300 via-rose-200 to-amber-100 flex items-center justify-center text-rose-800 font-bold text-xl shadow-sm border border-rose-200/50">
                ✨
              </div>
              <div>
                <h1 className="font-bold text-stone-900 tracking-tight text-lg">AURA BEAUTY</h1>
                <p className="text-[10px] text-stone-400 font-medium tracking-widest uppercase">Admin Portal</p>
              </div>
            </Link>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-stone-500 hover:bg-stone-100"
            >
              <MenuIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className={`p-4 space-y-1.5 ${mobileMenuOpen ? 'block' : 'hidden md:block'}`}>
            <p className="px-3 text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Management</p>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-sm border border-brand-100'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-stone-500'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile Footer & Sign Out */}
        <div className="p-4 border-t border-stone-100 hidden md:flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-800 truncate">{userProfile.name}</p>
            <p className="text-[11px] text-stone-400 truncate">{userProfile.role}</p>
          </div>
          <button 
            onClick={handleSignOut}
            title="Sign Out"
            className="text-stone-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-stone-100"
          >
            <LogOutIcon className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main View Area */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-stone-50">
        {/* <header className="bg-white/80 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-800 tracking-tight">Admin Operations</h2>
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-full text-stone-500 hover:bg-stone-100 transition-all">
              <BellIcon className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>
            <div className="h-5 w-px bg-stone-200"></div>
            <a 
              href="/" 
              target="_blank" 
              className="flex items-center gap-2 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg border border-brand-200/60 transition-all"
            >
              <span>Live Store</span>
              <ExternalLinkIcon className="w-3.5 h-3.5" />
            </a>
          </div>
        </header> */}

        <div className="p-6 lg:p-8 space-y-8 flex-1">
          {children}
        </div>
      </main>
    </div>
  );
}