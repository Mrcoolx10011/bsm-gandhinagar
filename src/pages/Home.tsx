import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { MissionSection } from '../components/home/MissionSection';
import { StatsSection } from '../components/home/StatsSection';
import { FeaturedEvents } from '../components/home/FeaturedEvents';
import { TestimonialsSection } from '../components/home/TestimonialsSection';
import { CallToAction } from '../components/home/CallToAction';

export const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <MissionSection />
      <StatsSection />
      <FeaturedEvents />
      <TestimonialsSection />
      <CallToAction />
    </div>
  );
};