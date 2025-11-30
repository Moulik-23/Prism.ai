import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import {
  Target,
  MessageSquare,
  TrendingUp,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader,
  Star,
  ExternalLink,
  GraduationCap,
  Brain,
  Rocket,
  Sparkles
} from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [savedCareers, setSavedCareers] = useState([]);
  const [loading, setLoading] = useState(true);

  const heroRef = useScrollAnimation();
  const statsRef = useScrollAnimation({ threshold: 0.2 });

  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserData();
      fetchSavedCareers();
    }
  }, [currentUser]);

  const fetchUserData = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:8000');
      const response = await axios.get(`${API_URL}/api/user/${currentUser.uid}/progress`);
      setUserData(response.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedCareers = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:8000');
      const response = await axios.get(`${API_URL}/api/user/${currentUser.uid}/selected-careers`);
      setSavedCareers(response.data.careers || []);
    } catch (error) {
      console.error('Error fetching saved careers:', error);
    }
  };

  const progress = userData?.progress || {};
  const latestAssessment = userData?.latest_assessment || null;
  const skillsToDevelop = latestAssessment?.skills_gap || [];
  const learningResources = latestAssessment?.learning_resources || [];
  const recentActivity = userData?.recent_activity || [];

  const quickStats = [
    {
      label: 'Assessments Completed',
      value: progress.assessments_completed || 0,
      icon: CheckCircle,
      gradient: 'from-prism-green to-prism-emerald'
    },
    {
      label: 'Career Matches Found',
      value: progress.career_matches_found || 0,
      icon: Target,
      gradient: 'from-prism-violet to-prism-indigo'
    },
    {
      label: 'Skills to Develop',
      value: progress.skills_to_develop || 0,
      icon: TrendingUp,
      gradient: 'from-prism-blue to-prism-cyan'
    },
    {
      label: 'Learning Resources',
      value: progress.learning_resources_accessed || 0,
      icon: BookOpen,
      gradient: 'from-prism-orange to-prism-yellow'
    },
  ];

  const quickActions = [
    {
      title: 'Take Career Assessment',
      description: 'Discover your ideal career path with our AI-powered assessment',
      icon: Brain,
      link: '/assessment',
      gradient: 'from-prism-violet to-prism-indigo'
    },
    {
      title: 'Explore Careers',
      description: 'Browse through hundreds of career paths tailored for Indian students',
      icon: Target,
      link: '/explore',
      gradient: 'from-prism-indigo to-prism-blue'
    },
    {
      title: 'Chat with AI Mentor',
      description: 'Get instant career guidance and answers to your questions',
      icon: MessageSquare,
      link: '/mentor',
      gradient: 'from-prism-blue to-prism-cyan'
    },
    {
      title: 'Start Career Journey',
      description: 'Begin your personalized roadmap to achieve your career goals',
      icon: Rocket,
      link: '/journey',
      gradient: 'from-prism-cyan to-prism-green'
    },
  ];

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors pb-6">
      {loading ? (
        <div className="container-custom py-8">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Loader className="h-12 w-12 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
            </div>
            <p className="text-base text-gray-600 dark:text-gray-300 font-semibold">Loading your dashboard...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative py-8 overflow-hidden">
            <div className="absolute inset-0 aurora-bg opacity-50"></div>
            <div className="container-custom relative z-10">
              <div ref={heroRef.ref} className={heroRef.isVisible ? 'animate-slide-up' : ''}>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3">
                      <span className="text-gray-900 dark:text-white">Welcome back, </span>
                      <span className="text-gradient-rainbow">
                        {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'}
                      </span>
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      Continue your journey to discover your perfect career path
                    </p>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 rounded-2xl bg-prism-gradient flex items-center justify-center shadow-prism-lg">
                      <Sparkles className="h-10 w-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Stats Grid */}
          <section className="container-custom mb-6">
            <div ref={statsRef.ref} className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${statsRef.isVisible ? 'animate-scale-in' : ''}`}>
              {quickStats.map((stat, idx) => (
                <div key={idx} className="card-3d text-center">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center mx-auto mb-4 shadow-prism`}>
                    <stat.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-black text-gradient mb-2">{stat.value}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="container-custom mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, idx) => (
                <Link
                  key={idx}
                  to={action.link}
                  className="card-3d group cursor-pointer"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 shadow-prism group-hover:scale-110 transition-transform`}>
                    <action.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                    {action.description}
                  </p>
                  <div className="flex items-center text-prism-violet dark:text-prism-cyan font-semibold group-hover:translate-x-2 transition-transform">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Main Content Grid */}
          <div className="container-custom grid lg:grid-cols-3 gap-6 mb-6">
            {/* Career Recommendations */}
            {latestAssessment?.career_paths && latestAssessment.career_paths.length > 0 && (
              <div className="lg:col-span-2 card-3d">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Target className="h-6 w-6 text-prism-violet dark:text-prism-cyan mr-2" />
                    Your Career Matches
                  </h2>
                  <Link to="/assessment/results" className="btn-ghost text-sm">
                    View All
                  </Link>
                </div>
                <div className="space-y-4">
                  {latestAssessment.career_paths.slice(0, 3).map((career, idx) => (
                    <Link
                      key={idx}
                      to={`/career/${career.title?.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block p-4 rounded-xl bg-gradient-to-r from-prism-violet/10 via-prism-indigo/10 to-prism-blue/10 dark:from-prism-violet/20 dark:via-prism-indigo/20 dark:to-prism-blue/20 border border-prism-violet/20 hover:border-prism-violet/40 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">
                            {career.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                            {career.description}
                          </p>
                        </div>
                        <div className="ml-4 text-right">
                          <div className="text-2xl font-black text-gradient mb-1">
                            {career.match_percentage}%
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Match</div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            <div className="card-3d">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                <Clock className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.slice(0, 5).map((activity, idx) => (
                    <div key={idx} className="flex items-start space-x-3 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0">
                      <div className="w-2 h-2 rounded-full bg-prism-violet dark:bg-prism-cyan mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900 dark:text-white font-medium">{activity.activity_type}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent activity. Start exploring!
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Saved Career Choices */}
          {savedCareers.length > 0 && (
            <section className="container-custom mb-6">
              <div className="card-3d">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                    <Star className="h-6 w-6 text-prism-violet dark:text-prism-cyan mr-2" />
                    Your Saved Career Choices
                  </h2>
                  <Link to="/journey" className="btn-ghost text-sm">
                    View Journey
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {savedCareers.map((career, idx) => {
                    // Handle both string and object formats from backend
                    const careerTitle = typeof career === 'string' ? career : (career?.career_title || career?.title || String(career));
                    const careerSlug = careerTitle.toLowerCase().replace(/\s+/g, '-');

                    return (
                      <Link
                        key={idx}
                        to={`/career/${careerSlug}`}
                        className="group p-4 rounded-xl bg-gradient-to-br from-prism-violet/10 via-prism-indigo/10 to-prism-blue/10 dark:from-prism-violet/20 dark:via-prism-indigo/20 dark:to-prism-blue/20 border border-prism-violet/20 hover:border-prism-violet/40 hover:shadow-prism transition-all"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Star className="h-5 w-5 text-prism-yellow dark:text-prism-yellow fill-prism-yellow/20" />
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">
                              {careerTitle}
                            </h3>
                          </div>
                          <ArrowRight className="h-5 w-5 text-prism-violet dark:text-prism-cyan opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Click to explore this career path
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {/* Skills & Resources */}
          {(skillsToDevelop.length > 0 || learningResources.length > 0) && (
            <div className="container-custom grid md:grid-cols-2 gap-6 mb-6">
              {/* Skills to Develop */}
              {skillsToDevelop.length > 0 && (
                <div className="card-3d">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <TrendingUp className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2" />
                    Skills to Develop
                  </h2>
                  <div className="space-y-3">
                    {skillsToDevelop.slice(0, 5).map((skill, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-prism-violet/5 dark:bg-prism-cyan/5 border border-prism-violet/10 dark:border-prism-cyan/10">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white">{skill.skill}</h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-bold ${skill.priority === 'High' ? 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                            skill.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                              'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                            }`}>
                            {skill.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{skill.learning_path}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Learning Resources */}
              {learningResources.length > 0 && (
                <div className="card-3d">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                    <BookOpen className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2" />
                    Learning Resources
                  </h2>
                  <div className="space-y-3">
                    {learningResources.slice(0, 5).map((resource, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-prism-violet/5 dark:bg-prism-cyan/5 border border-prism-violet/10 dark:border-prism-cyan/10 hover:border-prism-violet/30 dark:hover:border-prism-cyan/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{resource.resource_name}</h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{resource.type} • {resource.provider}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">{resource.relevance}</p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-prism-violet dark:text-prism-cyan ml-2 flex-shrink-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* CTA Section */}
          {!latestAssessment && (
            <section className="container-custom mb-6">
              <div className="card-3d text-center py-8">
                <Brain className="h-16 w-16 text-prism-violet dark:text-prism-cyan mx-auto mb-6" />
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  Start Your Career Journey
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                  Take our AI-powered assessment to discover careers that match your interests and skills
                </p>
                <Link to="/assessment" className="btn-primary text-lg inline-flex items-center">
                  Take Assessment Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;
