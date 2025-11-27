import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  Users, 
  TrendingUp, 
  Award, 
  Sparkles,
  CheckCircle,
  ArrowRight,
  Play,
  BookOpen,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { careerAPI } from '../services/api';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Features = () => {
  const [careerStats, setCareerStats] = useState(null);
  const heroRef = useScrollAnimation();

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

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Assessment',
      description: 'Take our comprehensive career assessment powered by Google Gemini AI to discover careers that match your interests and skills.',
      benefits: [
        '10 comprehensive questions',
        'Powered by Gemini 2.5 Flash AI',
        'Personalized career matches',
        'Instant results'
      ],
      cta: 'Take Assessment',
      link: '/assessment',
      gradient: 'from-prism-violet to-prism-indigo',
      demo: 'Get AI-analyzed career recommendations based on your unique profile'
    },
    {
      icon: Target,
      title: 'Skills Gap Analysis',
      description: 'Identify the exact skills you need to develop with personalized learning paths and resource recommendations.',
      benefits: [
        'Current vs Required skill levels',
        'Priority-based recommendations',
        'Learning path guidance',
        'Resource suggestions'
      ],
      cta: 'View Demo',
      link: '/assessment',
      gradient: 'from-prism-indigo to-prism-blue',
      demo: 'Discover which skills you need to develop for your dream career'
    },
    {
      icon: Users,
      title: 'AI Mentor 24/7',
      description: 'Get instant career guidance from our AI mentor, trained specifically for Indian students and the job market.',
      benefits: [
        'Available 24/7',
        'Context-aware responses',
        'Indian education system expert',
        'Entrance exam guidance'
      ],
      cta: 'Chat Now',
      link: '/mentor',
      gradient: 'from-prism-blue to-prism-cyan',
      demo: 'Ask anything about careers, exams, or skill development'
    },
    {
      icon: TrendingUp,
      title: 'Market Insights',
      description: 'Stay updated with current job market trends, salary expectations, and growth opportunities in India.',
      benefits: [
        'Current salary ranges',
        'Growth prospects',
        'Industry trends',
        'Job market analysis'
      ],
      cta: 'Explore Careers',
      link: '/explore',
      gradient: 'from-prism-cyan to-prism-teal',
      demo: 'Access real-time data on 500+ career paths in India'
    },
    {
      icon: Award,
      title: 'Exam Guidance',
      description: 'Get recommendations for relevant entrance exams like JEE, NEET, CAT, UPSC based on your career goals.',
      benefits: [
        'JEE, NEET, CAT, UPSC guidance',
        'Exam-specific preparation tips',
        'Timeline recommendations',
        'Success strategies'
      ],
      cta: 'Get Guidance',
      link: '/mentor',
      gradient: 'from-prism-teal to-prism-green',
      demo: 'Learn which exams you need for your target career'
    },
    {
      icon: Sparkles,
      title: 'Personalized Roadmap',
      description: 'Receive a customized career roadmap with actionable steps to achieve your professional goals.',
      benefits: [
        'Step-by-step action plan',
        'Timeline estimates',
        'Milestone tracking',
        'Resource recommendations'
      ],
      cta: 'Create Roadmap',
      link: '/assessment',
      gradient: 'from-prism-green to-prism-yellow',
      demo: 'Get a clear path from where you are to where you want to be'
    }
  ];

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors">
      {/* Header */}
      <section className="relative py-12 md:py-16 overflow-hidden">
        <div className="absolute inset-0 aurora-bg opacity-50"></div>
        <div className="container-custom relative z-10 text-center" ref={heroRef.ref}>
          <div className={`${heroRef.isVisible ? 'animate-slide-up' : ''}`}>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gray-900 dark:text-white">All Features at Your </span>
              <span className="text-gradient-rainbow">Fingertips</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
              Everything you need to make informed career decisions, all powered by cutting-edge AI technology
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/signup" className="btn-primary inline-flex items-center">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link to="/mentor" className="btn-secondary inline-flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Chat with AI Mentor
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-8 md:py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-6">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="card-3d overflow-hidden animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                {/* Feature Header */}
                <div className={`bg-gradient-to-r ${feature.gradient} p-6 md:p-8 text-white`}>
                  <feature.icon className="h-12 w-12 md:h-16 md:w-16 mb-4 opacity-90" />
                  <h3 className="text-2xl md:text-3xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-base md:text-lg opacity-90 leading-relaxed">{feature.description}</p>
                </div>

                {/* Feature Body */}
                <div className="p-6 md:p-8">
                  {/* Demo Box */}
                  <div className="card-glass bg-prism-violet/5 dark:bg-prism-cyan/5 p-4 mb-6 border-l-4 border-prism-violet dark:border-prism-cyan">
                    <div className="flex items-start space-x-3">
                      <Play className="h-5 w-5 text-prism-violet dark:text-prism-cyan mt-1 flex-shrink-0" />
                      <p className="text-gray-700 dark:text-gray-300 font-medium text-sm md:text-base">{feature.demo}</p>
                    </div>
                  </div>

                  {/* Benefits */}
                  <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 text-prism-green mr-2" />
                    Key Benefits:
                  </h4>
                  <ul className="space-y-3 mb-6">
                    {feature.benefits.map((benefit, benefitIdx) => (
                      <li key={benefitIdx} className="flex items-start">
                        <CheckCircle className="h-5 w-5 text-prism-green mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 dark:text-gray-300 text-sm md:text-base">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <Link
                    to={feature.link}
                    className={`w-full bg-gradient-to-r ${feature.gradient} text-white font-semibold py-3 px-6 rounded-xl hover:opacity-90 transition-all flex items-center justify-center group shadow-prism`}
                  >
                    {feature.cta}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How They Work Together */}
      <section className="py-8 md:py-12 bg-prism-violet/5 dark:bg-prism-cyan/5">
        <div className="container-custom">
          <div className="text-center mb-8 animate-scale-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How They Work Together
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              A complete ecosystem for your career success
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: 1,
                icon: Brain,
                title: 'Assess',
                description: 'Start with our AI assessment to understand your strengths, interests, and goals'
              },
              {
                step: 2,
                icon: Target,
                title: 'Analyze',
                description: 'Get detailed insights on career matches, skills gaps, and learning paths'
              },
              {
                step: 3,
                icon: MessageSquare,
                title: 'Act',
                description: 'Use AI Mentor for ongoing guidance as you pursue your career goals'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="card-3d text-center animate-scale-in"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-prism-gradient rounded-full mb-4 shadow-prism">
                  <span className="text-2xl font-bold text-white">{item.step}</span>
                </div>
                <item.icon className="h-12 w-12 text-prism-violet dark:text-prism-cyan mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8 md:py-12">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { 
                value: careerStats ? `${careerStats.total_careers}` : '...', 
                label: 'Career Paths', 
                icon: TrendingUp 
              },
              { 
                value: careerStats ? `${careerStats.total_categories}` : '...', 
                label: 'Categories', 
                icon: Users 
              },
              { 
                value: '95%', 
                label: 'Success Rate', 
                icon: CheckCircle 
              },
              { 
                value: '24/7', 
                label: 'AI Support', 
                icon: MessageSquare 
              }
            ].map((stat, idx) => (
              <div key={idx} className="card-3d p-6 animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <stat.icon className="h-10 w-10 text-prism-violet dark:text-prism-cyan mx-auto mb-3" />
                <div className="text-3xl font-black text-gradient mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-8 md:py-12 bg-prism-gradient relative overflow-hidden">
        <div className="container-custom relative z-10 text-center">
          <BookOpen className="h-12 w-12 md:h-16 md:w-16 text-white mx-auto mb-6 opacity-90" />
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Experience All Features?
          </h2>
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Create your free account and start your personalized career journey today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link
              to="/signup"
              className="btn-secondary bg-white text-prism-violet hover:bg-gray-100 text-lg inline-flex items-center justify-center"
            >
              Start Free Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/mentor"
              className="btn-secondary border-2 border-white bg-transparent text-white hover:bg-white/20 text-lg inline-flex items-center justify-center"
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat with AI Mentor
            </Link>
          </div>
          
          {/* Warning Info */}
          <div className="card-glass bg-yellow-500/20 dark:bg-yellow-600/20 border border-yellow-400/30 dark:border-yellow-500/30 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-300 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm font-semibold text-yellow-100 dark:text-yellow-200 mb-1">
                  Career Not Found?
                </p>
                <p className="text-xs text-yellow-200 dark:text-yellow-300">
                  If a career you're looking for is not in our database, request it and we'll add it! 
                  Email us at <a href="mailto:moulik.023@gmail.com" className="underline font-semibold">moulik.023@gmail.com</a> or use the request feature after assessment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Features;
