import React, { useState } from 'react';
import { LayoutDashboard, Receipt, Wallet, PieChart, Menu, X, Sun, Moon, Bitcoin, Briefcase, FileText, LineChart, Target, Mail } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
    darkMode: boolean;
    toggleDarkMode: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
    children, 
    activeTab, 
    onTabChange, 
    darkMode, 
    toggleDarkMode 
}) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mobileNavOpen, setMobileNavOpen] = useState(false);

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'planning', label: 'Planning', icon: Target },
        { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
        { id: 'transactions', label: 'Transactions', icon: Receipt },
        { id: 'investments', label: 'Investments', icon: LineChart },
        { id: 'crypto', label: 'Crypto', icon: Bitcoin },
        { id: 'reports', label: 'Reports', icon: PieChart },
        { id: 'statements', label: 'Statements', icon: FileText },
    ];

    const isFinanceTab = ['dashboard', 'portfolio', 'transactions', 'investments', 'crypto', 'reports', 'statements', 'planning'].includes(activeTab);

    // Navigation Styles
    const navLinkClass = "relative font-medium text-text-secondary hover:text-gray-900 dark:hover:text-gray-100 transition-colors group text-sm py-1 cursor-pointer bg-transparent border-none";
    const navLinkActive = "relative font-medium text-gray-900 dark:text-gray-100 text-sm py-1 cursor-default bg-transparent border-none";
    
    const underlineClass = "absolute -bottom-[5px] left-0 w-0 h-[2px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] transition-all duration-300 group-hover:w-full";
    const activeUnderlineClass = "absolute -bottom-[5px] left-0 w-full h-[2px] bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]";

    return (
        <div className={`min-h-screen flex flex-col bg-gray-50 dark:bg-dark transition-colors duration-300 font-sans ${darkMode ? 'dark' : ''} overflow-hidden relative`}>
            
            {/* Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none hidden dark:block">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            {/* Global Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-[70px] z-50 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-dark-border transition-colors duration-300">
                <div className="max-w-[1200px] mx-auto px-8 h-full">
                    <div className="flex justify-between items-center h-full">
                        {/* Brand */}
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => onTabChange('home')}>
                            <span className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-brand hover:opacity-90 transition-opacity">
                                Sai Thein Htay
                            </span>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-8">
                            <button 
                                onClick={() => onTabChange('home')}
                                className={activeTab === 'home' ? navLinkActive : navLinkClass}
                            >
                                Home
                                <span className={activeTab === 'home' ? activeUnderlineClass : underlineClass}></span>
                            </button>
                            
                            <button 
                                onClick={() => onTabChange('blog')}
                                className={activeTab === 'blog' ? navLinkActive : navLinkClass}
                            >
                                Blog
                                <span className={activeTab === 'blog' ? activeUnderlineClass : underlineClass}></span>
                            </button>
                            
                            <button 
                                onClick={() => onTabChange('dashboard')}
                                className={isFinanceTab ? navLinkActive : navLinkClass}
                            >
                                Finance
                                <span className={isFinanceTab ? activeUnderlineClass : underlineClass}></span>
                            </button>
                            
                             <button 
                                onClick={() => onTabChange('projects')}
                                className={activeTab === 'projects' ? navLinkActive : navLinkClass}
                            >
                                Projects
                                <span className={activeTab === 'projects' ? activeUnderlineClass : underlineClass}></span>
                            </button>

                            <button 
                                onClick={() => onTabChange('contact')}
                                className={activeTab === 'contact' ? navLinkActive : navLinkClass}
                            >
                                Contact
                                <span className={activeTab === 'contact' ? activeUnderlineClass : underlineClass}></span>
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-4">
                            <button 
                                onClick={toggleDarkMode}
                                className="w-10 h-10 rounded-full border border-gray-200 dark:border-dark-border bg-gray-100 dark:bg-dark-muted flex items-center justify-center text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-dark-card transition-all duration-300 hover:rotate-12"
                                aria-label="Toggle theme"
                            >
                                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                            </button>
                             <button onClick={() => setMobileNavOpen(!mobileNavOpen)} className="md:hidden p-2 text-gray-600 dark:text-gray-300">
                                {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileNavOpen && (
                    <div className="md:hidden absolute top-[70px] left-0 w-full bg-white dark:bg-dark border-b border-gray-200 dark:border-dark-border shadow-lg">
                        <div className="px-4 py-6 space-y-4 flex flex-col items-center">
                            <button onClick={() => { onTabChange('home'); setMobileNavOpen(false); }} className="text-text-secondary hover:text-primary font-medium">Home</button>
                            <button onClick={() => { onTabChange('blog'); setMobileNavOpen(false); }} className="text-text-secondary hover:text-primary font-medium">Blog</button>
                            <button onClick={() => { onTabChange('dashboard'); setMobileNavOpen(false); }} className="text-text-secondary hover:text-primary font-medium">Finance</button>
                            <button onClick={() => { onTabChange('projects'); setMobileNavOpen(false); }} className="text-text-secondary hover:text-primary font-medium">Projects</button>
                            <button onClick={() => { onTabChange('contact'); setMobileNavOpen(false); }} className="text-text-secondary hover:text-primary font-medium">Contact</button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Main App Container */}
            <div className="flex flex-1 pt-[70px] h-screen overflow-hidden relative z-10">
                
                {/* Finance Sidebar - Only visible in Finance Views */}
                {isFinanceTab && (
                    <>
                        <aside className={`
                            fixed inset-y-0 left-0 top-[70px] z-40 w-64 bg-white/90 dark:bg-dark-card/60 backdrop-blur-lg border-r border-gray-200 dark:border-dark-border transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full flex flex-col
                            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        `}>
                             <div className="p-6 border-b border-gray-200 dark:border-dark-border">
                                <div className="flex items-center gap-2 text-primary font-bold text-xl">
                                    <Wallet className="w-7 h-7" />
                                    <span>FinManager</span>
                                </div>
                            </div>
                            
                            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                                 {navItems.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                onTabChange(item.id);
                                                setSidebarOpen(false);
                                            }}
                                            className={`
                                                w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200
                                                ${activeTab === item.id 
                                                    ? 'bg-primary/10 text-primary translate-x-1 shadow-sm' 
                                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-muted hover:text-gray-900 dark:hover:text-gray-200'}
                                            `}
                                        >
                                            <Icon className="w-5 h-5" />
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </nav>

                            <div className="p-4 border-t border-gray-200 dark:border-dark-border">
                                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 dark:bg-dark-muted/50 rounded-lg">
                                    <div className="w-8 h-8 rounded-full bg-gradient-brand text-white flex items-center justify-center font-bold text-xs shadow-md">
                                        ST
                                    </div>
                                    <div className="text-xs">
                                        <p className="font-medium text-gray-900 dark:text-white">Sai Thein Htay</p>
                                        <p className="text-gray-500">Pro Member</p>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Mobile Sidebar Overlay */}
                        {sidebarOpen && (
                            <div 
                                className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
                                onClick={() => setSidebarOpen(false)}
                            />
                        )}
                    </>
                )}

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col overflow-hidden bg-transparent">
                     {/* Mobile Header for sidebar toggle (only in Finance tabs) */}
                    {isFinanceTab && (
                        <header className="lg:hidden bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border px-6 py-4 flex items-center justify-between sticky top-0 z-20">
                             <div className="flex items-center gap-4">
                                <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300 p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-muted">
                                    <LayoutDashboard className="w-6 h-6" />
                                </button>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white capitalize">
                                    {activeTab}
                                </h1>
                            </div>
                        </header>
                    )}

                    {/* Scrollable Content Area */}
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <div className="max-w-[1200px] mx-auto h-full">
                            {children}
                        </div>
                         {/* Footer matching portfolio - only show here if in finance tabs, Home has its own flow or can share */}
                         {isFinanceTab && (
                            <footer className="mt-12 py-8 border-t border-gray-200 dark:border-dark-border text-center text-sm text-text-secondary">
                                <p>&copy; 2026 Sai Thein Htay. Built with passion and modern web technologies.</p>
                            </footer>
                         )}
                    </div>
                </main>
            </div>
        </div>
    );
};