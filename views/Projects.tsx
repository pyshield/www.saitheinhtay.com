import React, { useState } from 'react';
import { ExternalLink, Github, FolderGit2, Code2, Star, Layout } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const Projects: React.FC = () => {
    const [filter, setFilter] = useState('All');

    const categories = ['All', 'Web App', 'Crypto', 'Mobile', 'UI/UX'];

    const projects = [
        {
            id: 1,
            title: "FinManager Pro",
            description: "A comprehensive personal finance dashboard featuring crypto portfolio tracking, income/expense management, and real-time data visualization.",
            category: "Web App",
            image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
            tags: ["React", "TypeScript", "Tailwind", "Recharts"],
            demoLink: "#",
            repoLink: "#",
            featured: true
        },
        {
            id: 2,
            title: "DeFi Swap Protocol",
            description: "Decentralized exchange interface allowing users to swap ERC-20 tokens with low slippage and automated market making logic.",
            category: "Crypto",
            image: "https://images.unsplash.com/photo-1620325867502-221cfb5faa5f?auto=format&fit=crop&q=80&w=800",
            tags: ["Solidity", "Web3.js", "Ethereum", "React"],
            demoLink: "#",
            repoLink: "#",
            featured: false
        },
        {
            id: 3,
            title: "TaskMaster AI",
            description: "Smart task management application that uses natural language processing to categorize and prioritize daily to-do lists automatically.",
            category: "Mobile",
            image: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&q=80&w=800",
            tags: ["React Native", "OpenAI API", "Node.js"],
            demoLink: "#",
            repoLink: "#",
            featured: false
        },
        {
            id: 4,
            title: "NeoBank UI Kit",
            description: "A modern, dark-mode focused UI component library designed for fintech applications, ensuring accessibility and responsiveness.",
            category: "UI/UX",
            image: "https://images.unsplash.com/photo-1616077168712-fc6c738ae826?auto=format&fit=crop&q=80&w=800",
            tags: ["Figma", "CSS Modules", "Storybook"],
            demoLink: "#",
            repoLink: "#",
            featured: false
        },
        {
            id: 5,
            title: "CryptoTax Calc",
            description: "Automated tool for calculating capital gains and losses for cryptocurrency transactions across multiple blockchains.",
            category: "Crypto",
            image: "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=800",
            tags: ["Python", "Django", "PostgreSQL", "React"],
            demoLink: "#",
            repoLink: "#",
            featured: false
        },
        {
            id: 6,
            title: "E-Commerce Analytics",
            description: "Real-time dashboard for shop owners to track sales, visitor demographics, and inventory levels with predictive alerts.",
            category: "Web App",
            image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=800",
            tags: ["Vue.js", "Firebase", "D3.js"],
            demoLink: "#",
            repoLink: "#",
            featured: false
        }
    ];

    const filteredProjects = filter === 'All' 
        ? projects 
        : projects.filter(p => p.category === filter);

    return (
        <div className="space-y-12 pb-12 animate-[fadeIn_0.5s_ease-out_forwards]">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-4 pt-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Featured <span className="text-indigo-500">Projects</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    A selection of my recent work in web development, blockchain, and UI design.
                </p>
            </div>

            {/* Filter */}
            <div className="flex flex-wrap justify-center gap-2">
                {categories.map((cat, i) => (
                    <button 
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
                            filter === cat 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                            : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProjects.map((project, index) => (
                    <div 
                        key={project.id} 
                        className="group bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        {/* Image Container */}
                        <div className="relative h-48 overflow-hidden">
                            <img 
                                src={project.image} 
                                alt={project.title} 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-[2px]">
                                <a 
                                    href={project.demoLink}
                                    className="p-2 bg-white rounded-full text-gray-900 hover:scale-110 transition-transform"
                                    title="View Demo"
                                >
                                    <ExternalLink className="w-5 h-5" />
                                </a>
                                <a 
                                    href={project.repoLink}
                                    className="p-2 bg-gray-900 rounded-full text-white hover:scale-110 transition-transform"
                                    title="View Code"
                                >
                                    <Github className="w-5 h-5" />
                                </a>
                            </div>
                            {project.featured && (
                                <div className="absolute top-4 right-4 bg-amber-500/90 text-white text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-current" /> FEATURED
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <span className="text-xs font-semibold text-indigo-500 mb-1 block uppercase tracking-wide">
                                        {project.category}
                                    </span>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-indigo-500 transition-colors">
                                        {project.title}
                                    </h3>
                                </div>
                                <div className="bg-gray-100 dark:bg-dark-muted p-2 rounded-lg text-gray-500 dark:text-gray-400">
                                    <FolderGit2 className="w-5 h-5" />
                                </div>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1">
                                {project.description}
                            </p>

                            {/* Tech Stack */}
                            <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100 dark:border-dark-border">
                                {project.tags.map(tag => (
                                    <span 
                                        key={tag} 
                                        className="text-xs font-medium px-2 py-1 rounded bg-gray-50 dark:bg-dark-muted text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-dark-border flex items-center gap-1"
                                    >
                                        <Code2 className="w-3 h-3 text-indigo-500" />
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* GitHub Call to Action */}
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-dark-card dark:to-[#1a1a1a] rounded-2xl p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                     <Layout className="w-full h-full" />
                </div>
                <div className="relative z-10">
                    <Github className="w-12 h-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-3">Check out my GitHub</h3>
                    <p className="text-gray-300 mb-8 max-w-lg mx-auto">
                        I contribute to open source projects and constantly experiment with new technologies. Explore my repositories to see more code.
                    </p>
                    <Button onClick={() => window.open('https://github.com', '_blank')} className="px-8 bg-white text-gray-900 hover:bg-gray-100 hover:text-indigo-600 border-none">
                        Visit Profile
                    </Button>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};