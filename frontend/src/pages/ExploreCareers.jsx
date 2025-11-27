import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation, useStaggeredAnimation } from '../hooks/useScrollAnimation';
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Award, 
  Briefcase,
  GraduationCap,
  Loader,
  Target,
  MessageSquare,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { careerAPI } from '../services/api';

const ExploreCareers = () => {
  const { currentUser } = useAuth();
  const [careers, setCareers] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [emailCopied, setEmailCopied] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Show 12 careers per page

  const heroRef = useScrollAnimation();
  const statsRef = useScrollAnimation();

  useEffect(() => {
    fetchCareers();
  }, [currentUser]);

  const fetchCareers = async () => {
    try {
      const userId = currentUser?.uid || null;
      const data = await careerAPI.exploreCareers(userId);
      setCareers(data.careers || []);
      setStatistics(data.statistics || null);
    } catch (err) {
      setError('Failed to load careers. Please try again.');
      console.error('Error fetching careers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCareers = careers.filter(career =>
    career.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (career.short_description && career.short_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCareers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCareers = filteredCareers.slice(startIndex, endIndex);

  const copyEmailToClipboard = async () => {
    const email = 'moulik.023@gmail.com';
    try {
      await navigator.clipboard.writeText(email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = email;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors pb-6">
      {loading ? (
        <div className="container-custom py-8">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Loader className="h-12 w-12 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
            </div>
            <p className="text-base text-gray-600 dark:text-gray-300 font-semibold">Loading careers...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative py-8 md:py-10 overflow-hidden">
        {/* Aurora Background */}
        <div className="absolute inset-0 aurora-bg opacity-50"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-prism-violet/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-prism-cyan/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

        <div className="container-custom relative z-10">
          <div ref={heroRef.ref} className={`text-center ${heroRef.isVisible ? 'animate-slide-up' : ''}`}>
            <div className="inline-flex items-center justify-center w-16 h-16 bg-prism-gradient rounded-2xl mb-4 shadow-prism-lg">
              <Briefcase className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gray-900 dark:text-white">Explore </span>
              <span className="text-gradient-rainbow">Career Paths</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-6 leading-relaxed">
              Discover career opportunities tailored for Indian students with detailed insights 
              on education, exams, and growth prospects
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search careers or skills..."
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white/90 dark:bg-prism-darker/90 backdrop-blur-xl 
                           border-2 border-gray-200 dark:border-gray-700 
                           text-gray-900 dark:text-white text-lg
                           focus:outline-none focus:ring-4 focus:ring-prism-violet/30 dark:focus:ring-prism-cyan/30
                           focus:border-prism-violet dark:focus:border-prism-cyan
                           shadow-prism-lg transition-all duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      {statistics && (
        <section className="py-6 bg-white/50 dark:bg-prism-darker/50 backdrop-blur-sm">
          <div className="container-custom">
            <div ref={statsRef.ref} className={`grid grid-cols-2 md:grid-cols-4 gap-6 ${statsRef.isVisible ? 'animate-scale-in' : ''}`}>
              <div className="card-3d text-center">
                <Target className="h-10 w-10 text-prism-violet dark:text-prism-cyan mx-auto mb-3" />
                <div className="text-3xl font-black text-gradient mb-2">
                  {statistics.total_careers}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Career Paths</div>
              </div>
              <div className="card-3d text-center">
                <Sparkles className="h-10 w-10 text-prism-indigo dark:text-prism-blue mx-auto mb-3" />
                <div className="text-3xl font-black text-gradient mb-2">
                  {statistics.total_categories}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Categories</div>
              </div>
              <div className="card-3d text-center">
                <Award className="h-10 w-10 text-prism-blue dark:text-prism-cyan mx-auto mb-3" />
                <div className="text-3xl font-black text-gradient mb-2">
                  {statistics.total_exams}+
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Entrance Exams</div>
              </div>
              <div className="card-3d text-center">
                <TrendingUp className="h-10 w-10 text-prism-cyan dark:text-prism-teal mx-auto mb-3" />
                <div className="text-3xl font-black text-gradient mb-2">95%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">Success Rate</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Careers Grid */}
      <section className="py-6 md:py-8">
        <div className="container-custom">
          {error && (
            <div className="mb-8 card bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-200">{error}</p>
              </div>
            </div>
          )}

          {filteredCareers.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No careers found</h3>
              <p className="text-gray-600 dark:text-gray-400">Try adjusting your search terms</p>
            </div>
          ) : (
            <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {paginatedCareers.map((career, idx) => (
                <Link
                  key={career.slug || idx}
                  to={`/career/${career.slug}`}
                  className="card-3d group cursor-pointer block p-5 h-full flex flex-col animate-scale-in"
                >
                  {/* Career Icon */}
                  <div className="w-14 h-14 rounded-xl bg-prism-gradient flex items-center justify-center mb-3 shadow-prism group-hover:scale-110 transition-transform">
                    <Briefcase className="h-7 w-7 text-white" />
                  </div>

                  {/* Match Badge */}
                  {career.match_percentage && (
                    <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-prism-violet/10 dark:bg-prism-cyan/10 border border-prism-violet/20 dark:border-prism-cyan/20 mb-3 self-start">
                      <Target className="h-3 w-3 text-prism-violet dark:text-prism-cyan mr-1" />
                      <span className="text-xs font-bold text-prism-violet dark:text-prism-cyan">
                        {career.match_percentage}% Match
                      </span>
                    </div>
                  )}

                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-prism-violet dark:group-hover:text-prism-cyan transition-colors line-clamp-2">
                    {career.title || 'Career Title'}
                  </h3>

                  {career.short_description ? (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 leading-relaxed flex-grow">
                      {career.short_description}
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-3 line-clamp-2 italic flex-grow">
                      Description coming soon
                    </p>
                  )}

                  {/* Career Details */}
                  {(career.avg_salary || (career.popular_exams && career.popular_exams.length > 0)) && (
                    <div className="space-y-2 mb-4">
                      {career.avg_salary && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <DollarSign className="h-4 w-4 mr-2 text-prism-violet dark:text-prism-cyan flex-shrink-0" />
                          <span className="truncate">{career.avg_salary}</span>
                        </div>
                      )}
                      {career.popular_exams && career.popular_exams.length > 0 && (
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <GraduationCap className="h-4 w-4 mr-2 text-prism-violet dark:text-prism-cyan flex-shrink-0" />
                          <span className="truncate">
                            {career.popular_exams.slice(0, 2).join(', ')}
                            {career.popular_exams.length > 2 && ' +more'}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="flex items-center text-prism-violet dark:text-prism-cyan font-semibold text-sm mt-auto pt-2 group-hover:translate-x-2 transition-transform">
                    Explore Path <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col items-center space-y-4">
                {/* Page Info */}
                <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                  Showing {startIndex + 1} - {Math.min(endIndex, filteredCareers.length)} of {filteredCareers.length} careers
                </div>

                {/* Pagination Buttons */}
                <div className="flex items-center justify-center space-x-2">
                  {/* Previous Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === 1
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-prism-darker text-prism-violet dark:text-prism-cyan hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 border-2 border-prism-violet/20 dark:border-prism-cyan/20 shadow-prism'
                    }`}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>

                  {/* Page Numbers */}
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage = 
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);
                      
                      if (!showPage) {
                        // Show ellipsis
                        if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                          return (
                            <span key={pageNum} className="px-2 text-gray-400 dark:text-gray-600">
                              ...
                            </span>
                          );
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`min-w-[40px] px-4 py-2 rounded-xl font-semibold transition-all ${
                            currentPage === pageNum
                              ? 'bg-prism-gradient text-white shadow-prism-lg scale-105'
                              : 'bg-white dark:bg-prism-darker text-prism-violet dark:text-prism-cyan hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 border-2 border-prism-violet/20 dark:border-prism-cyan/20 shadow-prism'
                          }`}
                          aria-label={`Go to page ${pageNum}`}
                          aria-current={currentPage === pageNum ? 'page' : undefined}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-prism-darker text-prism-violet dark:text-prism-cyan hover:bg-prism-violet/10 dark:hover:bg-prism-cyan/10 border-2 border-prism-violet/20 dark:border-prism-cyan/20 shadow-prism'
                    }`}
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </div>
              </div>
            )}
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      {!currentUser && (
        <section className="py-8 md:py-10 bg-prism-gradient relative overflow-hidden">
          <div className="container-custom relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Find Your Career Path?
            </h2>
            <p className="text-lg text-white/90 mb-6 max-w-2xl mx-auto">
              Take our AI-powered assessment to discover careers that match your interests
            </p>
            <Link to="/signup" className="btn-secondary bg-white text-prism-violet hover:bg-gray-100 text-lg inline-flex items-center">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </section>
      )}

      {/* Career Not Found Section */}
      <section className="py-6 md:py-8">
        <div className="container-custom">
          <div className="card-glass bg-yellow-500/20 dark:bg-yellow-600/20 border-2 border-yellow-400/30 dark:border-yellow-500/30 rounded-xl p-6 max-w-3xl mx-auto">
            <div className="flex items-start space-x-4">
              <AlertCircle className="h-6 w-6 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-yellow-900 dark:text-yellow-200 mb-2">
                  Career Not Found?
                </h3>
                <p className="text-sm md:text-base text-yellow-800 dark:text-yellow-300 mb-3">
                  If a career you're looking for is not in our database, request it and we'll add it! 
                  Email us at <a href="mailto:moulik.023@gmail.com" className="underline font-semibold hover:text-yellow-900 dark:hover:text-yellow-100 transition-colors">moulik.023@gmail.com</a> or use the request feature after assessment.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <button 
                    onClick={copyEmailToClipboard}
                    className="btn-secondary bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600 text-sm py-2 px-4 inline-flex items-center justify-center"
                  >
                    {emailCopied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy my email
                      </>
                    )}
                  </button>
                  {currentUser && (
                    <Link 
                      to="/assessment/results" 
                      className="btn-secondary bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-900 dark:text-yellow-200 border-yellow-600/30 text-sm py-2 px-4 inline-flex items-center justify-center"
                    >
                      Request After Assessment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
        </>
      )}
    </div>
  );
};

export default ExploreCareers;
