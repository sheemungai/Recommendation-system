import React, { useEffect, useState, useCallback } from "react";
import { Link} from "react-router-dom";
import {
  Plus,
  Trash2,
  RefreshCw,
  BookOpen,
  User,
  Pencil,
  CheckCircle,
  X,
  AlertCircle,
} from "lucide-react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Alert from "../components/Alert";
import LoadingSpinner from "../components/LoadingSpinner";
import StatCard from "../components/StatCard";
import {
  getMyGrades,
  addGrade,
  updateGrade,
  deleteGrade,
} from "../api/students";
import { useProfileCheck } from "../hooks/useProfileCheck";
import type {
  StudentGrade,
  GradesResponse,
  SubjectChoice,
  GradeChoice,
} from "../types";

const SUBJECTS: { value: SubjectChoice; label: string; group: string }[] = [
  { value: "MATHEMATICS", label: "Mathematics", group: "Compulsory" },
  { value: "ENGLISH", label: "English", group: "Compulsory" },
  { value: "KISWAHILI", label: "Kiswahili", group: "Compulsory" },
  { value: "PHYSICS", label: "Physics", group: "Sciences" },
  { value: "CHEMISTRY", label: "Chemistry", group: "Sciences" },
  { value: "BIOLOGY", label: "Biology", group: "Sciences" },
  { value: "HISTORY", label: "History", group: "Humanities" },
  { value: "CRE", label: "CRE", group: "Humanities" },
  { value: "GEOGRAPHY", label: "Geography", group: "Humanities" },
  { value: "FRENCH", label: "French", group: "Languages" },
  { value: "GERMAN", label: "German", group: "Languages" },
  { value: "ARABIC", label: "Arabic", group: "Languages" },
  { value: "HOME_SCIENCE", label: "Home Science", group: "Technical" },
  { value: "AGRICULTURE", label: "Agriculture", group: "Technical" },
  { value: "WOODWORK", label: "Woodwork", group: "Technical" },
  { value: "METALWORK", label: "Metalwork", group: "Technical" },
  {
    value: "BUILDING_CONSTRUCTION",
    label: "Building Construction",
    group: "Technical",
  },
  { value: "POWER_MECHANICS", label: "Power Mechanics", group: "Technical" },
  { value: "ELECTRICITY", label: "Electricity", group: "Technical" },
  { value: "DRAWING_DESIGN", label: "Drawing & Design", group: "Technical" },
  { value: "AVIATION", label: "Aviation", group: "Technical" },
  { value: "COMPUTER", label: "Computer Studies", group: "Technical" },
  { value: "BUSINESS", label: "Business Studies", group: "Technical" },
  { value: "MUSIC", label: "Music", group: "Technical" },
  { value: "ART_DESIGN", label: "Art & Design", group: "Technical" },
];

const GRADES: { value: GradeChoice; label: string; points: number }[] = [
  { value: "A", label: "A", points: 12 },
  { value: "A-", label: "A-", points: 11 },
  { value: "B+", label: "B+", points: 11 },
  { value: "B", label: "B", points: 10 },
  { value: "B-", label: "B-", points: 9 },
  { value: "C+", label: "C+", points: 8 },
  { value: "C", label: "C", points: 7 },
  { value: "C-", label: "C-", points: 6 },
  { value: "D+", label: "D+", points: 5 },
  { value: "D", label: "D", points: 4 },
  { value: "D-", label: "D-", points: 3 },
  { value: "E", label: "E", points: 0 },
];

const MAX_SUBJECTS = 9;

