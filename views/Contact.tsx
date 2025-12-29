import React from 'react';
import { Button } from '../components/ui/Button';
import { Send, Mail, User, MessageSquare, MapPin, Phone, Linkedin, Github, Twitter } from 'lucide-react';

export const Contact: React.FC = () => {
    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        alert("Thank you for your message! This is a demo application.");
    };

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-fade-in pb-12 pt-4">
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                    Get in <span className="text-indigo-500">Touch</span>
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                    Have a project in mind, a question, or just want to say hi? I'd love to hear from you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Contact Info Cards */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm hover:border-indigo-500/50 transition-colors">
                        <div className="w-12 h-12 bg-indigo-50 dark:bg-dark-muted rounded-lg flex items-center justify-center text-indigo-500 mb-4">
                            <Mail className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Email</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            The best way to reach me. I usually respond within 24 hours.
                        </p>
                        <a href="mailto:hello@saitheinthay.com" className="text-indigo-600 dark:text-indigo-400 font-medium text-sm hover:underline">
                            hello@saitheinthay.com
                        </a>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm hover:border-emerald-500/50 transition-colors">
                        <div className="w-12 h-12 bg-emerald-50 dark:bg-dark-muted rounded-lg flex items-center justify-center text-emerald-500 mb-4">
                            <MapPin className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Location</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">
                            Based in Yangon, Myanmar.<br/>Available for remote work worldwide.
                        </p>
                    </div>

                    <div className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border shadow-sm hover:border-purple-500/50 transition-colors">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-dark-muted rounded-lg flex items-center justify-center text-purple-500 mb-4">
                            <Phone className="w-6 h-6" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Social Profiles</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
                            Connect with me on social media.
                        </p>
                        <div className="flex gap-4">
                             <a href="#" className="p-2 bg-gray-50 dark:bg-dark-muted rounded-lg text-gray-500 hover:text-indigo-500 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 dark:bg-dark-muted rounded-lg text-gray-500 hover:text-indigo-500 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="p-2 bg-gray-50 dark:bg-dark-muted rounded-lg text-gray-500 hover:text-indigo-500 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* Contact Form */}
                <div className="lg:col-span-2">
                     <form onSubmit={handleContactSubmit} className="space-y-6 bg-white dark:bg-dark-card p-8 rounded-2xl border border-gray-200 dark:border-dark-border shadow-lg">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="text" 
                                        id="name" 
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input 
                                        type="email" 
                                        id="email" 
                                        required
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>
                        </div>
                         <div className="space-y-2">
                                <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                                <input 
                                    type="text" 
                                    id="subject" 
                                    required
                                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="Project Inquiry"
                                />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="message" className="text-sm font-medium text-gray-700 dark:text-gray-300">Message</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                <textarea 
                                    id="message" 
                                    rows={6} 
                                    required
                                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark-muted border border-gray-200 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all resize-none text-gray-900 dark:text-white placeholder:text-gray-400"
                                    placeholder="Hello, I'd like to talk about..."
                                ></textarea>
                            </div>
                        </div>
                        <Button type="submit" size="lg" className="w-full flex items-center justify-center gap-2">
                            <Send className="w-4 h-4" /> Send Message
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};