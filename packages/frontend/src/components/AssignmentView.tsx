// packages/frontend/src/components/AssignmentView.tsx
'use client';

import { useState, useEffect } from 'react';
import Papa from 'papaparse';
import { runAssignment, getAssignments, Assignment } from '../lib/firestore';

const AssignmentView = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isRunning, setIsRunning] = useState(false);
    const [summary, setSummary] = useState<{ totalStudents: number; assignedStudents: number; unassignedStudents: number } | null>(null);

    const fetchAssignments = async () => {
        try {
            const assignmentsData = await getAssignments();
            setAssignments(assignmentsData);
        } catch (err) {
            setError('Failed to fetch assignments.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
    }, []);

    const handleRunAssignment = async () => {
        setIsRunning(true);
        setError(null);
        setSummary(null);
        try {
            const result = await runAssignment();
            setSummary(result.summary);
            await fetchAssignments(); // Refresh the assignments list
        } catch (err) {
            setError(err.message || 'An unknown error occurred while running the assignment.');
            console.error(err);
        } finally {
            setIsRunning(false);
        }
    };

    if (loading) return <p>Loading assignments...</p>;

  const handleExport = () => {
    const csvData = assignments.map(a => ({
        'Student Rank': a.studentRank,
        'Student Name': a.studentName,
        'Assigned Wish': a.wishName,
    }));
    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'assignments.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-4">Run Assignment Algorithm</h2>
                <button
                    onClick={handleRunAssignment}
                    disabled={isRunning}
                    className="px-4 py-2 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400"
                >
                    {isRunning ? 'Running...' : 'Run Assignment'}
                </button>
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {summary && (
                <div className="p-4 bg-gray-100 rounded-md">
                    <h3 className="font-semibold">Assignment Summary:</h3>
                    <p>Total Students: {summary.totalStudents}</p>
                    <p>Assigned Students: {summary.assignedStudents}</p>
                    <p>Unassigned Students: {summary.unassignedStudents}</p>
                </div>
            )}

            <div className="overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Assignment Results</h2>
                    <button
                        onClick={handleExport}
                        disabled={assignments.length === 0}
                        className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-md hover:bg-gray-700 disabled:bg-gray-400"
                    >
                        Export to CSV
                    </button>
                </div>
                <table className="min-w-full bg-white border">
                    <thead>
                        <tr>
                            <th className="px-6 py-3 border-b text-left">Student Rank</th>
                            <th className="px-6 py-3 border-b text-left">Student Name</th>
                            <th className="px-6 py-3 border-b text-left">Assigned Wish</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.length > 0 ? (
                            assignments.map((assignment) => (
                                <tr key={assignment.id}>
                                    <td className="px-6 py-4 border-b">{assignment.studentRank}</td>
                                    <td className="px-6 py-4 border-b">{assignment.studentName}</td>
                                    <td className="px-6 py-4 border-b">{assignment.wishName}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-4 text-center border-b">
                                    No assignments found. Run the assignment algorithm to generate results.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AssignmentView;