const gradeColor = (grade: GradeChoice): string => {
  const colorMap: Record<GradeChoice, string> = {
    A: "bg-green-100 text-green-800",
    "A-": "bg-green-100 text-green-800",
    "B+": "bg-emerald-100 text-emerald-800",
    B: "bg-emerald-100 text-emerald-800",
    "B-": "bg-blue-100 text-blue-800",
    "C+": "bg-blue-100 text-blue-800",
    C: "bg-yellow-100 text-yellow-800",
    "C-": "bg-yellow-100 text-yellow-800",
    "D+": "bg-orange-100 text-orange-800",
    D: "bg-red-100 text-red-800",
    "D-": "bg-red-100 text-red-800",
    E: "bg-gray-100 text-gray-800",
  };
  return colorMap[grade] || "bg-gray-100 text-gray-800";
};

const Grades: React.FC = () => {
  const { hasProfile, loading: profileLoading } = useProfileCheck();

  const [gradesData, setGradesData] = useState<GradesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileCheckDone, setProfileCheckDone] = useState(false);
  const [addSubject, setAddSubject] = useState<SubjectChoice | "">("");
  const [addGradeVal, setAddGradeVal] = useState<GradeChoice | "">("");
  const [adding, setAdding] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error" | "warning";
    msg: string;
  } | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);

  // Edit states
  const [editingGrade, setEditingGrade] = useState<number | null>(null);
  const [editGradeValue, setEditGradeValue] = useState<GradeChoice | "">("");

  const loadGrades = useCallback(async () => {
    if (!hasProfile) return;

    setLoading(true);
    try {
      const d = await getMyGrades();
      setGradesData(d);
      setProfileCheckDone(true);
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAlert({
          type: "warning",
          msg: "Please create your profile first before adding grades.",
        });
      } else {
        setAlert({
          type: "error",
          msg: "Failed to load grades. Please try again.",
        });
      }
    } finally {
      setLoading(false);
    }
  }, [hasProfile]);

  useEffect(() => {
    if (hasProfile === true) {
      loadGrades();
    } else if (hasProfile === false) {
      setAlert({
        type: "warning",
        msg: "Please create your profile first before adding grades.",
      });
      setLoading(false);
      setProfileCheckDone(true);
    }
  }, [hasProfile, loadGrades]);

  const enteredSubjects = new Set(
    gradesData?.data?.map((g) => g.subject) ?? [],
  );
  const currentCount = gradesData?.data?.length || 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hasProfile) {
      setAlert({
        type: "warning",
        msg: "You need to create your profile before adding grades.",
      });
      return;
    }

    if (currentCount >= MAX_SUBJECTS) {
      setAlert({
        type: "warning",
        msg: `Maximum of ${MAX_SUBJECTS} subjects reached. Please delete a subject before adding a new one.`,
      });
      return;
    }

    if (!addSubject || !addGradeVal) {
      setAlert({
        type: "error",
        msg: "Please select both a subject and a grade.",
      });
      return;
    }

    setAdding(true);
    try {
      await addGrade({ subject: addSubject, grade: addGradeVal });
      setAlert({ type: "success", msg: "Grade added successfully!" });
      setAddSubject("");
      setAddGradeVal("");
      await loadGrades();
    } catch (error: any) {
      if (error.response?.status === 404) {
        setAlert({
          type: "warning",
          msg: "Profile not found. Please create your profile first.",
        });
      } else if (error.response?.data?.subject) {
        setAlert({ type: "error", msg: error.response.data.subject[0] });
      } else {
        setAlert({
          type: "error",
          msg: "Failed to add grade. This subject may already exist.",
        });
      }
    } finally {
      setAdding(false);
    }
  };

  const handleEdit = (grade: StudentGrade) => {
    setEditingGrade(grade.id);
    setEditGradeValue(grade.grade);
  };

  const handleUpdate = async (id: number) => {
    if (!editGradeValue) {
      setAlert({ type: "error", msg: "Please select a grade." });
      return;
    }

    setAdding(true);
    try {
      await updateGrade(id, { grade: editGradeValue });
      setAlert({ type: "success", msg: "Grade updated successfully!" });
      setEditingGrade(null);
      setEditGradeValue("");
      await loadGrades();
    } catch (error: any) {
      setAlert({ type: "error", msg: "Failed to update grade." });
    } finally {
      setAdding(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingGrade(null);
    setEditGradeValue("");
  };

  const handleDelete = async (id: number) => {
    if (!hasProfile) {
      setAlert({
        type: "warning",
        msg: "You need to create your profile first.",
      });
      return;
    }

    setDeleting(id);
    try {
      await deleteGrade(id);
      setAlert({ type: "success", msg: "Grade removed." });
      await loadGrades();
    } catch {
      setAlert({ type: "error", msg: "Failed to delete grade." });
    } finally {
      setDeleting(null);
    }
  };

  const handleRefresh = () => {
    if (!hasProfile) {
      setAlert({
        type: "warning",
        msg: "Please create your profile first.",
      });
      return;
    }
    loadGrades();
  };

  const availableSubjects = SUBJECTS.filter(
    (s) => !enteredSubjects.has(s.value),
  );
  const stats = gradesData?.statistics;
  const grades: StudentGrade[] = gradesData?.data ?? [];

  // Show loading while checking profile
  if (profileLoading || (!profileCheckDone && loading)) {
    return (
      <Layout>
        <LoadingSpinner fullPage text="Checking profile..." />
      </Layout>
    );
  }

  // Show profile required message if no profile
  if (!hasProfile) {
    return (
      <Layout>
        <PageHeader
          title="My KCSE Grades"
          subtitle="Track all your subject grades and performance statistics"
        />

        <div className="max-w-2xl mx-auto mt-8">
          <div className="card bg-yellow-50 border border-yellow-200">
            <div className="flex flex-col items-center text-center p-8">
              <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                <User className="w-8 h-8 text-yellow-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Profile Required
              </h2>

              <p className="text-gray-600 mb-6 max-w-md">
                You need to complete your student profile before you can start
                adding your KCSE grades.
              </p>

              <Link
                to="/profile"
                className="bg-yellow-600 text-white px-6 py-2 rounded-lg hover:bg-yellow-700 transition-colors inline-block"
              >
                Create Your Profile
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <PageHeader
        title="My KCSE Grades"
        subtitle="Track all your subject grades and performance statistics"
        action={
          <button
            onClick={handleRefresh}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        }
      />

      {alert && (
        <div className="mb-5">
          <Alert
            type={alert.type}
            message={alert.msg}
            onClose={() => setAlert(null)}
          />
        </div>
      )}

      {/* Stats */}
      {stats && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <StatCard
              title="Subjects"
              value={stats.total_subjects}
              icon={<BookOpen className="w-5 h-5" />}
              color="blue"
            />
            <StatCard
              title="Total Points"
              value={stats.total_points}
              icon={<span className="text-sm font-bold">Σ</span>}
              color="green"
            />
            <StatCard
              title="Average"
              value={stats.average_points}
              icon={<span className="text-sm font-bold">~</span>}
              color="purple"
            />
            <StatCard
              title="Mean Grade"
              value={stats.mean_grade || "–"}
              icon={<span className="text-sm font-bold">M</span>}
              color="amber"
            />
          </div>

          {/* Max subjects warning */}
          {currentCount >= 7 && (
            <div
              className={`mb-4 p-3 rounded-lg flex items-center space-x-2 ${
                currentCount >= MAX_SUBJECTS
                  ? "bg-red-50 border border-red-200 text-red-700"
                  : "bg-yellow-50 border border-yellow-200 text-yellow-700"
              }`}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span className="text-sm font-medium">
                {currentCount >= MAX_SUBJECTS
                  ? `Maximum subjects reached (${MAX_SUBJECTS}/${MAX_SUBJECTS}). Delete a subject to add a new one.`
                  : `You have ${currentCount}/${MAX_SUBJECTS} subjects. You can add ${MAX_SUBJECTS - currentCount} more.`}
              </span>
            </div>
          )}
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Add grade form */}
        <div className="lg:col-span-1">
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Plus className="w-4 h-4 text-primary-600" />
              <span>Add Grade</span>
            </h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="label" htmlFor="subject">
                  Subject
                </label>
                <select
                  id="subject"
                  className="input-field"
                  value={addSubject}
                  onChange={(e) =>
                    setAddSubject(e.target.value as SubjectChoice)
                  }
                  disabled={currentCount >= MAX_SUBJECTS}
                >
                  <option value="">Select subject</option>
                  {[
                    "Compulsory",
                    "Sciences",
                    "Humanities",
                    "Languages",
                    "Technical",
                  ].map((group) => {
                    const groupItems = availableSubjects.filter(
                      (s) => s.group === group,
                    );
                    if (!groupItems.length) return null;
                    return (
                      <optgroup key={group} label={group}>
                        {groupItems.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
                {currentCount >= MAX_SUBJECTS && (
                  <p className="text-xs text-red-500 mt-1">
                    Maximum subjects reached
                  </p>
                )}
              </div>
              <div>
                <label className="label" htmlFor="gradeVal">
                  Grade
                </label>
                <select
                  id="gradeVal"
                  className="input-field"
                  value={addGradeVal}
                  onChange={(e) =>
                    setAddGradeVal(e.target.value as GradeChoice)
                  }
                  disabled={currentCount >= MAX_SUBJECTS}
                >
                  <option value="">Select grade</option>
                  {GRADES.map(({ value, points }) => (
                    <option key={value} value={value}>
                      {value} – {points} pts
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="submit"
                disabled={adding || currentCount >= MAX_SUBJECTS}
                className="btn-primary w-full flex items-center justify-center space-x-2"
              >
                {adding ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                <span>{adding ? "Adding…" : "Add Grade"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* Grades list */}
        <div className="lg:col-span-2">
          {loading ? (
            <LoadingSpinner fullPage text="Loading grades…" />
          ) : grades.length === 0 ? (
            <div className="card flex flex-col items-center py-16 text-center">
              <BookOpen className="w-12 h-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">
                No grades entered yet.
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Add your KCSE subject grades using the form.
              </p>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900">Entered Grades</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Subject
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Grade
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Points
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {grades.map((g) => {
                      const subLabel =
                        SUBJECTS.find((s) => s.value === g.subject)?.label ??
                        g.subject;
                      const isEditing = editingGrade === g.id;

                      return (
                        <tr
                          key={g.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-6 py-3 font-medium text-gray-900">
                            {subLabel}
                          </td>
                          <td className="px-6 py-3 text-center">
                            {isEditing ? (
                              <select
                                value={editGradeValue}
                                onChange={(e) =>
                                  setEditGradeValue(
                                    e.target.value as GradeChoice,
                                  )
                                }
                                className="input-field text-sm py-1 px-2 w-32 mx-auto"
                                autoFocus
                              >
                                <option value="">Select</option>
                                {GRADES.map(({ value, points }) => (
                                  <option key={value} value={value}>
                                    {value} – {points} pts
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className={`badge ${gradeColor(g.grade)}`}>
                                {g.grade}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-center font-bold text-gray-700">
                            {g.points}
                          </td>
                          <td className="px-6 py-3 text-right">
                            <div className="flex items-center justify-end space-x-2">
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(g.id)}
                                    disabled={adding}
                                    className="p-1.5 rounded-lg text-green-500 hover:bg-green-50 transition-colors"
                                    title="Save"
                                  >
                                    {adding ? (
                                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-green-400 border-t-transparent" />
                                    ) : (
                                      <CheckCircle className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                  <button
                                    onClick={handleCancelEdit}
                                    className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                                    title="Cancel"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleEdit(g)}
                                    className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors"
                                    title="Edit"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(g.id)}
                                    disabled={deleting === g.id}
                                    className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                    title="Delete"
                                  >
                                    {deleting === g.id ? (
                                      <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-red-400 border-t-transparent" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Grades;
