import React, { useEffect, useState } from 'react';
import { Building2, Search, MapPin, Filter } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import { getCourses, getInstitutions } from '../api/careers';
import type { Course, Institution } from '../types';

const Courses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState<number | ''>('');
  const [selectedType, setSelectedType] = useState<'ALL' | 'PUBLIC' | 'PRIVATE'>('ALL');

  useEffect(() => {
    Promise.allSettled([getCourses(), getInstitutions()]).then(([c, i]) => {
      if (c.status === 'fulfilled') setCourses(Array.isArray(c.value) ? c.value : []);
      if (i.status === 'fulfilled') setInstitutions(Array.isArray(i.value) ? i.value : []);
      setLoading(false);
    });
  }, []);

  const filtered = courses.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.prog_code.toLowerCase().includes(search.toLowerCase()) ||
      c.institution?.name?.toLowerCase().includes(search.toLowerCase());
    const matchInstitution = !selectedInstitution || c.institution?.id === selectedInstitution;
    const matchType =
      selectedType === 'ALL' || c.institution?.type === selectedType;
    return matchSearch && matchInstitution && matchType;
  });

  // Group by institution
  const grouped = filtered.reduce<Record<string, Course[]>>((acc, course) => {
    const name = course.institution?.name ?? 'Other';
    acc[name] = acc[name] ?? [];
    acc[name].push(course);
    return acc;
  }, {});

  if (loading) return <Layout><LoadingSpinner fullPage text="Loading courses…" /></Layout>;

  return (
    <Layout>
      <PageHeader
        title="Courses & Institutions"
        subtitle="Browse university courses and their admission cut-off points"
      />

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses or institutions…"
            className="input-field pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select
            className="input-field pl-9 appearance-none"
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value ? Number(e.target.value) : '')}
          >
            <option value="">All Institutions</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>{inst.name}</option>
            ))}
          </select>
        </div>
        <select
          className="input-field"
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as 'ALL' | 'PUBLIC' | 'PRIVATE')}
        >
          <option value="ALL">All Types</option>
          <option value="PUBLIC">Public</option>
          <option value="PRIVATE">Private</option>
        </select>
      </div>

      {/* Result count */}
      <p className="text-sm text-gray-500 mb-4">
        Showing <span className="font-semibold text-gray-800">{filtered.length}</span> course{filtered.length !== 1 ? 's' : ''}
      </p>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No courses match your filters.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([instName, instCourses]) => {
            const inst = instCourses[0]?.institution;
            return (
              <div key={instName}>
                {/* Institution header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-9 h-9 bg-primary-100 rounded-xl flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="font-bold text-gray-900">{instName}</h2>
                    <div className="flex items-center space-x-2 text-xs text-gray-400">
                      {inst?.location && (
                        <>
                          <MapPin className="w-3 h-3" />
                          <span>{inst.location}</span>
                        </>
                      )}
                      {inst?.type && (
                        <span
                          className={`badge ${
                            inst.type === 'PUBLIC'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}
                        >
                          {inst.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Courses table */}
                <div className="card p-0 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                          <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
                          <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2023</th>
                          <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2024</th>
                          <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">2025</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {instCourses.map((course) => (
                          <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-3 font-medium text-gray-900">{course.name}</td>
                            <td className="px-5 py-3 text-gray-500">{course.prog_code}</td>
                            <td className="px-5 py-3 text-center">
                              {course.cutoff_2023 ? (
                                <span className="font-semibold text-blue-700">{course.cutoff_2023}</span>
                              ) : <span className="text-gray-300">–</span>}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {course.cutoff_2024 ? (
                                <span className="font-semibold text-primary-700">{course.cutoff_2024}</span>
                              ) : <span className="text-gray-300">–</span>}
                            </td>
                            <td className="px-5 py-3 text-center">
                              {course.cutoff_2025 ? (
                                <span className="font-semibold text-green-700">{course.cutoff_2025}</span>
                              ) : <span className="text-gray-300">–</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
};

export default Courses;
