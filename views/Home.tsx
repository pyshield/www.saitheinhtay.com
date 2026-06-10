import React from 'react';
import { 
    Github, Linkedin, Twitter, ArrowRight, 
    Code, Server, Database, PenTool, Smartphone, Cpu,
    Bot, FileText, Globe, Radio
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface HomeProps {
    onNavigate: (tab: string) => void;
}

export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    
    const skills = [
        { icon: Bot, title: "Automation", desc: "Telegram bot, content workflows, publishing commands" },
        { icon: FileText, title: "Content Engine", desc: "PDF to article, Markdown, HTML, audio and video output" },
        { icon: Globe, title: "Local Website", desc: "React, Vite, nginx, and Docker based hosting" },
        { icon: Database, title: "Content Archive", desc: "Generated posts served from outputs/site-content.json" },
        { icon: Server, title: "Deployment", desc: "Docker Compose for local server and VPS setup" },
        { icon: Cpu, title: "AI Tools", desc: "LLM-assisted writing, summaries, and content formatting" },
    ];

    return (
        <div className="flex flex-col w-full animate-fade-in scroll-smooth">
            
            {/* Hero Section */}
            <section className="min-h-[calc(100vh-70px)] flex flex-col items-center justify-center text-center px-4 relative z-10 py-20">
                <div className="space-y-6 max-w-4xl mx-auto mt-[-50px]">
                    <span className="text-indigo-500 font-medium tracking-wide text-lg opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">Sai Thein Htay</span>
                    
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight opacity-0 animate-[fadeIn_0.5s_ease-out_0.2s_forwards]">
                        <span className="bg-clip-text text-transparent bg-gradient-brand">Autocontent Hub</span>
                        <br />
                        <span className="text-gray-900 dark:text-white mt-2 block text-4xl md:text-6xl">Website + Publishing System</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed opacity-0 animate-[fadeIn_0.5s_ease-out_0.4s_forwards]">
                        A local-first publishing workspace that turns PDFs, drafts, images, audio, and videos into
                        website-ready content served directly from your own site.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8 opacity-0 animate-[fadeIn_0.5s_ease-out_0.6s_forwards]">
                        <Button 
                            size="lg" 
                            onClick={() => onNavigate('blog')} 
                            className="min-w-[160px] h-12 text-base shadow-indigo-500/25"
                        >
                            Open Blog
                        </Button>
                        <Button 
                            variant="secondary" 
                            size="lg"
                            className="min-w-[160px] h-12 text-base"
                            onClick={() => onNavigate('projects')}
                        >
                            View Projects
                        </Button>
                    </div>

                    <div className="flex items-center justify-center gap-8 mt-16 opacity-0 animate-[fadeIn_0.5s_ease-out_0.8s_forwards]">
                        <a href="#" className="text-gray-400 hover:text-indigo-500 transition-all transform hover:scale-110 hover:-translate-y-1">
                            <Github className="w-8 h-8" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-indigo-500 transition-all transform hover:scale-110 hover:-translate-y-1">
                            <Linkedin className="w-8 h-8" />
                        </a>
                        <a href="#" className="text-gray-400 hover:text-indigo-500 transition-all transform hover:scale-110 hover:-translate-y-1">
                            <Twitter className="w-8 h-8" />
                        </a>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-24 px-4 bg-white dark:bg-dark-muted/20 border-t border-gray-100 dark:border-dark-border">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <span className="text-indigo-500 font-mono text-xl font-bold">01.</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">How It Works</h2>
                        <div className="h-px bg-gray-200 dark:bg-dark-border flex-1 max-w-xs ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6 text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                            <p>
                                This website is connected to the autocontent system running beside it.
                                Autocontent creates posts and media files, then the site reads the generated
                                manifest and displays the latest output in the Blog section.
                            </p>
                            <p>
                                The local Docker setup runs two services together: the React website on nginx
                                and the Python automation bot. Files written into the outputs folder become
                                available through the website under the content path.
                            </p>
                            <p className="font-medium text-gray-900 dark:text-gray-200">
                                Current workflow:
                            </p>
                            <ul className="grid grid-cols-2 gap-2 text-sm font-mono text-indigo-500 dark:text-indigo-400">
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> PDF to article</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> HTML posts</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Telegram control</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Local website</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> Docker server</li>
                                <li className="flex items-center gap-2"><ArrowRight className="w-3 h-3" /> VPS ready</li>
                            </ul>
                        </div>
                        <div className="relative group mx-auto md:mx-0">
                            <div className="w-72 h-72 md:w-80 md:h-80 relative z-10 rounded-lg overflow-hidden bg-indigo-500/10">
                                <div className="absolute inset-0 flex items-center justify-center text-indigo-200 opacity-20">
                                    <Radio className="w-32 h-32" />
                                </div>
                                <div className="absolute inset-0 bg-indigo-500/20 hover:bg-transparent transition-colors duration-300"></div>
                            </div>
                            <div className="absolute top-5 left-5 w-72 h-72 md:w-80 md:h-80 border-2 border-indigo-500/30 rounded-lg z-0 group-hover:top-3 group-hover:left-3 transition-all duration-300"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Skills Section */}
            <section id="skills" className="py-24 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center gap-4 mb-12">
                        <span className="text-indigo-500 font-mono text-xl font-bold">02.</span>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">System Features</h2>
                        <div className="h-px bg-gray-200 dark:bg-dark-border flex-1 max-w-xs ml-4"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {skills.map((skill, index) => {
                            const Icon = skill.icon;
                            return (
                                <div key={index} className="bg-white dark:bg-dark-card p-6 rounded-xl border border-gray-200 dark:border-dark-border hover:border-indigo-500 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-300 group">
                                    <div className="w-12 h-12 bg-gray-50 dark:bg-dark-muted rounded-lg flex items-center justify-center mb-4 text-indigo-500 group-hover:scale-110 transition-transform">
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{skill.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-400">{skill.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Featured Projects CTA */}
            <section className="py-24 px-4 bg-indigo-900/5 dark:bg-indigo-500/5 border-y border-gray-100 dark:border-dark-border">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                        Local Publishing
                    </h2>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
                        Generated posts are saved into autocontent outputs and served by the website immediately.
                        Use the Blog page to browse the latest site-ready files.
                    </p>
                    <Button size="lg" onClick={() => onNavigate('blog')}>
                        View Blog Output <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                </div>
            </section>

            {/* Contact CTA */}
            <section className="py-24 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <div className="mb-8">
                        <span className="text-indigo-500 font-mono text-lg font-bold block mb-2">04. Next Step</span>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Run The Workflow</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg max-w-xl mx-auto mb-8">
                            Start the Docker stack, publish from Telegram or the local scripts, then refresh the
                            Blog page to see the newest website content.
                        </p>
                        <Button size="lg" className="px-10 h-14 text-lg" onClick={() => onNavigate('blog')}>
                             Open Blog
                        </Button>
                    </div>
                </div>
            </section>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};
