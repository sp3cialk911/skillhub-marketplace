import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white font-bold mb-4">SkillHub</h3>
            <p className="text-sm">Unified marketplace for digital products, courses, and local skill exchange.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Products</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Digital Products</a></li>
              <li><a href="#" className="hover:text-white">Browse Marketplace</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Learning</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Courses</a></li>
              <li><a href="#" className="hover:text-white">Instructors</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Community</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white">Local Skills</a></li>
              <li><a href="#" className="hover:text-white">Find Experts</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2024 SkillHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
