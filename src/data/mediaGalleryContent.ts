export const mediaGalleryContent = {
  hero: {
    title: "Media Gallery",
    subtitle: "संस्कृति की झलकियां | Glimpses of Our Cultural Heritage",
    description: "Explore our vibrant collection of photos, videos, and press coverage showcasing Bihar's rich cultural traditions and our community impact."
  },

  photos: {
    intro: "Our photo gallery captures the essence of Bihar's cultural heritage through vibrant festivals, traditional performances, and community service initiatives. Each image tells a story of tradition, unity, and progress.",
    
    albums: [
      {
        id: "annual-festival",
        title: "Annual Cultural Festival",
        description: "Traditional performances, stage decor, and vibrant crowds celebrating Bihar's heritage.",
        imageKeyword: "Indian festival celebration",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
        photoCount: 45,
        category: "Festivals"
      },
      {
        id: "folk-dance",
        title: "Folk Art & Dance Performances",
        description: "Live stage shows featuring regional Bhojpuri and Maithili dance traditions.",
        imageKeyword: "folk dance India",
        imageUrl: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=800&q=80",
        photoCount: 32,
        category: "Performances"
      },
      {
        id: "youth-workshops",
        title: "Youth Empowerment Workshops",
        description: "Students learning, speaking, and collaborating in skill development programs.",
        imageKeyword: "youth workshop India",
        imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80",
        photoCount: 28,
        category: "Education"
      },
      {
        id: "community-outreach",
        title: "Community Outreach",
        description: "Medical camps, food distribution, and social aid drives serving local communities.",
        imageKeyword: "community service India",
        imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=800&q=80",
        photoCount: 38,
        category: "Social Service"
      },
      {
        id: "behind-scenes",
        title: "Behind the Scenes",
        description: "Volunteers and organizers planning events and coordinating cultural programs.",
        imageKeyword: "event preparation team",
        imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=800&q=80",
        photoCount: 22,
        category: "Organization"
      },
      {
        id: "traditional-rituals",
        title: "Traditional Rituals",
        description: "Puja ceremonies, heritage customs, and authentic village traditions.",
        imageKeyword: "Indian rituals village",
        imageUrl: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80",
        photoCount: 35,
        category: "Rituals"
      }
    ]
  },

  videos: {
    intro: "Our video collection brings Bihar's cultural vibrancy to life through performances, interviews, and documentaries. Experience the energy, passion, and dedication that drives our cultural preservation mission.",
    
    categories: [
      {
        id: "performances",
        title: "Cultural Performances",
        description: "Full folk shows from stage to street showcasing traditional Bihar art forms.",
        duration: "2-5 min highlights",
        videoCount: 12,
        thumbnail: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=400&q=80",
        features: ["HD Quality", "Multi-angle shots", "Traditional music"]
      },
      {
        id: "interviews",
        title: "Artist & Leader Interviews",
        description: "Candid conversations with founders, artists, and youth leaders sharing their stories.",
        duration: "10-15 min",
        videoCount: 8,
        thumbnail: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=400&q=80",
        features: ["Personal stories", "Cultural insights", "Subtitles available"]
      },
      {
        id: "festival-highlights",
        title: "Festival Highlights",
        description: "Fast-paced edits from key events featuring music, lights, and celebration.",
        duration: "1-2 min",
        videoCount: 15,
        thumbnail: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=400&q=80",
        features: ["Quick cuts", "Energetic music", "Event coverage"]
      },
      {
        id: "workshops",
        title: "Workshops & Training",
        description: "Hands-on educational sessions showing youth learning traditional arts and skills.",
        duration: "5-8 min",
        videoCount: 10,
        thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=400&q=80",
        features: ["Educational content", "Step-by-step learning", "Community focus"]
      },
      {
        id: "documentaries",
        title: "Mini Documentaries",
        description: "Cultural storytelling focused on reviving lost traditions and preserving heritage.",
        duration: "8-12 min",
        videoCount: 6,
        thumbnail: "https://images.unsplash.com/photo-1524863479829-916d8e77f114?auto=format&fit=crop&w=400&q=80",
        features: ["Professional narration", "Historical context", "Community impact"]
      }
    ]
  },

  pressCoverage: {
    intro: "Our cultural initiatives and community work have gained recognition from leading media outlets across Bihar and India. These press features highlight our impact in preserving traditional arts while empowering local communities.",
    
    articles: [
      {
        id: "hindustan-times-2024",
        publication: "Hindustan Times",
        title: "Bihar Sanskritik Mandal Hosts Grand Folk Revival Event",
        date: "January 2024",
        summary: "A celebration of Bhojpuri and Maithili dance attended by over 2,000 people.",
        category: "Cultural Events",
        readTime: "3 min read",
        featured: true
      },
      {
        id: "dainik-jagran-2024",
        publication: "Dainik Jagran",
        title: "Youth Join Hands for Culture & Cleanliness Drive",
        date: "March 2024",
        summary: "Local youth from Patna & Arrah led a social cleanliness and awareness campaign.",
        category: "Social Service",
        readTime: "2 min read",
        featured: false
      },
      {
        id: "hindu-metroplus-2023",
        publication: "The Hindu (MetroPlus)",
        title: "Reviving Traditional Puppetry in Rural Bihar",
        date: "July 2023",
        summary: "Highlights the Mandal's effort to bring back shadow puppetry among children in small villages.",
        category: "Cultural Revival",
        readTime: "4 min read",
        featured: true
      },
      {
        id: "times-india-2023",
        publication: "Times of India",
        title: "Bihar Cultural Group Wins State Recognition for Heritage Work",
        date: "December 2023",
        summary: "Bihar Sanskritik Mandal receives official recognition for outstanding cultural preservation efforts.",
        category: "Awards",
        readTime: "3 min read",
        featured: false
      }
    ]
  },

  statistics: {
    totalPhotos: 200,
    totalVideos: 51,
    pressFeatures: 15,
    yearsActive: 8
  }
};
