import React, { useState, useEffect } from 'react';
import { skillsAPI } from '../services/api';
import toast from 'react-hot-toast';

const SkillsMarketplace = () => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    fetchSkills();
  }, [location, category]);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      const response = await skillsAPI.getSkills({
        location,
        category,
        limit: 20
      });
      setSkills(response.data.skills);
    } catch (error) {
      toast.error('Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Local Skills Marketplace</h1>
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="City or location..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            />
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
            >
              <option value="">All Categories</option>
              <option value="tutoring">Tutoring</option>
              <option value="fitness">Fitness</option>
              <option value="design">Design</option>
              <option value="tech">Tech</option>
              <option value="music">Music</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading skills...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {skills.map((skill) => (
              <div
                key={skill.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="h-32 bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-4xl">
                  👤
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-lg mb-1">{skill.first_name} {skill.last_name}</h3>
                  <p className="text-blue-600 font-semibold mb-3">{skill.skill_name}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{skill.description}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-bold text-pink-600">${skill.hourly_rate}/hr</span>
                    <span className="text-sm text-gray-500">{skill.location}</span>
                  </div>
                  <button className="w-full px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition">
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsMarketplace;
