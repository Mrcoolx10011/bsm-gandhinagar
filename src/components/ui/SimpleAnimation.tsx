import React from 'react';

interface SimpleAnimationProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  type?: 'fadeIn' | 'slideUp' | 'slideDown' | 'slideLeft' | 'slideRight' | 'scale';
  duration?: number;
  delay?: number;
}

export const SimpleAnimation: React.FC<SimpleAnimationProps> = ({
  children,
  type = 'fadeIn',
  duration = 500,
  delay = 0,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [delay]);

  const getAnimationClass = () => {
    const baseClass = `transition-all duration-${duration} ease-out`;
    
    if (!isVisible) {
      switch (type) {
        case 'slideUp':
          return `${baseClass} opacity-0 translate-y-8`;
        case 'slideDown':
          return `${baseClass} opacity-0 -translate-y-8`;
        case 'slideLeft':
          return `${baseClass} opacity-0 translate-x-8`;
        case 'slideRight':
          return `${baseClass} opacity-0 -translate-x-8`;
        case 'scale':
          return `${baseClass} opacity-0 scale-95`;
        default:
          return `${baseClass} opacity-0`;
      }
    }

    return `${baseClass} opacity-100 translate-y-0 translate-x-0 scale-100`;
  };

  return (
    <div className={`${getAnimationClass()} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default SimpleAnimation;
