import React from 'react';
import Lottie from 'lottie-react';
import loadingAnimation from '@/assets/loading.lottie';

interface LoadingAnimationProps {
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  message?: string;
}

const LoadingAnimation: React.FC<LoadingAnimationProps> = ({
  fullScreen = true,
  size = 'md',
  message = 'Loading...',
}) => {
  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-40 w-40',
    lg: 'h-56 w-56',
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={sizeClasses[size]}>
        <Lottie
          animationData={loadingAnimation}
          loop
          autoplay
        />
      </div>
      {message && (
        <p className="text-center text-muted-foreground text-sm font-medium">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};

export default LoadingAnimation;
