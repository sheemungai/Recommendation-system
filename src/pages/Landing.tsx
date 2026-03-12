import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap, BookOpen, ClipboardList, Calculator,
  Briefcase, ArrowRight, CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: BookOpen,
    title: 'Enter KCSE Grades',
    desc: 'Input your KCSE results for all subjects and get instant grade statistics.',
    color: 'bg-blue-100 text-blue-600',
  },
  {
    icon: ClipboardList,
    title: 'Psychometric Assessment',
    desc: 'Discover your personality type using the RIASEC model and Big Five traits.',
    color: 'bg-purple-100 text-purple-600',
  },
  {
    icon: Calculator,
    title: 'Cluster Point Calculator',
    desc: 'Automatically calculate your cluster points for university admission.',
    color: 'bg-green-100 text-green-600',
  },
  {
    icon: Briefcase,
    title: 'Career Pathway Matching',
    desc: 'Explore matched career paths and courses that align with your results.',
    color: 'bg-amber-100 text-amber-600',
  },
];

const steps = [
  'Create your free account',
  'Enter your KCSE grades',
  'Complete the psychometric test',
  'Get personalised career recommendations',
];

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/90 backdrop-blur z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">
              CareerPath <span className="text-primary-600">Kenya</span>
            </span>
          </Link>
          <div className="flex items-center space-x-3">
            <Link to="/login" className="btn-secondary text-sm px-4 py-2">
              Log In
            </Link>
            <Link to="/register" className="btn-primary text-sm px-4 py-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <span className="inline-flex items-center bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-5">
            🎓 For KCSE Students in Kenya
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Discover Your Perfect
            <br />
            <span className="text-yellow-300">Career Path</span>
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-2xl mx-auto mb-10">
            Combine your KCSE grades, personality insights, and cluster points to unlock
            tailored university courses and career recommendations—completely free.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              <span>Start for Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <span>Already have an account?</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Everything you need in one place</h2>
          <p className="text-gray-500 max-w-xl mx-auto">
            Our platform combines academic results, psychometric testing, and local university data
            to help you make informed choices.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }) => (
            <div
              key={title}
              className="card hover:shadow-md transition-shadow group"
            >
              <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">How it works</h2>
          <p className="text-gray-500 mb-10">Get started in 4 simple steps</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {steps.map((step, i) => (
              <div key={step} className="flex items-start space-x-4 bg-white p-5 rounded-xl border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {i + 1}
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700 font-medium">{step}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10">
            <Link to="/register" className="btn-primary inline-flex items-center space-x-2 px-8 py-3 text-base">
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} CareerPath Kenya. Empowering students to discover their future.</p>
      </footer>
    </div>
  );
};

export default Landing;
