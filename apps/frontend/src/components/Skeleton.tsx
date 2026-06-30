import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  type?: 'text' | 'avatar' | 'title' | 'thumbnail';
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ type = 'text', className = '' }) => {
  const classes = `${styles.skeleton} ${styles[type]} ${className}`;
  return <div className={classes} aria-hidden="true" />;
};
