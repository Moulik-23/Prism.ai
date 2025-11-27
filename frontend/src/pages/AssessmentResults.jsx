import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  MessageSquare, 
  Award,
  ArrowRight,
  Download,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Check
} from 'lucide-react';

const AssessmentResults = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  // Try to get results from location state, localStorage, or fetch from backend
  const [results, setResults] = useState(null);
  const [loadingResults, setLoadingResults] = useState(true);
  
  const [selectedCareers, setSelectedCareers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [requesting, setRequesting] = useState(false);

  // Load assessment results from multiple sources
  useEffect(() => {
    const loadResults = async () => {
      setLoadingResults(true);
      
      // First, try location state (fresh navigation)
      if (location.state?.results) {
        const stateResults = location.state.results;
        setResults(stateResults);
        // Save to localStorage
        if (currentUser?.uid) {
          localStorage.setItem(`assessment_results_${currentUser.uid}`, JSON.stringify(stateResults));
          localStorage.setItem(`assessment_timestamp_${currentUser.uid}`, Date.now().toString());
        }
        setLoadingResults(false);
        return;
      }

      // Second, try localStorage (page refresh or navigation back)
      if (currentUser?.uid) {
        const savedResults = localStorage.getItem(`assessment_results_${currentUser.uid}`);
        if (savedResults) {
          try {
            const parsedResults = JSON.parse(savedResults);
            setResults(parsedResults);
            setLoadingResults(false);
            
            // Also load saved selected careers
            const savedCareers = localStorage.getItem(`selected_careers_${currentUser.uid}`);
            if (savedCareers) {
              try {
                setSelectedCareers(JSON.parse(savedCareers));
              } catch (e) {
                console.error('Error loading saved careers:', e);
              }
            }
            return;
          } catch (e) {
            console.error('Error parsing saved results:', e);
            localStorage.removeItem(`assessment_results_${currentUser.uid}`);
          }
        }

        // Third, try to fetch from backend
        try {
          const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
          const response = await axios.get(`${API_URL}/api/user/${currentUser.uid}/progress`);
          
          if (response.data?.latest_assessment) {
            // Convert backend format to frontend format
            const backendResults = {
              recommendations: {
                career_paths: response.data.latest_assessment.career_paths || [],
                skills_gap: response.data.latest_assessment.skills_gap || [],
                learning_resources: response.data.latest_assessment.learning_resources || [],
                personalized_advice: response.data.latest_assessment.personalized_advice || ''
              }
            };
            
            setResults(backendResults);
            // Save to localStorage for future use
            localStorage.setItem(`assessment_results_${currentUser.uid}`, JSON.stringify(backendResults));
          }
        } catch (error) {
          console.error('Error fetching results from backend:', error);
        }
      }

      setLoadingResults(false);
    };

    loadResults();
  }, [location.state, currentUser?.uid]);

  // Save selected careers to localStorage whenever they change
  useEffect(() => {
    if (currentUser?.uid && selectedCareers.length > 0) {
      localStorage.setItem(`selected_careers_${currentUser.uid}`, JSON.stringify(selectedCareers));
    }
  }, [selectedCareers, currentUser?.uid]);

  const recommendations = results?.recommendations || {};

  // Show loading state
  if (loadingResults) {
    return (
      <div className="bg-prism-light dark:bg-prism-dark py-12">
        <div className="container-custom">
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Target className="h-16 w-16 text-prism-violet dark:text-prism-cyan animate-pulse relative z-10" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-semibold">Loading your assessment results...</p>
          </div>
        </div>
      </div>
    );
  }

  // Redirect if no results found from any source
  if (!results) {
    return (
      <div className="bg-prism-light dark:bg-prism-dark py-12">
        <div className="container-custom">
          <div className="text-center card-3d max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-yellow-500 dark:text-yellow-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">No Results Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please complete the career assessment first to see your results.
            </p>
            <Link to="/assessment" className="btn-primary">
              Take Assessment
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const toggleCareerSelection = (careerTitle) => {
    let updatedCareers;
    if (selectedCareers.includes(careerTitle)) {
      updatedCareers = selectedCareers.filter(c => c !== careerTitle);
    } else if (selectedCareers.length < 3) {
      updatedCareers = [...selectedCareers, careerTitle];
    } else {
      return; // Already at max
    }
    
    setSelectedCareers(updatedCareers);
    
    // Save to localStorage immediately
    if (currentUser?.uid) {
      localStorage.setItem(`selected_careers_${currentUser.uid}`, JSON.stringify(updatedCareers));
    }
  };

  const saveCareerChoices = async () => {
    if (selectedCareers.length === 0) {
      alert('Please select at least one career path');
      return;
    }

    setSaving(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      await axios.post(`${API_URL}/api/user/selected-careers`, {
        firebase_uid: currentUser.uid,
        careers: selectedCareers
      });
      setSaved(true);
      
      // Clear localStorage after successful save (optional - you can keep it for persistence)
      // localStorage.removeItem(`selected_careers_${currentUser.uid}`);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      console.error('Error saving career choices:', error);
      alert('Failed to save your choices. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const openGmailCompose = (careerTitle, careerSlug) => {
    const adminEmail = 'moulik.023@gmail.com';
    const subject = encodeURIComponent(`New Career Request: ${careerTitle}`);
    const body = encodeURIComponent(
      `Hello Admin,\n\n` +
      `I would like to request adding the following career to the Prism database:\n\n` +
      `Career Title: ${careerTitle}\n` +
      `Career Slug: ${careerSlug}\n\n` +
      `User Details:\n` +
      `- Name: ${currentUser.displayName || 'User'}\n` +
      `- Email: ${currentUser.email || 'Not provided'}\n` +
      `- User ID: ${currentUser.uid}\n\n` +
      `Please add this career with complete information including roadmap, exams, skills, and resources.\n\n` +
      `Thank you!`
    );
    
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${adminEmail}&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank');
  };

  const requestCareerAddition = async (careerTitle, careerSlug) => {
    setRequesting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${API_URL}/api/career/request`, {
        firebase_uid: currentUser.uid,
        career_title: careerTitle,
        career_slug: careerSlug,
        user_email: currentUser.email || '',
        user_name: currentUser.displayName || 'User',
        message: `User requested to add "${careerTitle}" career after completing assessment.`
      });
      
      // Check if email was configured or failed
      if (response.data?.status === 'email_not_configured' || response.data?.status === 'email_failed') {
        // Open Gmail compose automatically
        openGmailCompose(careerTitle, careerSlug);
        alert(
          `📧 Opening Gmail...\n\n` +
          `The email service is not configured/failed.\n` +
          `Gmail compose window will open automatically.\n\n` +
          `Please send the email to moulik.023@gmail.com.\n\n` +
          `The request has been saved to our database.`
        );
      } else if (response.data?.status === 'success') {
        // Email was sent successfully
        alert(
          `✅ Request Sent!\n\n` +
          `Career request for "${careerTitle}" has been sent to admin.\n` +
          `Email notification sent to: moulik.023@gmail.com\n\n` +
          `We'll add this career to the database soon!`
        );
      }
    } catch (error) {
      console.error('Error requesting career:', error);
      
      // If email failed, offer Gmail fallback
      const shouldOpenGmail = window.confirm(
        `⚠️ Email Request Failed\n\n` +
        `Could not send email automatically.\n\n` +
        `Would you like to open Gmail to send the request manually?\n` +
        `Click OK to open Gmail compose window.`
      );
      
      if (shouldOpenGmail) {
        openGmailCompose(careerTitle, careerSlug);
      } else {
        alert(
          `Request could not be sent.\n` +
          `You can manually email: moulik.023@gmail.com`
        );
      }
    } finally {
      setRequesting(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-prism-light dark:bg-prism-dark py-6 pb-6">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8" data-aos="fade-up">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-prism-gradient rounded-2xl mb-4 shadow-prism">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
            Your Career Recommendations
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Based on your responses, we've identified the best career paths and skills for you
          </p>
        </div>

        {/* Selection Instructions */}
        <div className="card-glass bg-prism-blue/5 dark:bg-prism-cyan/5 border-2 border-prism-blue/20 dark:border-prism-cyan/20 rounded-xl p-6 mb-6" data-aos="fade-up" data-aos-delay="100">
          <div className="flex items-start space-x-3">
            <Target className="h-6 w-6 text-prism-blue dark:text-prism-cyan mt-1 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 dark:text-white mb-2">Select Your Preferred Careers</h3>
              <p className="text-gray-700 dark:text-gray-300">
                Click on up to 3 career paths that interest you most. Your selections will be saved and used
                to personalize your experience.
              </p>
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Selected: {selectedCareers.length}/3
                </p>
                {selectedCareers.length > 0 && (
                  <button
                    onClick={saveCareerChoices}
                    disabled={saving || saved}
                    className={`btn-primary flex items-center ${
                      saved ? 'bg-green-600 hover:bg-green-600' : ''
                    } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {saved ? (
                      <>
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Saved!
                      </>
                    ) : saving ? (
                      'Saving...'
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Save My Choices
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-6" data-aos="fade-up" data-aos-delay="200">
          <Link to="/mentor" className="btn-secondary flex items-center">
            <MessageSquare className="h-5 w-5 mr-2" />
            Discuss with AI Mentor
          </Link>
          <button className="btn-secondary flex items-center">
            <Download className="h-5 w-5 mr-2" />
            Download Report
          </button>
          <Link to="/assessment" className="btn-secondary flex items-center">
            <RefreshCw className="h-5 w-5 mr-2" />
            Retake Assessment
          </Link>
        </div>

        {/* Career Paths */}
        <section className="mb-6" data-aos="fade-up" data-aos-delay="300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-violet to-prism-indigo flex items-center justify-center mr-3 shadow-prism">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Top Career Matches</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.career_paths?.map((career, idx) => {
              const isSelected = selectedCareers.includes(career.title);
              return (
              <div 
                key={idx} 
                className={`card-3d group transition-all relative ${
                  isSelected ? 'ring-4 ring-prism-violet dark:ring-prism-cyan bg-prism-violet/10 dark:bg-prism-cyan/10' : ''
                }`}
              >
                {/* Match Percentage - Moved to top-left to avoid checkbox overlap */}
                <div className="absolute top-4 left-4 bg-white dark:bg-prism-darker rounded-xl shadow-prism px-3 py-2 flex items-center space-x-2 z-10 border border-prism-violet/20 dark:border-prism-cyan/20">
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Match:</span>
                  <span className="text-xl font-black text-gradient">
                    {career.match_percentage}%
                  </span>
                </div>

                {/* Selection Indicator - Top Right */}
                <div className="absolute top-4 right-4 flex space-x-2 z-10">
                  <button
                    onClick={() => toggleCareerSelection(career.title)}
                    className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all shadow-prism ${
                      isSelected 
                        ? 'border-prism-violet dark:border-prism-cyan bg-prism-gradient' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-prism-darker hover:border-prism-violet/50 dark:hover:border-prism-cyan/50'
                    }`}
                    title="Select for assessment results"
                  >
                    {isSelected && <Check className="h-5 w-5 text-white" />}
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                        const response = await axios.post(`${API_URL}/api/career-journey/select`, {
                          firebase_uid: currentUser.uid,
                          career_slug: career.title.toLowerCase().replace(/\s+/g, '-'),
                          career_title: career.title
                        });
                        
                        // Check if career was found
                        if (response.data.status === 'career_not_found') {
                          // Career doesn't exist - show request option with Gmail fallback
                          const shouldRequest = window.confirm(
                            `⚠️ Career Not Found\n\n` +
                            `Career "${career.title}" is not yet available in our database.\n\n` +
                            `Would you like to request the admin to add this career?\n\n` +
                            `If email service is not configured, Gmail will open automatically.`
                          );
                          
                          if (shouldRequest) {
                            await requestCareerAddition(career.title, career.title.toLowerCase().replace(/\s+/g, '-'));
                          }
                        } else {
                          // Career exists - proceed normally
                          alert(`✅ Career "${career.title}" selected for your Career Journey!`);
                          navigate('/journey');
                        }
                      } catch (error) {
                        console.error('Error selecting career journey:', error);
                        // If 404 or career not found, offer to request
                        if (error.response?.status === 404 || error.response?.data?.status === 'career_not_found') {
                          const shouldRequest = window.confirm(
                            `⚠️ Career Not Found\n\n` +
                            `Career "${career.title}" is not yet available.\n\n` +
                            `Would you like to request the admin to add this career?\n\n` +
                            `If email service is not configured, Gmail will open automatically.`
                          );
                          if (shouldRequest) {
                            await requestCareerAddition(career.title, career.title.toLowerCase().replace(/\s+/g, '-'));
                          }
                        } else {
                          alert('Failed to select career. Please try again.');
                        }
                      }
                    }}
                    className="w-8 h-8 rounded-full bg-prism-gradient hover:opacity-90 flex items-center justify-center text-white transition-all shadow-prism"
                    title="Start Career Journey with this career"
                  >
                    <Target className="h-4 w-4" />
                  </button>
                </div>
                
                {/* Career Title - With padding-top to avoid overlap with match percentage */}
                <div className="pt-14 mb-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors">
                    {career.title}
                  </h3>
                </div>
                
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
                  <div
                    className="bg-prism-gradient h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${career.match_percentage}%` }}
                  />
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                  {career.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-prism-violet dark:text-prism-cyan mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">Education: </span>
                      <span className="text-gray-700 dark:text-gray-300">{career.required_education}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-prism-green mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">Salary Range: </span>
                      <span className="text-gray-700 dark:text-gray-300">{career.salary_range}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-prism-blue dark:text-prism-cyan mr-2 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-gray-900 dark:text-white">Growth: </span>
                      <span className="text-gray-700 dark:text-gray-300">{career.growth_prospects}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        </section>

        {/* Skills Gap Analysis */}
        <section className="mb-6" data-aos="fade-up" data-aos-delay="300">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-indigo to-prism-blue flex items-center justify-center mr-3 shadow-prism">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Skills to Develop</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.skills_gap?.map((skill, idx) => (
              <div key={idx} className="card-3d border-l-4 border-prism-indigo dark:border-prism-blue">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{skill.skill}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(skill.priority)}`}>
                    {skill.priority}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Current:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{skill.current_level}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Required:</span>
                    <span className="font-medium text-prism-violet dark:text-prism-cyan">{skill.required_level}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-prism-darker p-3 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="font-semibold">Learning Path: </span>
                  {skill.learning_path}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Learning Resources */}
        <section className="mb-6" data-aos="fade-up" data-aos-delay="400">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-orange to-prism-yellow flex items-center justify-center mr-3 shadow-prism">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white">Recommended Learning Resources</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {recommendations.learning_resources?.map((resource, idx) => (
              <div key={idx} className="card-3d border-l-4 border-prism-orange dark:border-prism-yellow transition-all">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white flex-1">
                    {resource.resource_name}
                  </h3>
                  <span className="px-3 py-1 bg-prism-orange/20 dark:bg-prism-yellow/20 text-prism-orange dark:text-prism-yellow rounded-full text-xs font-semibold ml-3 border border-prism-orange/30 dark:border-prism-yellow/30">
                    {resource.type}
                  </span>
                </div>
                
                <p className="text-gray-600 dark:text-gray-400 mb-3">
                  <span className="font-semibold">Provider: </span>
                  {resource.provider}
                </p>

                <p className="text-gray-700 dark:text-gray-300 bg-prism-orange/5 dark:bg-prism-yellow/5 p-3 rounded-xl border border-prism-orange/20 dark:border-prism-yellow/20">
                  {resource.relevance}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Personalized Advice */}
        <section className="mb-6" data-aos="fade-up" data-aos-delay="500">
          <div className="card-glass bg-prism-gradient text-white p-8 rounded-2xl shadow-prism-lg">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mr-3">
                <MessageSquare className="h-6 w-6 text-white" />
              </div>
              <h2 className="text-3xl font-black">Personalized Guidance</h2>
            </div>
            <div className="prose prose-lg prose-invert max-w-none">
              <p className="text-white/90 leading-relaxed whitespace-pre-line">
                {recommendations.personalized_advice}
              </p>
            </div>
          </div>
        </section>

        {/* Next Steps CTA */}
        <div className="card-3d p-8 text-center" data-aos="fade-up" data-aos-delay="600">
          <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
            Ready to Take the Next Step?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
            Chat with our AI Mentor to get personalized guidance on implementing these recommendations
            and achieving your career goals.
          </p>
          <Link to="/mentor" className="btn-primary inline-flex items-center text-lg">
            Start Chatting with AI Mentor
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AssessmentResults;
