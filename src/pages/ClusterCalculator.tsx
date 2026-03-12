import React, { useEffect, useState, useCallback } from 'react';
import { Calculator, Trophy, ChevronDown, ChevronUp, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import Alert from '../components/Alert';
import LoadingSpinner from '../components/LoadingSpinner';
import { calculateClusters, getMyCalculations, getLatestCalculations } from '../api/clusterCalculator';
import { getMyGrades } from '../api/students'; // Import to check grades
import type { ClusterCalculation } from '../types';

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 8 }, (_, i) => currentYear - i);

const ClusterCalculator: React.FC = () => {
  const [calculations, setCalculations] = useState<ClusterCalculation[]>([]);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [selectedYear, setSelectedYear] = useState(currentYear - 1);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; msg: string } | null>(null);
  const [expandedCluster, setExpandedCluster] = useState<number | null>(null);
  const [hasGrades, setHasGrades] = useState<boolean>(false);
  const [checkingGrades, setCheckingGrades] = useState(true);

  // Check if user has grades first
  const checkGrades = useCallback(async () => {
    try {
      const gradesData = await getMyGrades();
      const grades = gradesData.data || [];
      setHasGrades(grades.length > 0);
      
      if (grades.length === 0) {
        setAlert({
          type: 'warning',
          msg: 'You need to add your KCSE grades first before calculating cluster points.'
        });
      }
    } catch (error) {
      setHasGrades(false);
    } finally {
      setCheckingGrades(false);
    }
  }, []);

  const loadCalculations = useCallback(async () => {
    setLoading(true);
    try {
      // Try to get latest calculations with grades summary
      const data = await getLatestCalculations();
      if (data.calculations) {
        setCalculations(Array.isArray(data.calculations) ? data.calculations : []);
        
        // Update hasGrades from response
        if (data.grades_summary) {
          setHasGrades(data.grades_summary.length > 0);
        }
      } else {
        const calcs = await getMyCalculations();
        setCalculations(Array.isArray(calcs) ? calcs : []);
      }
    } catch (error) {
      console.error('Error loading calculations:', error);
      setCalculations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    checkGrades();
    loadCalculations(); 
  }, [checkGrades, loadCalculations]);

  const handleCalculate = async () => {
    // Double-check grades before calculating
    if (!hasGrades) {
      setAlert({ 
        type: 'warning', 
        msg: 'No grades found. Please add your KCSE grades first in the Grades section.' 
      });
      return;
    }

    setCalculating(true);
    setAlert(null);
    
    try {
      console.log(`Calculating cluster points for year ${selectedYear}...`);
      const result = await calculateClusters(selectedYear);
      
      console.log('Calculation result:', result);
      
      // Handle different response formats
      if (Array.isArray(result) && result.length > 0) {
        setCalculations(result);
        setAlert({ 
          type: 'success', 
          msg: `Cluster points calculated for ${selectedYear}! Found ${result.length} clusters.` 
        });
      } else if (result && result.length === 0) {
        setAlert({ 
          type: 'warning', 
          msg: 'Calculation completed but no clusters met the minimum subject requirements (need at least 4 subjects per cluster).' 
        });
        setCalculations([]);
      } else {
        // Reload calculations to get updated list
        await loadCalculations();
        setAlert({ 
          type: 'success', 
          msg: `Cluster points calculated for ${selectedYear}!` 
        });
      }
    } catch (err: unknown) {
      console.error('Calculation error:', err);
      
      // Better error handling
      const axiosErr = err as { response?: { data?: { error?: string; message?: string } } };
      const errorMsg = axiosErr?.response?.data?.error || 
                       axiosErr?.response?.data?.message || 
                       'Calculation failed. Make sure you have entered grades first.';
      
      setAlert({ type: 'error', msg: errorMsg });
      
      // If error says no grades, update hasGrades
      if (errorMsg.includes('No grades found') || errorMsg.includes('grades first')) {
        setHasGrades(false);
      }
    } finally {
      setCalculating(false);
    }
  };

  const sortedCalcs = [...calculations].sort(
    (a, b) => Number(b.total_points) - Number(a.total_points)
  );

  const maxPoints = sortedCalcs[0] ? Number(sortedCalcs[0].total_points) : 0;

  if (loading || checkingGrades) {
    return (
      <Layout>
        <LoadingSpinner fullPage text="Loading calculator..." />
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="Cluster Point Calculator"
        subtitle="Calculate your university admission cluster points based on KCSE grades"
        action={
          <button onClick={loadCalculations} className="btn-secondary flex items-center space-x-2">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        }
      />

      {alert && (
        <div className="mb-5">
          <Alert type={alert.type} message={alert.msg} onClose={() => setAlert(null)} />
        </div>
      )}

      {/* Warning if no grades */}
      {!hasGrades && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium text-yellow-800">No Grades Found</h4>
            <p className="text-sm text-yellow-700">
              You need to add your KCSE grades before calculating cluster points.{' '}
              <a href="/grades" className="underline font-medium hover:text-yellow-900">
                Go to Grades page
              </a>
            </p>
          </div>
        </div>
      )}

      {/* Calculate panel */}
      <div className="card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Calculator className="w-4 h-4 text-primary-600" />
          <span>Calculate Cluster Points</span>
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Select your KCSE exam year and click calculate. Make sure you have entered your grades first.
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          <div className="w-full sm:w-48">
            <label className="label" htmlFor="year">KCSE Year</label>
            <select
              id="year"
              className="input-field"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              disabled={!hasGrades}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            onClick={handleCalculate}
            disabled={calculating || !hasGrades}
            className={`btn-primary flex items-center space-x-2 h-10 ${
              !hasGrades ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {calculating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
            ) : (
              <Calculator className="w-4 h-4" />
            )}
            <span>{calculating ? 'Calculating…' : 'Calculate Points'}</span>
          </button>
        </div>
        {!hasGrades && (
          <p className="text-xs text-yellow-600 mt-2">
            ⚠️ You need to add grades before calculating
          </p>
        )}
      </div>

      {/* Results */}
      {sortedCalcs.length === 0 ? (
        <div className="card flex flex-col items-center py-16 text-center">
          <Calculator className="w-12 h-12 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">No cluster calculations yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            {hasGrades 
              ? 'Click "Calculate Points" above to see your cluster points.'
              : 'Enter your grades first, then calculate your cluster points.'}
          </p>
          {!hasGrades && (
            <button
              onClick={() => window.location.href = '/grades'}
              className="mt-4 btn-primary"
            >
              Go to Grades
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span>Your Cluster Points for {selectedYear}</span>
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {sortedCalcs.map((calc, idx) => {
              const pct = maxPoints > 0 ? (Number(calc.total_points) / maxPoints) * 100 : 0;
              const isExpanded = expandedCluster === calc.id;
              
              // Handle both possible data structures
              const clusterName = calc.cluster?.name || 'Unknown';
              const clusterCode = calc.cluster?.code || '';
              const clusterDesc = calc.cluster?.description || '';
              const subjectsUsed = calc.subjects_used || [];
              
              return (
                <div key={calc.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${
                          idx === 0 ? 'bg-amber-500' : 
                          idx === 1 ? 'bg-gray-400' : 
                          idx === 2 ? 'bg-orange-600' : 'bg-primary-600'
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{clusterName}</p>
                        {clusterCode && <p className="text-xs text-gray-500">{clusterCode}</p>}
                      </div>
                    </div>
                    <span className="text-2xl font-extrabold text-primary-700">
                      {Number(calc.total_points).toFixed(2)}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  {/* Year */}
                  <p className="text-xs text-gray-400 mb-2">Year: {calc.year}</p>

                  {/* Description */}
                  {clusterDesc && (
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{clusterDesc}</p>
                  )}

                  {/* Expand subjects used */}
                  {subjectsUsed.length > 0 && (
                    <>
                      <button
                        onClick={() => setExpandedCluster(isExpanded ? null : calc.id)}
                        className="flex items-center space-x-1 text-xs text-primary-600 hover:underline"
                      >
                        <span>Subjects used ({subjectsUsed.length})</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                      {isExpanded && (
                        <div className="mt-3 space-y-1.5">
                          {subjectsUsed.map((s: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-1.5 text-sm">
                              <span className="text-gray-700">{s.subject}</span>
                              <div className="flex items-center space-x-3">
                                <span className="badge bg-primary-100 text-primary-700">{s.grade}</span>
                                <span className="font-bold text-gray-900">{s.points} pts</span>
                              </div>
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
        </div>
      )}
    </Layout>
  );
};

export default ClusterCalculator;