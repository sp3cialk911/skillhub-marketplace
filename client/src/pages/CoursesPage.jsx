import React, { useState, useEffect } from 'react';
import { coursesAPI } from '../services/api';
import toast from 'react-hot-toast';

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await coursesAPI.getCourses({
        level: selectedLevel,
        limit: 20
      });
      setCourses(response.data.courses);
    } catch (error) {
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Courses</h1>
          <div className="flex gap-4">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            >
              <option value="">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading courses...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
              >
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-500"></div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold bg-purple-100 text-purple-800 px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                    <span className="text-sm text-gray-500">{course.students_count} students</span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-purple-600">${course.price}</span>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition">
                      Enroll
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;
