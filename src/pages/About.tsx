import React from 'react';

const AboutUs = () => {
  return (
    <div className="p-8 font-sans">
      {/* Section 1: Who We Are (Intro Paragraph) */}
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Who We Are</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Bihar Sanskritik Mandal is a dedicated socio-cultural organization committed to promoting the rich heritage, traditions, and values of Bihar & Purvanchal. With a legacy rooted in unity, creativity, and community upliftment, the Mandal has become a dynamic platform for cultural expression, youth engagement, and social reform. Whether it’s reviving folk arts, organizing grand festivals, or implementing impactful social initiatives — we believe in preserving our roots while shaping a progressive future.
        </p>
      </section>

      {/* Section 2: Mission & Vision */}
      <section className="mb-12 bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Our Mission & Vision</h2>
        <div className="flex flex-col md:flex-row justify-center gap-8">
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Our Mission</h3>
            <p className="text-gray-600">
              To preserve, promote, and propagate the vibrant cultural heritage of Bihar and Purvanchal through folk arts, traditional music, and community festivals, while fostering social harmony and empowering the youth to become custodians of our legacy.
            </p>
          </div>
          <div className="md:w-1/2">
            <h3 className="text-2xl font-bold text-gray-700 mb-2">Our Vision</h3>
            <p className="text-gray-600">
              We envision a world where the timeless wisdom of our traditions inspires a progressive, inclusive, and empowered society, where every individual is connected to their cultural roots and contributes to a shared, harmonious future.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: History of the Mandal */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Our Journey</h2>
        <div className="text-gray-600 max-w-4xl mx-auto space-y-4">
          <p>
            The Bihar Sanskritik Mandal was born from a simple yet profound idea: to create a home away from home for the people of Bihar and Purvanchal. Founded in 1985 by a group of visionaries, the Mandal began as a small community gathering aimed at celebrating festivals like Chhath Puja and Holi with authentic traditions. In an era of rapid urbanization, our founders recognized a growing disconnect between the younger generation and their cultural roots. They sought to bridge this gap by creating a platform for intergenerational dialogue and cultural exchange.
          </p>
          <p>
            The early years were filled with challenges. With limited resources but boundless passion, the founding members organized events in public parks and community halls, relying on word-of-mouth to grow their network. Their unwavering dedication soon attracted artists, scholars, and social leaders who shared their vision. A major milestone was our first large-scale cultural festival in 1992, which brought together over a thousand people and showcased folk artists from rural Bihar, giving them a platform and a voice.
          </p>
          <p>
            Over the decades, the Mandal has evolved from a festival-centric group into a multifaceted socio-cultural organization. We have launched youth empowerment workshops, social reform campaigns addressing issues like dowry and casteism, and digital archives to preserve folk music and literature. Our journey is a testament to the power of community and the enduring spirit of our culture.
          </p>
        </div>
      </section>

      {/* Section 4: Founders & Leaders */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Founders & Leaders</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Leader 1 */}
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-500">Photo</span>
            </div>
            <h4 className="text-xl font-bold text-gray-800">Shri. Anand Kumar Sinha</h4>
            <p className="text-md text-gray-500 font-semibold">Founder & President</p>
            <p className="text-gray-600 mt-2">
              A retired historian and a passionate cultural archivist, Shri. Anand Kumar Sinha laid the foundation of the Mandal. Hailing from a family of freedom fighters in Patna, he brought with him a deep-seated belief in social service and cultural pride. His vision was to create an institution that would not only celebrate festivals but also instill a sense of responsibility towards our heritage in the youth. He has been instrumental in documenting rare folk songs and traditions, ensuring they are preserved for generations to come.
            </p>
          </div>
          {/* Leader 2 */}
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-500">Photo</span>
            </div>
            <h4 className="text-xl font-bold text-gray-800">Smt. Malti Devi</h4>
            <p className="text-md text-gray-500 font-semibold">Co-Founder & Head of Cultural Programs</p>
            <p className="text-gray-600 mt-2">
              A renowned folk singer from the Mithila region, Smt. Malti Devi is the artistic soul of the Mandal. She championed the inclusion of folk arts like Madhubani painting and Sohar music into the Mandal’s core activities. Her efforts have provided a respectable platform for hundreds of female artists from rural backgrounds, empowering them financially and socially. She firmly believes that art is a powerful tool for social change and has led several initiatives that use street plays and folk performances to raise awareness about women’s rights and education.
            </p>
          </div>
          {/* Leader 3 */}
          <div className="text-center">
            <div className="w-32 h-32 rounded-full bg-gray-300 mx-auto mb-4 flex items-center justify-center">
              <span className="text-gray-500">Photo</span>
            </div>
            <h4 className="text-xl font-bold text-gray-800">Mr. Rajesh Singh</h4>
            <p className="text-md text-gray-500 font-semibold">General Secretary & Youth Wing Coordinator</p>
            <p className="text-gray-600 mt-2">
              An engineer by profession and a community organizer by passion, Mr. Rajesh Singh represents the modern, progressive face of the Mandal. He joined as a volunteer a decade ago and quickly rose to a leadership position due to his exceptional organizational skills and ability to connect with the youth. He has spearheaded our digital transformation, launching online workshops and creating a global network of members. His focus is on making heritage relevant to the new generation by blending traditional values with contemporary ideas.
            </p>
          </div>
        </div>
      </section>

      {/* Section 5: Core Values */}
      <section className="mb-12 bg-gray-100 p-8 rounded-lg">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-8">Our Core Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-4">
            <h4 className="font-bold text-xl text-gray-800 mb-2">Unity (एकता)</h4>
            <p className="text-gray-600">We believe in the power of community. Our strength lies in bringing people together, transcending barriers of caste and creed to foster a sense of shared identity and purpose.</p>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-xl text-gray-800 mb-2">Heritage (विरासत)</h4>
            <p className="text-gray-600">We are dedicated to preserving and promoting the rich tapestry of our cultural heritage, ensuring that our traditions, arts, and stories are passed down to future generations.</p>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-xl text-gray-800 mb-2">Integrity (सत्यनिष्ठा)</h4>
            <p className="text-gray-600">We operate with transparency, honesty, and a deep sense of responsibility in all our endeavors, earning the trust of our community and partners.</p>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-xl text-gray-800 mb-2">Creativity (रचनात्मकता)</h4>
            <p className="text-gray-600">We encourage innovation in cultural expression, blending traditional forms with contemporary ideas to keep our heritage alive, relevant, and engaging for all ages.</p>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-xl text-gray-800 mb-2">Youth Empowerment (युवा शक्ति)</h4>
            <p className="text-gray-600">We are committed to nurturing the next generation of leaders, providing them with the skills, confidence, and cultural grounding to shape a better future.</p>
          </div>
          <div className="p-4">
            <h4 className="font-bold text-xl text-gray-800 mb-2">Service (सेवा)</h4>
            <p className="text-gray-600">Rooted in the spirit of ‘Seva,’ we strive to serve our society through meaningful social initiatives that uplift the underprivileged and create a positive impact.</p>
          </div>
        </div>
      </section>

      {/* Section 6: Recognitions or Awards */}
      <section className="mb-12">
        <h2 className="text-3xl font-semibold text-center text-gray-800 mb-6">Recognitions & Awards</h2>
        <ul className="list-disc list-inside max-w-2xl mx-auto text-gray-600 space-y-2">
          <li>
            <strong>Sanskriti Ratna Award (2021):</strong> Awarded by the National Council for Cultural Arts for our outstanding contribution to the preservation and promotion of Bihari folk music and arts.
          </li>
          <li>
            <strong>Community Excellence Honor (2019):</strong> Recognized by the State Government of Bihar for our impactful social initiatives in rural development and youth empowerment programs.
          </li>
          <li>
            <strong>Purvanchal Gaurav Samman (2017):</strong> Honored by the Purvanchal Lok Manch for fostering cultural unity and organizing the largest annual multi-state cultural festival.
          </li>
        </ul>
      </section>

      {/* Section 7: Header Tagline Suggestions */}
      <section className="text-center bg-orange-600 text-white p-8 rounded-lg">
        <h2 className="text-3xl font-semibold mb-4">Header Tagline Suggestions</h2>
        <div className="space-y-2 text-lg">
          <p>1. "Our Heritage, Our Future: Uniting Generations Through Culture."</p>
          <p>2. "The Soul of Bihar, The Heart of Community."</p>
          <p>3. "Celebrating Roots, Inspiring Futures."</p>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;

