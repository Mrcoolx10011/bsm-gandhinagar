import React from 'react';
import { HeroSection } from '../components/home/HeroSection';
import { AboutUsPreview } from '../components/home/AboutUsPreview';
import { LatestUpdates } from '../components/home/LatestUpdates';
import { FeaturedEvents } from '../components/home/FeaturedEvents';
import { MessageSection } from '../components/home/MessageSection';
import { MembershipSection } from '../components/home/MembershipSection';
import { StatsSection } from '../components/home/StatsSection';
import { CallToAction } from '../components/home/CallToAction';

export const Home: React.FC = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <AboutUsPreview />
      <LatestUpdates />
      <StatsSection />
      <FeaturedEvents />
      <MessageSection />
      <MembershipSection />
      <CallToAction />
    </div>
  );
};