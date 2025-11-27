import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Sparkles, Target, TrendingUp, Users, Brain, Award, ArrowRight, Search, Zap, Rocket, Star } from 'lucide-react';
import { careerAPI } from '../services/api';
import Prism3D from '../components/Prism3D';

const LandingPage = () => {
  const [careerStats, setCareerStats] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCareerStats();
  }, []);

  const fetchCareerStats = async () => {
    try {
      const data = await careerAPI.exploreCareers();
      if (data.statistics) {
        setCareerStats(data.statistics);
      }
    } catch (err) {
      console.error('Error fetching career stats:', err);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/explore?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors duration-300 pb-6">
      {/* Hero Section - Above the Fold */}
      <section className="relative py-12 md:py-20 flex items-center justify-center overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 aurora-bg opacity-50"></div>
        
        {/* Animated gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-prism-violet/30 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-prism-cyan/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-96 h-96 bg-prism-blue/30 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>

        <div className="container-custom relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div className="text-center lg:text-left space-y-8 animate-slide-up">
              <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-prism-violet/10 dark:bg-prism-cyan/10 border border-prism-violet/20 dark:border-prism-cyan/20 mb-4">
                <Sparkles className="h-4 w-4 text-prism-violet dark:text-prism-cyan" />
                <span className="text-sm font-semibold text-prism-violet dark:text-prism-cyan">
                  AI-Powered Career Discovery
                </span>
              </div>

              <h1 className="text-5xl md:text-7xl font-black leading-tight">
                <span className="text-gray-900 dark:text-white">Find Your Future.</span>
                <br />
                <span className="text-gradient-rainbow">Clearly.</span>
              </h1>

              <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                Discover your perfect career path with personalized AI recommendations, 
                skill gap analysis, and expert mentorship tailored for Indian students.
              </p>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl">
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search careers or skills..."
                    className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/90 dark:bg-prism-darker/90 backdrop-blur-xl 
                             border-2 border-gray-200 dark:border-gray-700 
                             text-gray-900 dark:text-white text-lg
                             focus:outline-none focus:ring-4 focus:ring-prism-violet/30 dark:focus:ring-prism-cyan/30
                             focus:border-prism-violet dark:focus:border-prism-cyan
                             shadow-prism-lg transition-all duration-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 btn-primary py-3 px-6"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/signup" className="btn-primary text-lg inline-flex items-center justify-center">
                  Start Your Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link to="/explore" className="btn-secondary text-lg inline-flex items-center justify-center">
                  Explore Careers
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8">
                {[
                  { 
                    label: 'Career Paths', 
                    value: careerStats ? `${careerStats.total_careers}+` : '...',
                    icon: Target,
                  },
                  { 
                    label: 'Categories', 
                    value: careerStats ? `${careerStats.total_categories}` : '...',
                    icon: Sparkles,
                  },
                  { 
                    label: 'Success Rate', 
                    value: '95%',
                    icon: Star,
                  },
                  { 
                    label: 'AI Support', 
                    value: '24/7',
                    icon: Zap,
                  },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <stat.icon className="h-8 w-8 text-prism-violet dark:text-prism-cyan mx-auto mb-2" />
                    <div className="text-3xl font-bold text-gradient">
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: 3D Prism */}
            <div className="hidden lg:flex items-center justify-center animate-float">
              <Prism3D size="xl" />
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-prism-violet dark:border-prism-cyan rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-3 bg-prism-violet dark:bg-prism-cyan rounded-full animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white dark:bg-prism-darker">
        <div className="container-custom">
          <div className="text-center mb-8 animate-slide-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="text-gray-900 dark:text-white">Why Choose </span>
              <span className="text-gradient-rainbow">Prism?</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Comprehensive career guidance powered by cutting-edge AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Assessment',
                description: 'Take our comprehensive career assessment powered by Google Gemini AI to discover careers that match your interests and skills.',
                gradient: 'from-prism-violet to-prism-indigo',
              },
              {
                icon: Target,
                title: 'Skills Gap Analysis',
                description: 'Identify the exact skills you need to develop with personalized learning paths and resource recommendations.',
                gradient: 'from-prism-indigo to-prism-blue',
              },
              {
                icon: Users,
                title: 'AI Mentor 24/7',
                description: 'Get instant career guidance from our AI mentor, trained specifically for Indian students and the job market.',
                gradient: 'from-prism-blue to-prism-cyan',
              },
              {
                icon: TrendingUp,
                title: 'Market Insights',
                description: 'Stay updated with current job market trends, salary expectations, and growth opportunities in India.',
                gradient: 'from-prism-cyan to-prism-teal',
              },
              {
                icon: Award,
                title: 'Exam Guidance',
                description: 'Get recommendations for relevant entrance exams like JEE, NEET, CAT, UPSC based on your career goals.',
                gradient: 'from-prism-teal to-prism-green',
              },
              {
                icon: Rocket,
                title: 'Personalized Roadmap',
                description: 'Receive a customized career roadmap with actionable steps to achieve your professional goals.',
                gradient: 'from-prism-green to-prism-violet',
              },
            ].map((feature, idx) => (
              <Link
                key={idx}
                to="/features"
                className="card-3d group cursor-pointer animate-slide-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-prism`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">{feature.description}</p>
                <div className="flex items-center text-prism-violet dark:text-prism-cyan font-semibold group-hover:translate-x-2 transition-transform">
                  Learn More <ArrowRight className="ml-2 h-4 w-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="section-padding bg-prism-radial dark:bg-prism-dark aurora-bg">
        <div className="container-custom">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-gray-900 dark:text-white">How It </span>
              <span className="text-gradient-rainbow">Works</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Your journey to career clarity in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-24 left-0 right-0 h-1 bg-prism-gradient opacity-20"></div>

            {[
              {
                step: '01',
                title: 'Sign Up & Assess',
                description: 'Create your account and complete our comprehensive AI-powered career assessment.',
                icon: Rocket,
                gradient: 'from-prism-violet to-prism-indigo',
              },
              {
                step: '02',
                title: 'Get Recommendations',
                description: 'Receive personalized career paths, skills analysis, and learning resources.',
                icon: Sparkles,
                gradient: 'from-prism-indigo to-prism-cyan',
              },
              {
                step: '03',
                title: 'Chat with AI Mentor',
                description: 'Get ongoing guidance and answers to all your career questions from our AI mentor.',
                icon: Brain,
                gradient: 'from-prism-cyan to-prism-green',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="relative card-glass text-center animate-scale-in"
                style={{ animationDelay: `${idx * 0.2}s` }}
              >
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-prism-lg`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <div className="text-6xl font-black text-prism-violet/10 dark:text-prism-cyan/10 absolute top-4 right-4">
                  {item.step}
                </div>
                <div className="pt-12 relative z-10">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding relative overflow-hidden">
        <div className="absolute inset-0 bg-prism-gradient opacity-90"></div>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        ></div>
        
        <div className="container-custom relative z-10 text-center animate-slide-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Discover Your Perfect Career?
          </h2>
          <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
            Join thousands of students who have found their path with Prism
          </p>
          <Link to="/signup" className="btn-secondary bg-white text-prism-violet hover:bg-gray-100 text-lg inline-flex items-center">
            Get Started for Free
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-prism-darker dark:bg-black text-white py-16">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-prism-gradient rounded-lg blur-md opacity-50"></div>
                  <Sparkles className="h-8 w-8 text-prism-violet relative z-10" />
                </div>
                <span className="text-2xl font-bold bg-prism-gradient bg-clip-text text-transparent">
                  Prism
                </span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                AI-powered career guidance for Indian students
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/explore" className="hover:text-prism-cyan transition-colors">Explore Careers</Link></li>
                <li><Link to="/assessment" className="hover:text-prism-cyan transition-colors">Assessment</Link></li>
                <li><Link to="/mentor" className="hover:text-prism-cyan transition-colors">AI Mentor</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-prism-cyan transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-prism-cyan transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-prism-cyan transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 text-white">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-prism-cyan transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-prism-cyan transition-colors">LinkedIn</a></li>
                <li><a href="#" className="hover:text-prism-cyan transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Prism. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
