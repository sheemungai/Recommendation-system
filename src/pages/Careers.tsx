import React, { useEffect, useState } from 'react';
import { Briefcase, Search, DollarSign, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCareers } from '../api/careers';
import type { CareerPath } from '../types';

const Careers: React.FC = () => {
  const [careers, setCareers] = useState<CareerPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    getCareers()
      .then((data) => setCareers(Array.isArray(data) ? data : []))
      .catch((error) => {
        console.error('Error fetching careers:', error);
        setCareers([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = careers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Layout><LoadingSpinner fullPage text="Loading career paths…" /></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Career Paths"
        subtitle="Explore available career pathways and their required skills"
      />

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search career paths…"
          className="input-field pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Briefcase className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">
            {search ? 'No career paths match your search.' : 'No career paths available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filtered.map((career) => {
            const isOpen = expanded === career.id;
            return (
              <div key={career.id} className="card hover:shadow-md transition-shadow">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Briefcase className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{career.name}</h3>
                      {career.average_salary && (
                        <div className="flex items-center space-x-1 text-green-600 text-sm mt-0.5">
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>
                            Avg Salary: KES {Number(career.average_salary).toLocaleString('en-KE')} / yr
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3 leading-relaxed line-clamp-3">
                  {career.description}
                </p>

                {/* Skills tags */}
                {career.required_skills && (
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
                      Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {career.required_skills
                        .split(/[,;|]/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .slice(0, 5)
                        .map((skill) => (
                          <span key={skill} className="badge bg-blue-50 text-blue-700">
                            {skill}
                          </span>
                        ))}
                    </div>
                  </div>
                )}

                {/* Related courses expand */}
                {career.related_courses?.length > 0 && (
                  <>
                    <button
                      onClick={() => setExpanded(isOpen ? null : career.id)}
                      className="flex items-center space-x-1.5 text-xs text-primary-600 hover:underline mt-1"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Related Courses ({career.related_courses.length})</span>
                      {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {isOpen && (
                      <div className="mt-3 space-y-2">
                        {career.related_courses.map((course) => (
                          <div
                            key={course.id}
                            className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100"
                          >
                            <p className="font-medium text-gray-800 text-sm">{course.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {course.institution?.name || 'Unknown Institution'} · Code: {course.prog_code}
                            </p>
                            {course.cutoff_2024 && (
                              <p className="text-xs text-primary-600 mt-0.5">
                                2024 Cut-off: {course.cutoff_2024} pts
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Careers;