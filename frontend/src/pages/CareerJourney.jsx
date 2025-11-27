import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';
import axios from 'axios';
import { jobsAPI } from '../services/api';
import {
  Target,
  CheckCircle,
  Circle,
  BookOpen,
  Briefcase,
  Loader,
  AlertCircle,
  Rocket,
  TrendingUp,
  MapPin,
  DollarSign,
  Calendar,
  ExternalLink,
  Check,
  Sparkles,
  GraduationCap,
  ArrowRight,
  Search,
  Globe
} from 'lucide-react';

const CareerJourney = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState(null);
  const [selectedCareer, setSelectedCareer] = useState(null);
  const [roadmapProgress, setRoadmapProgress] = useState({});
  const [currentView, setCurrentView] = useState('roadmap'); // 'roadmap' or 'jobs'
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [applications, setApplications] = useState([]);
  const [indeedJobs, setIndeedJobs] = useState([]);
  const [loadingIndeed, setLoadingIndeed] = useState(false);
  const [searchJobTitle, setSearchJobTitle] = useState('');
  const [searchLocation, setSearchLocation] = useState('India');
  const [showIndeedResults, setShowIndeedResults] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const heroRef = useScrollAnimation();

  useEffect(() => {
    if (currentUser?.uid) {
      fetchCareerJourney();
    }
  }, [currentUser]);

  const fetchCareerJourney = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/career-journey/${currentUser.uid}`);
      
      if (response.data.status === 'success' && response.data.career) {
        setCareer(response.data.career);
        setSelectedCareer(response.data.selected_career);
        
        // Convert roadmap progress to object for easy lookup
        const progressMap = {};
        if (response.data.roadmap_progress && Array.isArray(response.data.roadmap_progress)) {
          response.data.roadmap_progress.forEach(item => {
            // Ensure consistent key format matching what we save
            const key = `${item.roadmap_stage}_${item.roadmap_step_id}`;
            // Convert boolean or 1/0 to boolean
            progressMap[key] = Boolean(item.is_completed);
          });
        }
        setRoadmapProgress(progressMap);
        console.log('Loaded roadmap progress:', progressMap); // Debug log
      }
    } catch (error) {
      console.error('Error fetching career journey:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStepToggle = async (stage, stepId, stepTitle, careerId) => {
    // Create consistent key format: stage_step_${idx}
    const key = `${stage}_${stepId}`;
    const currentStatus = roadmapProgress[key] || false;
    const newStatus = !currentStatus;
    
    try {
      const response = await axios.post(`${API_URL}/api/career-journey/roadmap/progress`, {
        firebase_uid: currentUser.uid,
        career_id: careerId,
        roadmap_stage: stage,
        roadmap_step_id: stepId,
        step_title: stepTitle,
        is_completed: newStatus
      });
      
      if (response.data.status === 'success') {
        // Update local state immediately
        setRoadmapProgress(prev => ({
          ...prev,
          [key]: newStatus
        }));
        
        // Verify save by refetching after a short delay
        setTimeout(() => {
          fetchCareerJourney();
        }, 500);
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      alert('Failed to update progress. Please try again.');
    }
  };

  const checkRoadmapComplete = () => {
    if (!career?.roadmap) return false;
    const totalSteps = career.roadmap.length;
    const completedSteps = career.roadmap.filter((step, idx) => {
      const key = `${step.stage}_step_${idx}`;
      return roadmapProgress[key] === true;
    }).length;
    return completedSteps === totalSteps && totalSteps > 0;
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const careerId = career?.id;
      const response = await axios.get(`${API_URL}/api/jobs`, {
        params: { career_id: careerId, limit: 50 }
      });
      setJobs(response.data.jobs || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/jobs/my-applications/${currentUser.uid}`);
      setApplications(response.data.applications || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const handleApplyJob = async (job) => {
    if (!window.confirm(`Apply to ${job.job_title} at ${job.company_name}?`)) {
      return;
    }

    try {
      await jobsAPI.applyToJob(currentUser.uid, {
        job_listing_id: job.id,
        job_title: job.job_title,
        company_name: job.company_name,
        job_location: job.job_location,
        salary_range: job.salary_range,
        job_url: job.job_url
      });
      
      alert('Application submitted successfully!');
      fetchApplications();
      fetchJobs(); // Refresh to show updated status
    } catch (error) {
      console.error('Error applying to job:', error);
      alert('Failed to apply. Please try again.');
    }
  };

  const handleSearchIndeed = async (e) => {
    e.preventDefault();
    if (!searchJobTitle.trim()) {
      alert('Please enter a job title to search');
      return;
    }

    setLoadingIndeed(true);
    setShowIndeedResults(true);
    try {
      const response = await jobsAPI.searchIndeed(searchJobTitle, searchLocation, 15);
      setIndeedJobs(response.jobs || []);
      
      // Show helpful message if no jobs found
      if (response.jobs && response.jobs.length === 0 && response.message) {
        // Message will be displayed in the UI
      }
    } catch (error) {
      console.error('Error searching Indeed:', error);
      alert('Failed to search Indeed. You can try searching directly on Indeed.com');
      setIndeedJobs([]);
    } finally {
      setLoadingIndeed(false);
    }
  };

  const getIndeedDirectLink = () => {
    const encodedTitle = encodeURIComponent(searchJobTitle);
    const encodedLocation = encodeURIComponent(searchLocation);
    return `https://www.indeed.co.in/jobs?q=${encodedTitle}&l=${encodedLocation}`;
  };

  const handleApplyIndeedJob = async (job) => {
    if (!window.confirm(`Record application for ${job.job_title} at ${job.company_name}?`)) {
      return;
    }

    try {
      await jobsAPI.applyToJob(currentUser.uid, {
        job_title: job.job_title,
        company_name: job.company_name,
        job_location: job.job_location,
        salary_range: job.salary_range,
        job_url: job.job_url,
        notes: `Applied via Indeed search`
      });
      
      alert('Application recorded successfully!');
      fetchApplications();
    } catch (error) {
      console.error('Error applying to Indeed job:', error);
      alert('Failed to record application. Please try again.');
    }
  };

  useEffect(() => {
    if (currentView === 'jobs') {
      fetchJobs();
      fetchApplications();
      // Auto-populate search with career title if available
      if (selectedCareer?.career_title && !searchJobTitle) {
        setSearchJobTitle(selectedCareer.career_title);
      }
    }
  }, [currentView, career]);

  const isRoadmapComplete = checkRoadmapComplete();
  const appliedJobIds = new Set(applications.map(app => app.job_listing_id));

  if (loading) {
    return (
      <div className="bg-prism-light dark:bg-prism-dark py-12">
        <div className="container-custom">
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Loader className="h-16 w-16 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-semibold">Loading your Career Journey...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!career || !selectedCareer) {
    return (
      <div className="bg-prism-light dark:bg-prism-dark py-12">
        <div className="container-custom">
          <div className="card-3d text-center">
            <Rocket className="h-16 w-16 text-prism-violet dark:text-prism-cyan mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Start Your Career Journey</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Select a career path to begin your personalized journey with roadmap, learning resources, and job opportunities.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Complete your assessment first to see recommended careers, or explore careers from the Explore page.
            </p>
            <a href="/explore" className="btn-primary inline-flex items-center">
              Explore Careers
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  const salaryRange = career.avg_salary_min && career.avg_salary_max
    ? `₹${career.avg_salary_min / 100000}-${career.avg_salary_max / 100000} LPA`
    : 'Varies';

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors pb-6">
      <div className="container-custom py-4 md:py-6">
        {/* Header */}
        <div className="mb-6" ref={heroRef.ref}>
          <div className={`flex items-center justify-between mb-4 ${heroRef.isVisible ? 'animate-slide-up' : ''}`}>
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-3 bg-prism-gradient rounded-xl shadow-prism">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">Career Journey</h1>
                  <p className="text-lg text-prism-violet dark:text-prism-cyan font-semibold">{selectedCareer.career_title}</p>
                </div>
              </div>
            </div>
            {isRoadmapComplete && (
              <div className="card-3d bg-prism-green/20 dark:bg-prism-green/10 border-2 border-prism-green/30 dark:border-prism-green/20 px-4 py-2 rounded-xl flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-prism-green" />
                <span className="font-bold text-prism-green">Roadmap Complete!</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-6 card-glass p-2 flex space-x-2" ref={heroRef.ref}>
          <button
            onClick={() => setCurrentView('roadmap')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentView === 'roadmap'
                ? 'bg-prism-gradient text-white shadow-prism-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Roadmap</span>
            </div>
          </button>
          <button
            onClick={() => setCurrentView('jobs')}
            className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all ${
              currentView === 'jobs'
                ? 'bg-prism-gradient text-white shadow-prism-lg'
                : 'text-gray-600 dark:text-gray-400 hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10'
            }`}
            disabled={!isRoadmapComplete}
          >
            <div className="flex items-center justify-center space-x-2">
              <Briefcase className="h-5 w-5" />
              <span>Find Jobs</span>
              {!isRoadmapComplete && (
                <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">Complete roadmap first</span>
              )}
            </div>
          </button>
        </div>

        {/* Roadmap View */}
        {currentView === 'roadmap' && (
          <div className="space-y-4">
            {/* Career Overview */}
            <div className="card-3d animate-scale-in">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-violet to-prism-indigo flex items-center justify-center mr-4 shadow-prism">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  About This Career
                </h2>
              </div>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{career.full_description || career.short_description}</p>
              <div className="grid md:grid-cols-3 gap-4 mt-4">
                <div className="card-glass bg-prism-violet/5 dark:bg-prism-cyan/5 p-4 rounded-xl">
                  <DollarSign className="h-5 w-5 text-prism-violet dark:text-prism-cyan mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Salary Range</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{salaryRange}</p>
                </div>
                <div className="card-glass bg-prism-indigo/5 dark:bg-prism-blue/5 p-4 rounded-xl">
                  <TrendingUp className="h-5 w-5 text-prism-indigo dark:text-prism-blue mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Growth Prospects</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">{career.growth_prospects || 'High'}</p>
                </div>
                <div className="card-glass bg-prism-green/5 dark:bg-prism-green/10 p-4 rounded-xl">
                  <Target className="h-5 w-5 text-prism-green mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Roadmap Progress</p>
                  <p className="font-bold text-gray-900 dark:text-white text-lg">
                    {career.roadmap 
                      ? `${career.roadmap.filter((_, idx) => {
                          const key = `${career.roadmap[idx].stage}_step_${idx}`;
                          return roadmapProgress[key] === true;
                        }).length}/${career.roadmap.length} Steps`
                      : '0 Steps'}
                  </p>
                </div>
              </div>
            </div>

            {/* Roadmap Steps */}
            {career.roadmap && career.roadmap.length > 0 && (
              <div className="card-3d animate-scale-in">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-indigo to-prism-blue flex items-center justify-center mr-4 shadow-prism">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Your Career Roadmap
                  </h2>
                </div>
                <div className="space-y-4">
                  {career.roadmap.map((step, idx) => {
                    // Use consistent key format that matches save/load
                    const stepKey = `${step.stage}_step_${idx}`;
                    const isCompleted = roadmapProgress[stepKey] === true || roadmapProgress[stepKey] === 1;
                    
                    return (
                      <div key={idx} className="relative pl-10">
                        <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center shadow-prism ${
                          isCompleted ? 'bg-prism-gradient' : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-white" />
                          ) : (
                            <Circle className="h-5 w-5 text-white" />
                          )}
                        </div>
                        <div className={`card-glass rounded-xl p-4 border-l-4 ${
                          isCompleted 
                            ? 'border-prism-green bg-prism-green/5 dark:bg-prism-green/10' 
                            : 'border-prism-violet/30 dark:border-prism-cyan/30 bg-prism-violet/5 dark:bg-prism-cyan/5'
                        }`}>
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2 flex-wrap">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{step.title}</h3>
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
                                <p className="text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{step.description}</p>
                              )}
                              {step.action_items && (
                                <div className="bg-white dark:bg-prism-darker rounded-xl p-3 mt-3 border border-prism-violet/20 dark:border-prism-cyan/20">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Action Items:</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">{step.action_items}</p>
                                </div>
                              )}
                            </div>
                            <button
                              onClick={() => handleStepToggle(step.stage, `step_${idx}`, step.title, career.id)}
                              className={`ml-4 p-3 rounded-xl transition-all shadow-prism ${
                                isCompleted
                                  ? 'bg-prism-green/20 hover:bg-prism-green/30 text-prism-green border-2 border-prism-green/30'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-prism-violet/20 dark:hover:bg-prism-cyan/20 text-gray-600 dark:text-gray-400 border-2 border-gray-200 dark:border-gray-600'
                              }`}
                              title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                            >
                              {isCompleted ? (
                                <CheckCircle className="h-6 w-6" />
                              ) : (
                                <Circle className="h-6 w-6" />
                              )}
                            </button>
                          </div>
                        </div>
                        {idx < career.roadmap.length - 1 && (
                          <div className="absolute left-4 top-8 w-0.5 h-4 bg-prism-violet/30 dark:bg-prism-cyan/30" />
                        )}
                      </div>
                    );
                  })}
                </div>

                {isRoadmapComplete && (
                  <div className="mt-6 card-glass bg-prism-gradient text-white text-center p-6 rounded-xl">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold mb-2">Congratulations! 🎉</h3>
                    <p className="text-white/90 mb-4 leading-relaxed">
                      You've completed all steps in your career roadmap. You're now ready to explore job opportunities!
                    </p>
                    <button
                      onClick={() => setCurrentView('jobs')}
                      className="btn-secondary bg-white text-prism-violet hover:bg-gray-100 inline-flex items-center"
                    >
                      Find Jobs
                      <Briefcase className="ml-2 h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Learning Resources */}
            {career.resources && career.resources.length > 0 && (
              <div className="card-3d animate-scale-in">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-cyan to-prism-teal flex items-center justify-center mr-4 shadow-prism">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Learning Resources
                  </h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {career.resources.map((resource, idx) => (
                    <div key={idx} className="card-glass border-2 border-prism-violet/20 dark:border-prism-cyan/20 hover:border-prism-violet/40 dark:hover:border-prism-cyan/40 transition-all hover:scale-105 p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white">{resource.resource_name}</h3>
                        {resource.is_free && (
                          <span className="px-2 py-1 bg-prism-green/20 text-prism-green font-bold rounded-lg text-xs border border-prism-green/30">FREE</span>
                        )}
                      </div>
                      {resource.provider && (
                        <p className="text-sm text-prism-violet dark:text-prism-cyan font-medium mb-2">{resource.provider}</p>
                      )}
                      {resource.description && (
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 leading-relaxed">{resource.description}</p>
                      )}
                      {resource.url && (
                        <a
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-prism-violet dark:text-prism-cyan hover:text-prism-indigo dark:hover:text-prism-blue font-semibold flex items-center group-hover:translate-x-1 transition-transform"
                        >
                          Visit Resource
                          <ExternalLink className="h-4 w-4 ml-1" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Jobs View */}
        {currentView === 'jobs' && (
          <div className="space-y-4">
            {isRoadmapComplete ? (
              <>
                {/* Indeed Job Search */}
                <div className="card-3d animate-scale-in">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-blue to-prism-cyan flex items-center justify-center mr-4 shadow-prism">
                      <Globe className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Search Jobs on Indeed</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Search for jobs on Indeed.com based on your career interests. Free and updated in real-time.
                  </p>
                  <form onSubmit={handleSearchIndeed} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Job Title or Keywords
                        </label>
                        <input
                          type="text"
                          value={searchJobTitle}
                          onChange={(e) => setSearchJobTitle(e.target.value)}
                          placeholder={`e.g., ${selectedCareer?.career_title || 'Software Engineer'}`}
                          className="input-field"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Location
                        </label>
                        <input
                          type="text"
                          value={searchLocation}
                          onChange={(e) => setSearchLocation(e.target.value)}
                          placeholder="e.g., India, Mumbai, Bangalore"
                          className="input-field"
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={loadingIndeed || !searchJobTitle.trim()}
                      className="btn-primary flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loadingIndeed ? (
                        <>
                          <Loader className="h-5 w-5 mr-2 animate-spin" />
                          Searching...
                        </>
                      ) : (
                        <>
                          <Search className="h-5 w-5 mr-2" />
                          Search Indeed Jobs
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Indeed Search Results */}
                {showIndeedResults && (
                  <div className="card-3d animate-scale-in">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <Globe className="h-6 w-6 text-prism-blue dark:text-prism-cyan mr-2" />
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Indeed Search Results</h2>
                      </div>
                      <span className="px-3 py-1 bg-prism-blue/20 dark:bg-prism-cyan/20 text-prism-blue dark:text-prism-cyan rounded-full text-sm font-semibold border border-prism-blue/30 dark:border-prism-cyan/30">
                        {indeedJobs.length} jobs found
                      </span>
                    </div>
                    {loadingIndeed ? (
                      <div className="text-center py-8">
                        <Loader className="h-8 w-8 text-prism-violet dark:text-prism-cyan animate-spin mx-auto mb-2" />
                        <p className="text-gray-600 dark:text-gray-400">Searching Indeed...</p>
                      </div>
                    ) : indeedJobs.length > 0 ? (
                      <div className="space-y-4">
                        {indeedJobs.map((job, idx) => {
                          const hasApplied = applications.some(app => 
                            app.job_title === job.job_title && app.company_name === job.company_name
                          );
                          return (
                            <div key={idx} className="card-glass border-2 border-prism-blue/20 dark:border-prism-cyan/20 hover:border-prism-blue/40 dark:hover:border-prism-cyan/40 transition-all p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-3 mb-2 flex-wrap">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.job_title}</h3>
                                    <span className="px-2 py-1 bg-prism-blue/20 dark:bg-prism-cyan/20 text-prism-blue dark:text-prism-cyan rounded text-xs font-semibold border border-prism-blue/30 dark:border-prism-cyan/30">
                                      Indeed
                                    </span>
                                    {hasApplied && (
                                      <span className="px-3 py-1 bg-prism-green/20 dark:bg-prism-green/10 text-prism-green rounded-full text-xs font-semibold border border-prism-green/30">
                                        Applied
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-lg text-prism-violet dark:text-prism-cyan font-semibold mb-2">{job.company_name}</p>
                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                    {job.job_location && (
                                      <div className="flex items-center">
                                        <MapPin className="h-4 w-4 mr-1" />
                                        {job.job_location}
                                      </div>
                                    )}
                                    {job.salary_range && job.salary_range !== 'Salary not specified' && (
                                      <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-1" />
                                        {job.salary_range}
                                      </div>
                                    )}
                                    {job.posted_at && job.posted_at !== 'Date not specified' && (
                                      <div className="flex items-center">
                                        <Calendar className="h-4 w-4 mr-1" />
                                        {job.posted_at}
                                      </div>
                                    )}
                                  </div>
                                  {job.description && job.description !== 'No description available' && (
                                    <p className="text-gray-700 dark:text-gray-300 mb-2 text-sm line-clamp-2">{job.description}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center justify-between mt-4 pt-4 border-t border-prism-violet/20 dark:border-prism-cyan/20">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  Source: Indeed.com
                                </div>
                                <div className="flex items-center space-x-3">
                                  {job.job_url && (
                                    <a
                                      href={job.job_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-secondary flex items-center text-sm"
                                    >
                                      View on Indeed
                                      <ExternalLink className="ml-1 h-4 w-4" />
                                    </a>
                                  )}
                                  <button
                                    onClick={() => handleApplyIndeedJob(job)}
                                    disabled={hasApplied}
                                    className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center ${
                                      hasApplied
                                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                        : 'btn-primary'
                                    }`}
                                  >
                                    {hasApplied ? (
                                      <>
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Applied
                                      </>
                                    ) : (
                                      <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Record Application
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <AlertCircle className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">No jobs found. Try different search terms.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500 mb-4">
                          Try using broader keywords or a different location.
                        </p>
                        <a
                          href={getIndeedDirectLink()}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary inline-flex items-center"
                        >
                          <Globe className="h-4 w-4 mr-2" />
                          Search on Indeed.com directly
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </div>
                    )}
                  </div>
                )}

                {/* Database Job Listings */}
                <div className="card-3d animate-scale-in">
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-indigo to-prism-blue flex items-center justify-center mr-4 shadow-prism">
                      <Briefcase className="h-6 w-6 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Opportunities from Database</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    Here are current job openings for {selectedCareer.career_title}. Click "Apply" to record your application.
                  </p>
                  
                  {loadingJobs ? (
                    <div className="text-center py-8">
                      <Loader className="h-8 w-8 text-prism-violet dark:text-prism-cyan animate-spin mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-400">Loading jobs...</p>
                    </div>
                  ) : jobs.length > 0 ? (
                    <div className="space-y-4">
                      {jobs.map((job) => {
                        const hasApplied = appliedJobIds.has(job.id);
                        return (
                          <div key={job.id} className="card-glass border-2 border-prism-violet/20 dark:border-prism-cyan/20 hover:border-prism-violet/40 dark:hover:border-prism-cyan/40 transition-all p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">{job.job_title}</h3>
                                  {hasApplied && (
                                    <span className="px-3 py-1 bg-prism-green/20 dark:bg-prism-green/10 text-prism-green rounded-full text-xs font-semibold border border-prism-green/30">
                                      Applied
                                    </span>
                                  )}
                                </div>
                                <p className="text-lg text-prism-violet dark:text-prism-cyan font-semibold mb-2">{job.company_name}</p>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
                                  {job.job_location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-4 w-4 mr-1" />
                                      {job.job_location}
                                    </div>
                                  )}
                                  {job.salary_range && (
                                    <div className="flex items-center">
                                      <DollarSign className="h-4 w-4 mr-1" />
                                      {job.salary_range}
                                    </div>
                                  )}
                                  {job.experience_level && (
                                    <div className="flex items-center">
                                      <TrendingUp className="h-4 w-4 mr-1" />
                                      {job.experience_level}
                                    </div>
                                  )}
                                  {job.job_type && (
                                    <div className="flex items-center">
                                      <Briefcase className="h-4 w-4 mr-1" />
                                      {job.job_type}
                                    </div>
                                  )}
                                </div>
                                {job.description && (
                                  <p className="text-gray-700 dark:text-gray-300 mb-2">{job.description}</p>
                                )}
                                {job.requirements && (
                                  <div className="bg-white dark:bg-prism-darker rounded-xl p-3 mt-3 border border-prism-violet/20 dark:border-prism-cyan/20">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Requirements:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">{job.requirements}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-prism-violet/20 dark:border-prism-cyan/20">
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                                <Calendar className="h-4 w-4 mr-1" />
                                Posted {new Date(job.posted_at).toLocaleDateString()}
                              </div>
                              <div className="flex items-center space-x-3">
                                {job.job_url && (
                                  <a
                                    href={job.job_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary flex items-center text-sm"
                                  >
                                    View Details
                                    <ExternalLink className="ml-1 h-4 w-4" />
                                  </a>
                                )}
                                <button
                                  onClick={() => handleApplyJob(job)}
                                  disabled={hasApplied}
                                  className={`px-4 py-2 rounded-xl font-semibold transition-all flex items-center ${
                                    hasApplied
                                      ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                      : 'btn-primary'
                                  }`}
                                >
                                  {hasApplied ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Applied
                                    </>
                                  ) : (
                                    <>
                                      <Check className="h-4 w-4 mr-2" />
                                      Apply
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400 mb-2 font-medium">No job listings available at the moment</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">
                        Check back later or search on Indeed for current opportunities.
                      </p>
                    </div>
                  )}
                </div>

                {/* My Applications */}
                {applications.length > 0 && (
                  <div className="card-3d animate-scale-in">
                    <div className="flex items-center mb-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-prism-green to-prism-teal flex items-center justify-center mr-4 shadow-prism">
                        <CheckCircle className="h-6 w-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Applications</h2>
                    </div>
                    <div className="space-y-3">
                      {applications.map((app, idx) => (
                        <div key={idx} className="card-glass border-2 border-prism-violet/20 dark:border-prism-cyan/20 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-bold text-gray-900 dark:text-white">{app.job_title}</h3>
                              <p className="text-sm text-prism-violet dark:text-prism-cyan font-medium">{app.company_name}</p>
                              {app.job_location && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{app.job_location}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                                app.application_status === 'applied' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-300 dark:border-blue-800' :
                                app.application_status === 'interview' ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-300 dark:border-yellow-800' :
                                app.application_status === 'accepted' ? 'bg-prism-green/20 dark:bg-prism-green/10 text-prism-green border-prism-green/30' :
                                'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600'
                              }`}>
                                {app.application_status}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(app.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card-3d text-center py-8">
                <Target className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Complete Your Roadmap First</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Finish all steps in your career roadmap to unlock job search features.
                </p>
                <button
                  onClick={() => setCurrentView('roadmap')}
                  className="btn-primary inline-flex items-center"
                >
                  Go to Roadmap
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CareerJourney;
