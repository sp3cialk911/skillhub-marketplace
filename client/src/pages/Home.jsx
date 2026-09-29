import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
            Learn. Create. Exchange Skills.
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            The unified marketplace for digital products, online courses, and local skill exchange. All in one place.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              to="/register"
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Get Started
            </Link>
            <Link
              to="/marketplace"
              className="px-8 py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose SkillHub?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🛍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Products</h3>
              <p className="text-gray-600">
                Sell and buy digital products with built-in licensing, bundle creation, and automatic updates.
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Online Courses</h3>
              <p className="text-gray-600">
                Create and enroll in courses with video, quizzes, and automated certificates of completion.
              </p>
            </div>

            <div className="p-8 border border-gray-200 rounded-xl hover:shadow-lg transition">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-3">Local Skills</h3>
              <p className="text-gray-600">
                Exchange skills with local community. Get tutoring, services, and mentorship from experts nearby.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10K+</div>
              <p>Products & Courses</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">50K+</div>
              <p>Active Users</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$5M+</div>
              <p>Transactions</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <p>Cities</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to start?</h2>
        <p className="text-xl text-gray-600 mb-8">Join thousands of sellers, instructors, and skill traders on SkillHub.</p>
        <Link
          to="/register"
          className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition inline-block"
        >
          Create Free Account
        </Link>
      </section>
    </div>
  );
};

export default Home;
