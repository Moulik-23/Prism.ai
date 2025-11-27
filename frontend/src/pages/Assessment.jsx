import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Send, Loader, CheckCircle, Brain, Target } from 'lucide-react';
import { assessmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useScrollAnimation } from '../hooks/useScrollAnimation';

const Assessment = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const heroRef = useScrollAnimation();

  useEffect(() => {
    fetchQuestions();
    
    // Load saved answers from localStorage if available
    if (currentUser?.uid) {
      const savedAnswers = localStorage.getItem(`assessment_answers_${currentUser.uid}`);
      const savedStep = localStorage.getItem(`assessment_step_${currentUser.uid}`);
      
      if (savedAnswers) {
        try {
          setAnswers(JSON.parse(savedAnswers));
        } catch (e) {
          console.error('Error loading saved answers:', e);
        }
      }
      
      if (savedStep) {
        try {
          const step = parseInt(savedStep, 10);
          if (!isNaN(step) && step >= 0) {
            setCurrentStep(step);
          }
        } catch (e) {
          console.error('Error loading saved step:', e);
        }
      }
    }
  }, [currentUser?.uid]);

  const fetchQuestions = async () => {
    try {
      const data = await assessmentAPI.getQuestions();
      setQuestions(data.questions);
      setLoading(false);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
      setLoading(false);
    }
  };

  const handleAnswer = (questionId, value) => {
    const updatedAnswers = {
      ...answers,
      [questionId]: value
    };
    
    setAnswers(updatedAnswers);
    setError('');
    
    // Save answers to localStorage immediately
    if (currentUser?.uid) {
      localStorage.setItem(`assessment_answers_${currentUser.uid}`, JSON.stringify(updatedAnswers));
    }
  };

  const handleNext = () => {
    if (currentStep < questions.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Save current step to localStorage
      if (currentUser?.uid) {
        localStorage.setItem(`assessment_step_${currentUser.uid}`, nextStep.toString());
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // Save current step to localStorage
      if (currentUser?.uid) {
        localStorage.setItem(`assessment_step_${currentUser.uid}`, prevStep.toString());
      }
    }
  };

  const handleSubmit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length > 0) {
      setError(`Please answer all questions. ${unanswered.length} remaining.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const formattedAnswers = questions.map(q => ({
        question_id: q.id,
        question: q.question,
        answer: Array.isArray(answers[q.id]) 
          ? answers[q.id].join(', ') 
          : answers[q.id]
      }));

      const userProfile = {
        email: currentUser.email,
        displayName: currentUser.displayName || currentUser.email.split('@')[0]
      };

      const result = await assessmentAPI.submitAssessment(
        currentUser.uid,
        formattedAnswers,
        userProfile
      );

      // Save results to localStorage for persistence
      localStorage.setItem(`assessment_results_${currentUser.uid}`, JSON.stringify(result));
      localStorage.setItem(`assessment_timestamp_${currentUser.uid}`, Date.now().toString());
      
      // Clear saved answers and step since assessment is complete
      localStorage.removeItem(`assessment_answers_${currentUser.uid}`);
      localStorage.removeItem(`assessment_step_${currentUser.uid}`);

      navigate('/assessment/results', { state: { results: result } });
    } catch (err) {
      setError('Failed to submit assessment. Please try again.');
      setSubmitting(false);
    }
  };

  const renderQuestion = (question) => {
    const currentAnswer = answers[question.id];

    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={currentAnswer || ''}
            onChange={(e) => handleAnswer(question.id, e.target.value)}
            className="input-field min-h-[150px] resize-none text-lg"
            placeholder="Share your thoughts..."
          />
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleAnswer(question.id, option)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                  currentAnswer === option
                    ? 'bg-prism-gradient text-white shadow-prism-lg transform scale-105'
                    : 'bg-white dark:bg-prism-darker border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-prism-violet dark:hover:border-prism-cyan hover:shadow-lg'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{option}</span>
                  {currentAnswer === option && (
                    <CheckCircle className="h-5 w-5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        );

      case 'multiple_choice':
        const selectedOptions = Array.isArray(currentAnswer) ? currentAnswer : [];
        return (
          <div className="space-y-3">
            {question.options?.map((option, idx) => {
              const isSelected = selectedOptions.includes(option);
              return (
                <button
                  key={idx}
                  onClick={() => {
                    const newSelection = isSelected
                      ? selectedOptions.filter(o => o !== option)
                      : [...selectedOptions, option];
                    handleAnswer(question.id, newSelection);
                  }}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${
                    isSelected
                      ? 'bg-prism-gradient text-white shadow-prism-lg transform scale-105'
                      : 'bg-white dark:bg-prism-darker border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white hover:border-prism-violet dark:hover:border-prism-cyan hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{option}</span>
                    {isSelected && (
                      <CheckCircle className="h-5 w-5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );

      default:
        return null;
    }
  };

  const progress = questions.length > 0 ? ((currentStep + 1) / questions.length) * 100 : 0;
  const answeredCount = Object.keys(answers).length;

  if (loading) {
    return (
      <div className="bg-prism-light dark:bg-prism-dark py-12">
        <div className="container-custom">
          <div className="text-center py-8">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Loader className="h-16 w-16 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 font-semibold">Loading assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="bg-prism-light dark:bg-prism-dark py-12">
        <div className="container-custom">
          <div className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300">No questions available</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentStep];

  return (
    <div className="bg-prism-light dark:bg-prism-dark transition-colors pb-6">
      {loading ? (
        <div className="container-custom py-8">
          <div className="text-center">
            <div className="relative w-12 h-12 mx-auto mb-3">
              <div className="absolute inset-0 bg-prism-gradient rounded-full animate-pulse blur-xl opacity-50"></div>
              <Loader className="h-12 w-12 text-prism-violet dark:text-prism-cyan animate-spin relative z-10" />
            </div>
            <p className="text-base text-gray-600 dark:text-gray-300 font-semibold">Loading assessment...</p>
          </div>
        </div>
      ) : questions.length === 0 ? (
        <div className="container-custom py-8">
          <div className="text-center card-3d max-w-md mx-auto">
            <AlertCircle className="h-16 w-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-600 dark:text-gray-300 font-semibold">No questions available</p>
          </div>
        </div>
      ) : (
        <>
          {/* Hero Section */}
          <section className="relative py-8 overflow-hidden">
            <div className="absolute inset-0 aurora-bg opacity-50"></div>
            <div className="container-custom relative z-10">
              <div ref={heroRef.ref} className={`text-center ${heroRef.isVisible ? 'animate-slide-up' : ''}`}>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-prism-gradient rounded-2xl mb-6 shadow-prism-lg">
              <Brain className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black mb-4">
              <span className="text-gray-900 dark:text-white">Career </span>
              <span className="text-gradient-rainbow">Assessment</span>
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Answer these questions to discover careers that match your interests and skills
            </p>
          </div>
        </div>
      </section>

      {/* Progress Bar */}
      <div className="container-custom mb-8">
        <div className="card-glass">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Target className="h-6 w-6 text-prism-violet dark:text-prism-cyan" />
              <span className="font-semibold text-gray-900 dark:text-white">
                Question {currentStep + 1} of {questions.length}
              </span>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {answeredCount} / {questions.length} answered
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-prism-gradient transition-all duration-500 ease-out rounded-full shadow-prism"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Question Card */}
      <div className="container-custom mb-8">
        <div className="card-3d animate-scale-in">
          {/* Question Number Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-prism-violet/10 dark:bg-prism-cyan/10 border border-prism-violet/20 dark:border-prism-cyan/20 mb-6">
            <span className="text-sm font-bold text-prism-violet dark:text-prism-cyan">
              Question {currentStep + 1}
            </span>
          </div>

          {/* Question */}
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
            {currentQuestion?.question}
          </h2>

          {/* Answer Options */}
          <div className="mb-8">
            {renderQuestion(currentQuestion)}
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-800 dark:text-red-200 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className={`btn-secondary flex items-center ${
                currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Previous
            </button>

            {currentStep === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting || !answers[currentQuestion.id]}
                className={`btn-primary flex items-center ${
                  submitting || !answers[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {submitting ? (
                  <>
                    <Loader className="h-5 w-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5 mr-2" />
                    Submit Assessment
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!answers[currentQuestion.id]}
                className={`btn-primary flex items-center ${
                  !answers[currentQuestion.id] ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Next
                <ChevronRight className="h-5 w-5 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question Indicators */}
      <div className="container-custom mb-6">
        <div className="card-glass">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Question Progress
          </p>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentStep;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    setCurrentStep(idx);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                    isCurrent
                      ? 'bg-prism-gradient text-white shadow-prism-lg scale-110'
                      : isAnswered
                      ? 'bg-prism-violet/20 dark:bg-prism-cyan/20 text-prism-violet dark:text-prism-cyan border-2 border-prism-violet/30 dark:border-prism-cyan/30'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default Assessment;
