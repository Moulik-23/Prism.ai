import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import {
  ArrowLeft,
  Award,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  ExternalLink,
  Briefcase,
  Target,
  BookOpen,
  DollarSign,
  GraduationCap,
  Loader,
  Rocket,
  MessageSquare,
  Sparkles
} from 'lucide-react';
import axios from 'axios';

const CareerDetail = () => {
  const { slug } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [career, setCareer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/' : 'http://localhost:8000');
  const heroRef = useScrollAnimation();

  useEffect(() => {
    fetchCareerDetails();
  }, [slug]);

  const fetchCareerDetails = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.get(`${API_URL}/api/careers/${slug}`);
      setCareer(response.data.career);
    } catch (err) {
      setError('Failed to load career details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const salaryRange = career && career.avg_salary_min && career.avg_salary_max
    ? `₹${career.avg_salary_min / 100000}-${career.avg_salary_max / 100000} LPA`
    : career?.avg_salary || 'Varies';

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors">
      <div className="container-custom py-4 md:py-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Loader className="h-12 w-12 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
            </div>
            <p className="text-base text-gray-600 dark:text-gray-300 font-semibold">Loading career details...</p>
          </div>
        ) : error || !career ? (
          <div className="text-center card-3d max-w-md mx-auto">
            <p className="text-red-600 dark:text-red-400 mb-4 font-semibold">{error || 'Career not found'}</p>
            <Link to="/explore" className="btn-primary inline-flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Explore
            </Link>
          </div>
        ) : (
          <>
            {/* Back Button */}
            <Link to="/explore" className="inline-flex items-center text-prism-violet dark:text-prism-cyan hover:text-prism-indigo dark:hover:text-prism-blue mb-4 font-semibold transition-colors">
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Explore Careers
            </Link>

            {/* Header */}
            <div className="card-glass bg-prism-gradient relative overflow-hidden mb-6" ref={heroRef.ref}>
              <div className={`relative z-10 p-6 md:p-8 text-white ${heroRef.isVisible ? 'animate-slide-up' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-4 border border-white/30">
                      {career.category}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black mb-4">{career.title}</h1>
                    <p className="text-xl text-white/90 mb-6 leading-relaxed">{career.short_description}</p>
                    <div className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <DollarSign className="h-5 w-5" />
                        <span className="font-bold">{salaryRange}</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                        <Users className="h-5 w-5" />
                        <span className="font-semibold">High Demand</span>
                      </div>
                      {career.popular_exams && career.popular_exams.length > 0 && (
                        <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl">
                          <Award className="h-5 w-5" />
                          <span className="font-semibold">{career.popular_exams.length} Entrance Exams</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* About */}
                {(career.full_description || career.short_description) && (
                  <section className="card-3d animate-scale-in">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-violet to-prism-indigo flex items-center justify-center mr-4 shadow-prism">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        About This Career
                      </h2>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">{career.full_description || career.short_description}</p>
                  </section>
                )}

                {/* Career Roadmap */}
                <section className="card-3d animate-scale-in">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-indigo to-prism-blue flex items-center justify-center mr-4 shadow-prism">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Career Roadmap
                    </h2>
                  </div>
                  {career.roadmap && career.roadmap.length > 0 ? (
                    <div className="space-y-4">
                      {career.roadmap.map((step, idx) => (
                        <div key={idx} className="relative pl-8 border-l-2 border-prism-violet/30 dark:border-prism-cyan/30 pb-4 last:pb-0">
                          <div className="absolute -left-3 top-0 w-6 h-6 bg-prism-gradient rounded-full flex items-center justify-center text-white text-sm font-bold shadow-prism">
                            {idx + 1}
                          </div>
                          <div className="card-glass bg-prism-violet/5 dark:bg-prism-cyan/5 p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h3 className="font-bold text-gray-900 dark:text-white">{step.title}</h3>
                              {step.timeline && (
                                <span className="text-sm text-prism-violet dark:text-prism-cyan font-semibold bg-prism-violet/10 dark:bg-prism-cyan/10 px-3 py-1 rounded-full">
                                  {step.timeline}
                                </span>
                              )}
                            </div>
                            {step.stage && (
                              <p className="text-sm text-prism-violet dark:text-prism-cyan font-medium mb-2">{step.stage}</p>
                            )}
                            {step.description && (
                              <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed text-sm">{step.description}</p>
                            )}
                            {step.action_items && (
                              <div className="bg-white dark:bg-prism-darker rounded-xl p-3 border border-prism-violet/20 dark:border-prism-cyan/20 mt-2">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Action Items:</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">{step.action_items}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Target className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-600 dark:text-gray-400 font-medium">Roadmap data coming soon</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">This career's roadmap is being updated</p>
                    </div>
                  )}
                </section>

                {/* Job Roles */}
                {career.job_roles && career.job_roles.length > 0 && (
                  <section className="card-3d animate-scale-in">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-blue to-prism-cyan flex items-center justify-center mr-4 shadow-prism">
                        <Briefcase className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Job Roles & Salaries
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {career.job_roles.map((role, idx) => (
                        <div key={idx} className="card-glass border-2 border-prism-violet/20 dark:border-prism-cyan/20 hover:border-prism-violet/40 dark:hover:border-prism-cyan/40 transition-all hover:scale-105 p-4">
                          <h3 className="font-bold text-gray-900 dark:text-white mb-2">{role.role_title || 'Job Role'}</h3>
                          {role.experience_level && (
                            <p className="text-sm text-prism-violet dark:text-prism-cyan font-medium mb-2">{role.experience_level}</p>
                          )}
                          {role.salary_range && (
                            <p className="text-sm font-bold text-gradient mb-2">{role.salary_range}</p>
                          )}
                          {role.responsibilities && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{role.responsibilities}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Learning Resources */}
                {career.resources && career.resources.length > 0 && (
                  <section className="card-3d animate-scale-in">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-cyan to-prism-teal flex items-center justify-center mr-4 shadow-prism">
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Learning Resources
                      </h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3">
                      {career.resources.map((resource, idx) => (
                        <div key={idx} className="card-glass border-2 border-prism-violet/20 dark:border-prism-cyan/20 hover:border-prism-violet/40 dark:hover:border-prism-cyan/40 transition-all hover:scale-105 group p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h3 className="font-bold text-gray-900 dark:text-white group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">{resource.resource_name || 'Resource'}</h3>
                            {resource.is_free && (
                              <span className="px-2 py-1 bg-prism-green/20 text-prism-green font-bold rounded-lg text-xs border border-prism-green/30">FREE</span>
                            )}
                          </div>
                          {resource.provider && (
                            <p className="text-sm text-prism-violet dark:text-prism-cyan font-medium mb-2">{resource.provider}</p>
                          )}
                          {resource.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">{resource.description}</p>
                          )}
                          {resource.url && (
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-prism-violet dark:text-prism-cyan hover:text-prism-indigo dark:hover:text-prism-blue font-semibold flex items-center group-hover:translate-x-1 transition-transform"
                            >
                              Visit Resource <ExternalLink className="h-4 w-4 ml-1" />
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Entrance Exams */}
                {career.entrance_exams && career.entrance_exams.length > 0 ? (
                  <div className="card-3d animate-scale-in">
                    <div className="flex items-center mb-3">
                      <Award className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Entrance Exams</h3>
                    </div>
                    <div className="space-y-3">
                      {career.entrance_exams.map((exam, idx) => (
                        <div key={idx} className="border-l-4 border-prism-violet dark:border-prism-cyan pl-4 bg-prism-violet/5 dark:bg-prism-cyan/5 rounded-r-lg p-3">
                          <h4 className="font-bold text-gray-900 dark:text-white">{exam.exam_name}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{exam.exam_full_name}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Level:</span> {exam.exam_level}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Frequency:</span> {exam.frequency}</p>
                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Difficulty:</span> {exam.difficulty_level}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Educational Paths */}
                {career.educational_paths && career.educational_paths.length > 0 ? (
                  <div className="card-3d animate-scale-in">
                    <div className="flex items-center mb-3">
                      <GraduationCap className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Educational Paths</h3>
                    </div>
                    <div className="space-y-3">
                      {career.educational_paths.map((path, idx) => (
                        <div key={idx} className="card-glass bg-prism-violet/5 dark:bg-prism-cyan/5">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-bold text-gray-900 dark:text-white">{path.degree_name}</h4>
                            <Clock className="h-4 w-4 text-prism-violet dark:text-prism-cyan" />
                          </div>
                          <p className="text-sm text-prism-violet dark:text-prism-cyan font-medium mb-2">{path.duration}</p>
                          <p className="text-xs text-gray-700 dark:text-gray-300 mb-2"><span className="font-semibold">Eligibility:</span> {path.eligibility}</p>
                          {path.top_colleges && (
                            <p className="text-xs text-gray-700 dark:text-gray-300"><span className="font-semibold">Top Colleges:</span> {path.top_colleges}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Skills Required */}
                {career.skills_required && career.skills_required.length > 0 ? (
                  <div className="card-3d animate-scale-in">
                    <div className="flex items-center mb-3">
                      <TrendingUp className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2" />
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Skills Required</h3>
                    </div>
                    <div className="space-y-2">
                      {career.skills_required.map((skill, idx) => (
                        <div key={idx} className="flex items-start space-x-3 p-3 bg-prism-violet/5 dark:bg-prism-cyan/5 rounded-xl">
                          <CheckCircle className="h-5 w-5 text-prism-green mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-bold text-gray-900 dark:text-white text-sm">{skill.skill_name}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{skill.description}</p>
                            <span className={`inline-block mt-2 px-2 py-1 rounded-lg text-xs font-bold ${skill.importance_level === 'Critical' ? 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-800' :
                                skill.importance_level === 'High' ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400 border border-orange-300 dark:border-orange-800' :
                                  'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800'
                              }`}>
                              {skill.importance_level}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Quick Info */}
                <div className="card-glass bg-prism-gradient text-white animate-scale-in">
                  <div className="flex items-center mb-4">
                    <Sparkles className="h-5 w-5 mr-2" />
                    <h3 className="text-lg font-bold">Career Insights</h3>
                  </div>
                  <div className="space-y-4 text-sm">
                    {career.growth_prospects && (
                      <div>
                        <p className="font-semibold mb-1 text-white">Growth Prospects:</p>
                        <p className="text-white/90">{career.growth_prospects}</p>
                      </div>
                    )}
                    {career.work_environment && (
                      <div>
                        <p className="font-semibold mb-1 text-white">Work Environment:</p>
                        <p className="text-white/90">{career.work_environment}</p>
                      </div>
                    )}
                    {career.job_outlook && (
                      <div>
                        <p className="font-semibold mb-1 text-white">Job Outlook:</p>
                        <p className="text-white/90">{career.job_outlook}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* CTA */}
                <div className="card-3d space-y-3 animate-scale-in">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-center">Take Action</h3>
                  {currentUser ? (
                    <>
                      <button
                        onClick={async () => {
                          try {
                            await axios.post(`${API_URL}/api/career-journey/select`, {
                              firebase_uid: currentUser.uid,
                              career_slug: career.slug,
                              career_title: career.title
                            });
                            alert(`"${career.title}" selected for your Career Journey!`);
                            navigate('/journey');
                          } catch (error) {
                            console.error('Error selecting career:', error);
                            alert('Failed to select career. Please try again.');
                          }
                        }}
                        className="w-full btn-primary flex items-center justify-center"
                      >
                        <Rocket className="h-5 w-5 mr-2" />
                        Start Career Journey
                      </button>

                      <button
                        onClick={() => {
                          // Store career context in sessionStorage for AI Mentor
                          sessionStorage.setItem('mentorCareerContext', JSON.stringify({
                            career_title: career.title,
                            career_description: career.full_description || career.short_description,
                            career_slug: career.slug,
                            avg_salary: salaryRange,
                            popular_exams: career.entrance_exams?.map(e => e.exam_name) || career.popular_exams || [],
                            skills_required: career.skills_required?.map(s => s.skill_name) || [],
                            job_roles: career.job_roles?.map(r => r.role_title) || []
                          }));
                          navigate('/mentor');
                        }}
                        className="w-full btn-secondary flex items-center justify-center"
                      >
                        <MessageSquare className="h-5 w-5 mr-2" />
                        Chat AI Mentor About This Career
                      </button>
                    </>
                  ) : (
                    <Link to="/login" className="btn-primary w-full block text-center">
                      Sign In to Get Started
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CareerDetail;
