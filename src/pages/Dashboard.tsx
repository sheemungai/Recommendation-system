import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, ClipboardList, Calculator, Briefcase,
  ArrowRight, AlertTriangle, User,
  TrendingUp, Sparkles, ChevronRight, Clock,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { getMyGrades } from '../api/students';
import { getProgress } from '../api/assessment';
import { 
  generateRecommendations, 
  getRecommendations,
  checkRecommendationsStatus 
} from '../api/recommendations';
import type { GradesResponse, PsychometricProgress, RecommendationsResponse } from '../types';

const quickLinks = [
  {
    to: '/grades',
    icon: BookOpen,
    label: 'Enter Grades',
    desc: 'Add or update your KCSE subject grades',
    color: 'bg-blue-600',
  },
  {
    to: '/assessment',
    icon: ClipboardList,
    label: 'Psychometric Test',
    desc: 'Complete the RIASEC & Big Five assessment',
    color: 'bg-purple-600',
  },
  {
    to: '/calculator',
    icon: Calculator,
    label: 'Cluster Points',
    desc: 'Calculate your university cluster points',
    color: 'bg-green-600',
  },
  {
    to: '/careers',
    icon: Briefcase,
    label: 'Career Paths',
    desc: 'Explore matching career pathways',
    color: 'bg-amber-500',
  },
];

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [progress, setProgress] = useState<PsychometricProgress | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(null);
  const [recommendationsStatus, setRecommendationsStatus] = useState<{
    exists: boolean;
    lastGenerated?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [g, p, recStatus] = await Promise.allSettled([
        getMyGrades(),
        getProgress(),
        checkRecommendationsStatus()
      ]);
      
      if (g.status === 'fulfilled') setGradesData(g.value);
      if (p.status === 'fulfilled') setProgress(p.value);
      if (recStatus.status === 'fulfilled') {
        setRecommendationsStatus(recStatus.value);
        
        // If recommendations exist, fetch them
        if (recStatus.value.exists) {
          const recs = await getRecommendations({ limit: 3 });
          setRecommendations(recs);
        }
      }

      // Auto-generate recommendations if prerequisites are met
      const hasGrades = g.status === 'fulfilled' && g.value?.data?.length > 0;
      const hasPsychometric = p.status === 'fulfilled' && p.value?.is_complete;
      const hasRecs = recStatus.status === 'fulfilled' && recStatus.value?.exists;

      if (hasGrades && hasPsychometric && !hasRecs) {
        // Auto-generate recommendations
        handleGenerateRecommendations(false);
      }

    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRecommendations = async (includeCluster: boolean = false) => {
    setGenerating(true);
    setError(null);
    try {
      const results = await generateRecommendations(includeCluster);
      setRecommendations(results);
      setRecommendationsStatus({ exists: true, lastGenerated: new Date().toISOString() });
      
      // Show success message (you can add a toast notification here)
      console.log('Recommendations generated successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to generate recommendations');
    } finally {
      setGenerating(false);
    }
  };

  const handleViewAllRecommendations = () => {
    window.location.href = '/recommendations';
  };

  const firstName = user?.first_name || user?.username || 'Student';

  // Check if prerequisites are met
  const hasGrades = gradesData?.data?.length ? gradesData.data.length > 0 : false;
  const hasPsychometric = progress?.is_complete || false;
  const prerequisitesMet = hasGrades && hasPsychometric;
  const hasRecommendations = recommendationsStatus?.exists || false;

  if (loading) return <Layout><LoadingSpinner fullPage text="Loading dashboard…" /></Layout>;

  return (
    <Layout>
      <PageHeader
        title={`Welcome back, ${firstName}! 👋`}
        subtitle="Here's an overview of your career guidance progress."
      />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Subjects Entered"
          value={gradesData?.data?.length ?? 0}
          subtitle="KCSE subjects"
          icon={<BookOpen className="w-5 h-5" />}
          color="blue"
        />
        <StatCard
          title="Mean Grade"
          value={gradesData?.statistics?.mean_grade || '–'}
          subtitle="Average performance"
          icon={<User className="w-5 h-5" />}
          color="green"
        />
        <StatCard
          title="Assessment"
          value={progress ? `${progress.percentage}%` : '0%'}
          subtitle={progress?.is_complete ? 'Completed' : 'In progress'}
          icon={<ClipboardList className="w-5 h-5" />}
          color={progress?.is_complete ? 'green' : 'amber'}
        />
        <StatCard
          title="Recommendations"
          value={hasRecommendations ? 'Ready' : 'Pending'}
          subtitle={hasRecommendations ? 'View your matches' : 'Complete profile'}
          icon={<TrendingUp className="w-5 h-5" />}
          color={hasRecommendations ? 'purple' : 'red'}
        />
      </div>

      {/* Error message if any */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl px-5 py-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Action banners */}
      <div className="space-y-3 mb-8">
        {!hasGrades && (
          <div className="flex items-start sm:items-center space-x-3 bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex-col sm:flex-row gap-3 sm:gap-0">
            <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-800">You haven't entered any KCSE grades yet.</p>
              <p className="text-xs text-blue-600 mt-0.5">Add your grades to get personalised recommendations.</p>
            </div>
            <Link to="/grades" className="btn-primary text-sm px-4 py-1.5 whitespace-nowrap">
              Add Grades
            </Link>
          </div>
        )}
        
        {progress && !progress.is_complete && (
          <div className="flex items-start sm:items-center space-x-3 bg-purple-50 border border-purple-200 rounded-xl px-5 py-4 flex-col sm:flex-row gap-3 sm:gap-0">
            <ClipboardList className="w-5 h-5 text-purple-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-800">
                Your psychometric assessment is {progress.percentage}% complete.
              </p>
              <p className="text-xs text-purple-600 mt-0.5">
                {progress.answered}/{progress.total_questions} questions answered.
              </p>
            </div>
            <Link to="/assessment" className="btn-primary text-sm px-4 py-1.5 whitespace-nowrap" style={{ background: '#7c3aed' }}>
              Continue
            </Link>
          </div>
        )}

        {/* Recommendations Status Banner */}
        {prerequisitesMet && !hasRecommendations && !generating && (
          <div className="flex items-start sm:items-center space-x-3 bg-green-50 border border-green-200 rounded-xl px-5 py-4 flex-col sm:flex-row gap-3 sm:gap-0">
            <Sparkles className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                You're all set! Ready to get personalized career recommendations.
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                Based on your grades and personality assessment.
              </p>
            </div>
            <button
              onClick={() => handleGenerateRecommendations(true)}
              className="bg-green-600 text-white text-sm px-4 py-1.5 rounded-lg hover:bg-green-700 whitespace-nowrap"
            >
              Get Recommendations
            </button>
          </div>
        )}

        {/* Generating Recommendations */}
        {generating && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <p className="text-sm text-indigo-700 font-medium">
                Analyzing your profile and generating recommendations...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recommendations Preview */}
      {recommendations && recommendations.recommended_courses && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Personalized Recommendations</h2>
            <button
              onClick={handleViewAllRecommendations}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>

          {/* Profile Summary */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-4">
            <div className="flex flex-wrap gap-4">
              <div>
                <span className="text-xs text-gray-500 block">Top Personality</span>
                <span className="font-medium text-indigo-700">
                  {recommendations.student_profile.top_riasec_categories.slice(0, 2).join(', ')}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Mean Grade</span>
                <span className="font-medium text-green-700">
                  {gradesData?.statistics?.mean_grade || recommendations.student_profile.avg_grade}
                </span>
              </div>
              <div>
                <span className="text-xs text-gray-500 block">Strong Subjects</span>
                <span className="font-medium text-purple-700">
                  {recommendations.student_profile.strong_subjects.slice(0, 3).join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Top 3 Courses Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.recommended_courses.slice(0, 3).map((course) => (
              <Link
                key={course.course_id}
                to={`/courses/${course.course_id}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 line-clamp-1">{course.course_name}</h3>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                    {Math.round(course.score * 100)}% match
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                  {course.match_reasons.slice(0, 2).join(' • ')}
                </p>
                <div className="flex items-center text-indigo-600 text-xs font-medium">
                  <span>View details</span>
                  <ArrowRight className="w-3 h-3 ml-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickLinks.map(({ to, icon: Icon, label, desc, color }) => (
          <Link
            key={to}
            to={to}
            className="card hover:shadow-md transition-all group border border-gray-200 hover:border-primary-300"
          >
            <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-700 transition-colors">
              {label}
            </h3>
            <p className="text-xs text-gray-500 mb-3">{desc}</p>
            <div className="flex items-center text-primary-600 text-xs font-medium">
              <span>Go there</span>
              <ArrowRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>

      {/* Last generated timestamp */}
      {recommendationsStatus?.lastGenerated && (
        <div className="mt-6 text-xs text-gray-400 flex items-center justify-end">
          <Clock className="w-3 h-3 mr-1" />
          Last updated: {new Date(recommendationsStatus.lastGenerated).toLocaleDateString()}
        </div>
      )}
    </Layout>
  );
};

export default Dashboard;