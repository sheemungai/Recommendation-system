import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, MapPin, 
   Bookmark, Eye, ChevronRight,
   GraduationCap, DollarSign, Sparkles,
  Target, X
} from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { 
  getDetailedRecommendations, 
  markRecommendationSaved, 
  markRecommendationSeen,
  getRecommendationCourseDetails
} from '../api/recommendations';

const Recommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [filteredRecs, setFilteredRecs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'courses' | 'institutions'>('all');
  const [selectedRec, setSelectedRec] = useState<any>(null);
  const [courseDetails, setCourseDetails] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    loadRecommendations();
  }, []);

  useEffect(() => {
    filterRecommendations();
  }, [filter, recommendations]);

  const loadRecommendations = async () => {
    try {
      const data = await getDetailedRecommendations();
      setRecommendations(data);
      setFilteredRecs(data);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterRecommendations = () => {
    if (filter === 'all') {
      setFilteredRecs(recommendations);
    } else {
      setFilteredRecs(recommendations.filter(r => r.item_type === filter.slice(0, -1)));
    }
  };

  const handleSave = async (id: number, currentSaved: boolean) => {
    try {
      await markRecommendationSaved(id, !currentSaved);
      setRecommendations(prev => 
        prev.map(r => r.id === id ? { ...r, is_saved: !currentSaved } : r)
      );
    } catch (error) {
      console.error('Error saving recommendation:', error);
    }
  };

  const handleViewDetails = async (rec: any) => {
    if (!rec.is_seen) {
      try {
        await markRecommendationSeen(rec.id, true);
        setRecommendations(prev => 
          prev.map(r => r.id === rec.id ? { ...r, is_seen: true } : r)
        );
      } catch (error) {
        console.error('Error marking as seen:', error);
      }
    }
    
    if (rec.item_type === 'course') {
      try {
        const details = await getRecommendationCourseDetails(rec.id);
        setCourseDetails(details);
      } catch (error) {
        console.error('Error loading course details:', error);
      }
    }
    
    setSelectedRec(rec);
    setShowDetailsModal(true);
  };

  if (loading) return <Layout><LoadingSpinner fullPage text="Loading recommendations..." /></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Your Personalized Recommendations"
        subtitle="Courses and universities matched to your profile based on your grades and personality"
      />

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 pb-4">
        {['all', 'courses', 'institutions'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && (
              <span className="ml-2 text-xs">
                ({recommendations.filter(r => r.item_type === f.slice(0, -1)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Recommendations</p>
              <p className="text-2xl font-bold text-gray-900">{recommendations.length}</p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Saved Items</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendations.filter(r => r.is_saved).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-green-600" fill="currentColor" />
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">
                {recommendations.filter(r => !r.is_seen).length}
              </p>
            </div>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recommendations grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredRecs.map((rec) => (
          <div
            key={rec.id}
            className={`bg-white border rounded-xl overflow-hidden hover:shadow-lg transition-all ${
              !rec.is_seen 
                ? 'border-indigo-300 ring-1 ring-indigo-100 bg-gradient-to-r from-white to-indigo-50/30' 
                : 'border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                    rec.item_type === 'course' 
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {rec.item_type === 'course' ? '📚 Course' : '🏛️ Institution'}
                  </span>
                  {!rec.is_seen && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full animate-pulse">
                      New
                    </span>
                  )}
                </div>
                <button
                  onClick={() => handleSave(rec.id, rec.is_saved)}
                  className={`p-2 rounded-lg transition-colors ${
                    rec.is_saved 
                      ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50' 
                      : 'text-gray-400 hover:text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark className="w-5 h-5" fill={rec.is_saved ? 'currentColor' : 'none'} />
                </button>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">{rec.item_name}</h3>
              
              {rec.institution_name && rec.item_type === 'course' && (
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <GraduationCap className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{rec.institution_name}</span>
                  {rec.institution_location && (
                    <>
                      <span className="mx-1">•</span>
                      <MapPin className="w-3 h-3 mr-1" />
                      <span>{rec.institution_location}</span>
                    </>
                  )}
                </div>
              )}

              {/* Match score */}
              <div className="flex items-center mt-3">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-green-400 to-indigo-500 transition-all duration-500"
                    style={{ width: `${Math.round(rec.score * 100)}%` }}
                  />
                </div>
                <span className="ml-3 text-sm font-semibold text-indigo-600">
                  {Math.round(rec.score * 100)}% Match
                </span>
              </div>
            </div>

            {/* Match reasons */}
            {rec.match_reasons_display && (
              <div className="px-5 py-3 bg-gray-50">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-items-center">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Why we recommended this:
                </p>
                <div className="space-y-1.5">
                  {rec.match_reasons_display.personality?.map((reason: string, i: number) => (
                    <p key={`p-${i}`} className="text-xs text-indigo-600 flex items-start">
                      <span className="mr-2 text-indigo-400">🧠</span>
                      {reason}
                    </p>
                  ))}
                  {rec.match_reasons_display.academic?.map((reason: string, i: number) => (
                    <p key={`a-${i}`} className="text-xs text-green-600 flex items-start">
                      <span className="mr-2 text-green-400">📚</span>
                      {reason}
                    </p>
                  ))}
                  {rec.match_reasons_display.career?.map((reason: string, i: number) => (
                    <p key={`c-${i}`} className="text-xs text-purple-600 flex items-start">
                      <span className="mr-2 text-purple-400">💼</span>
                      {reason}
                    </p>
                  ))}
                  {rec.match_reasons_display.preferences?.map((reason: string, i: number) => (
                    <p key={`pr-${i}`} className="text-xs text-amber-600 flex items-start">
                      <span className="mr-2 text-amber-400">⭐</span>
                      {reason}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Career paths for courses */}
            {rec.career_paths && rec.career_paths.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-100">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Career paths:
                </p>
                <div className="flex flex-wrap gap-2">
                  {rec.career_paths.map((path: any) => (
                    <div
                      key={path.id}
                      className="group relative"
                    >
                      <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md cursor-help">
                        {path.name}
                        {path.average_salary && (
                          <span className="ml-1 text-indigo-400 flex items-center">
                            <DollarSign className="w-3 h-3" />
                            {path.average_salary}
                          </span>
                        )}
                      </span>
                      {/* Tooltip */}
                      <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg z-10">
                        <p className="font-medium mb-1">{path.name}</p>
                        <p className="text-gray-300 mb-1">{path.description}</p>
                        {path.required_skills && (
                          <p className="text-gray-300 text-xs">
                            <span className="font-medium text-gray-200">Skills:</span> {path.required_skills}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button
                onClick={() => handleViewDetails(rec)}
                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
              >
                <Eye className="w-4 h-4 mr-1" />
                View Details
              </button>
              <Link
                to={rec.item_type === 'course' ? `/courses/${rec.item_id}` : `/institutions/${rec.item_id}`}
                className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
              >
                Learn more
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredRecs.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No recommendations found</h3>
          <p className="text-gray-500">Complete your profile to get personalized recommendations</p>
          <Link
            to="/assessment"
            className="mt-4 inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Take Assessment
          </Link>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedRec && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{selectedRec.item_name}</h2>
                {selectedRec.institution_name && (
                  <p className="text-sm text-gray-600 mt-1">{selectedRec.institution_name}</p>
                )}
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Career Paths Details */}
              {selectedRec.career_paths && selectedRec.career_paths.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                    Career Paths
                  </h3>
                  <div className="space-y-4">
                    {selectedRec.career_paths.map((path: any) => (
                      <div key={path.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900">{path.name}</h4>
                          {path.average_salary && (
                            <span className="text-green-600 text-sm font-medium">
                              ${path.average_salary}/year
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{path.description}</p>
                        {path.required_skills && (
                          <div className="mt-2">
                            <span className="text-xs font-medium text-gray-500">Required Skills:</span>
                            <p className="text-sm text-gray-700 mt-1">{path.required_skills}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Course Details */}
              {courseDetails && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <GraduationCap className="w-5 h-5 mr-2 text-indigo-600" />
                    Course Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Program Code</p>
                      <p className="font-medium text-gray-900">{courseDetails.prog_code}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Career Field</p>
                      <p className="font-medium text-gray-900">{courseDetails.career_field}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Min Grade Required</p>
                      <p className="font-medium text-gray-900">{courseDetails.min_grade}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-xs text-gray-500">Location</p>
                      <p className="font-medium text-gray-900">{courseDetails.institution_location}</p>
                    </div>
                  </div>
                  
                  {courseDetails.required_subjects && courseDetails.required_subjects.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Required Subjects:</p>
                      <div className="flex flex-wrap gap-2">
                        {courseDetails.required_subjects.map((subject: string, i: number) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-md">
                            {subject}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end">
              <Link
                to={selectedRec.item_type === 'course' ? `/courses/${selectedRec.item_id}` : `/institutions/${selectedRec.item_id}`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default Recommendations;