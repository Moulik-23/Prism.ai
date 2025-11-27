import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll-based animations using Intersection Observer
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Threshold for triggering (0-1)
 * @param {string} options.rootMargin - Root margin for observer
 * @param {string} options.animationClass - CSS class to apply when visible
 * @returns {Object} - { ref, isVisible }
 */
export const useScrollAnimation = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '0px 0px -100px 0px',
    animationClass = 'animate-slide-up',
  } = options;

  const [isVisible, setIsVisible] = useState(true); // Start visible to prevent blank content
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally stop observing after first trigger
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  return { ref, isVisible, animationClass };
};

/**
 * Hook for staggered animations (multiple elements)
 */
export const useStaggeredAnimation = (count, delay = 100) => {
  const refs = useRef([]);
  const [visibleIndices, setVisibleIndices] = useState(new Set());

  useEffect(() => {
    const observers = refs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleIndices((prev) => new Set([...prev, index]));
            observer.unobserve(ref);
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach((observer) => {
        if (observer) {
          refs.current.forEach((ref) => {
            if (ref) observer.unobserve(ref);
          });
        }
      });
    };
  }, [count]);

  const getRef = (index) => (el) => {
    refs.current[index] = el;
  };

  const getAnimationStyle = (index) => {
    const isVisible = visibleIndices.has(index);
    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
      transition: `opacity 0.6s ease ${index * delay}ms, transform 0.6s ease ${index * delay}ms`,
    };
  };

  return { getRef, getAnimationStyle, visibleIndices };
};

