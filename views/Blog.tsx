import React from 'react';
import { Button } from '../components/ui/Button';
import { Calendar, Clock, ArrowRight, Bookmark } from 'lucide-react';

export const Blog: React.FC = () => {
    const posts = [
        {
            id: 1,
            title: "The Future of Decentralized Finance",
            excerpt: "Exploring how DeFi is reshaping the global financial landscape and what it means for traditional banking systems.",
            date: "Oct 15, 2025",
            readTime: "5 min read",
            category: "Crypto",
            image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 2,
            title: "Mastering React Performance",
            excerpt: "Deep dive into optimization techniques, from memoization to virtualization, for building lightning-fast web apps.",
            date: "Sep 28, 2025",
            readTime: "8 min read",
            category: "Development",
            image: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 3,
            title: "Personal Finance 101: The 50/30/20 Rule",
            excerpt: "A simple yet effective budgeting framework to manage your income, savings, and spending habits efficiently.",
            date: "Sep 10, 2025",
            readTime: "4 min read",
            category: "Finance",
            image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 4,
            title: "Building Scalable APIs with Node.js",
            excerpt: "Best practices for structuring your backend, handling errors, and ensuring security in modern Node.js applications.",
            date: "Aug 22, 2025",
            readTime: "6 min read",
            category: "Backend",
            image: "https://images.unsplash.com/photo-1627398242454-45a1465c2479?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 5,
            title: "Understanding Crypto Market Cycles",
            excerpt: "How to identify bull and bear markets, and strategies for investing during volatile periods.",
            date: "Aug 05, 2025",
            readTime: "7 min read",
            category: "Investing",
            image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?auto=format&fit=crop&q=80&w=800"
        },
        {
            id: 6,
            title: "The Art of Minimalist UI Design",
            excerpt: "Why less is often more when it comes to user interface design, and how to achieve clarity in your projects.",
            date: "Jul 18, 2025",
            readTime: "4 min read",
            category: "Design",
            image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&q=80&w=800"
        }
    ];

    return (
        <div className="space-y-12 pb-12 animate-[fadeIn_0.5s_ease-out_forwards]">
            {/* Hero Section */}
            <div className="text-center max-w-2xl mx-auto space-y-4 pt-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Thoughts & <span className="text-indigo-500">Insights</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">
                    Writing about technology, finance, and the intersection of both.
                </p>
            </div>

            {/* Featured Tags (Optional) */}
            <div className="flex flex-wrap justify-center gap-2">
                {['All', 'Development', 'Crypto', 'Finance', 'Design'].map((tag, i) => (
                    <button 
                        key={tag}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            i === 0 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' 
                            : 'bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border text-gray-600 dark:text-gray-300 hover:border-indigo-500 hover:text-indigo-500'
                        }`}
                    >
                        {tag}
                    </button>
                ))}
            </div>

            {/* Post Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {posts.map((post, index) => (
                    <div 
                        key={post.id} 
                        className="group bg-white dark:bg-dark-card rounded-2xl overflow-hidden border border-gray-200 dark:border-dark-border hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 flex flex-col h-full opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
                        style={{ animationDelay: `${index * 100}ms` }}
                    >
                        <div className="relative h-52 overflow-hidden">
                            <img 
                                src={post.image} 
                                alt={post.title} 
                                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 border border-gray-200 dark:border-dark-border shadow-sm">
                                {post.category}
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {post.date}</span>
                                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {post.readTime}</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-500 transition-colors line-clamp-2">
                                {post.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-6 flex-1 line-clamp-3">
                                {post.excerpt}
                            </p>
                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                                <a href="#" className="inline-flex items-center text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 transition-colors gap-1 group/link">
                                    Read Article <ArrowRight className="w-4 h-4 transform group-hover/link:translate-x-1 transition-transform" />
                                </a>
                                <button className="text-gray-400 hover:text-indigo-500 transition-colors">
                                    <Bookmark className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Newsletter / Archive CTA */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-card dark:to-dark-muted/30 rounded-2xl p-8 md:p-12 text-center border border-dashed border-gray-300 dark:border-dark-border">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Want to read more?</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-lg mx-auto">
                    Check out my archive for older posts, tutorials, and deep dives into software architecture.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <Button variant="secondary" className="px-8">View Archive</Button>
                    <Button variant="primary" className="px-8">Subscribe to Newsletter</Button>
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