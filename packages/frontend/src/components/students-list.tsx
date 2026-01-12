// packages/frontend/src/components/students-list.tsx
'use client';

import { useState, useEffect } from 'react';
import { getStudents, addStudent, updateStudent, deleteStudent, Student } from '../lib/firestore';
import EditStudentWishesModal from './EditStudentWishesModal';

const StudentsList = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentRank, setNewStudentRank] = useState(1);

  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [editedStudentName, setEditedStudentName] = useState('');
  const [editedStudentRank, setEditedStudentRank] = useState(0);

  const [studentToEditWishes, setStudentToEditWishes] = useState<Student | null>(null);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentsData = await getStudents();
        setStudents(studentsData);
        setNewStudentRank(Math.max(0, ...studentsData.map(s => s.rank)) + 1);
      } catch (err) {
        setError('Failed to fetch students. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) {
        setError('Student name cannot be empty.');
        return;
    }
    try {
      await addStudent({ name: newStudentName, rank: newStudentRank });
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
      setNewStudentName('');
      setNewStudentRank(Math.max(0, ...updatedStudents.map(s => s.rank)) + 1);
    } catch (err) {
      setError('Failed to add student.');
      console.error(err);
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudentId(student.id);
    setEditedStudentName(student.name);
    setEditedStudentRank(student.rank);
  };

  const handleUpdateStudent = async (studentId: string) => {
    try {
      await updateStudent(studentId, { name: editedStudentName, rank: editedStudentRank });
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
      setEditingStudentId(null);
    } catch (err) {
      setError('Failed to update student.');
      console.error(err);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      await deleteStudent(studentId);
      const updatedStudents = await getStudents();
      setStudents(updatedStudents);
    } catch (err) {
      setError('Failed to delete student.');
      console.error(err);
    }
  };

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold mb-4">Add New Student</h2>
        <form onSubmit={handleAddStudent} className="flex items-center gap-4">
          <input
            type="text"
            value={newStudentName}
            onChange={(e) => setNewStudentName(e.target.value)}
            placeholder="Student Name"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
          <input
            type="number"
            value={newStudentRank}
            onChange={(e) => setNewStudentRank(Number(e.target.value))}
            className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            min="1"
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Student
          </button>
        </form>
      </div>
      <div className="overflow-x-auto">
        <h2 className="text-xl font-semibold mb-4">Student Ranking</h2>
        <table className="min-w-full bg-white border">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b text-left">Rank</th>
              <th className="px-6 py-3 border-b text-left">Name</th>
              <th className="px-6 py-3 border-b text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                {editingStudentId === student.id ? (
                  <>
                    <td className="px-6 py-4 border-b">
                      <input
                        type="number"
                        value={editedStudentRank}
                        onChange={(e) => setEditedStudentRank(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 border-b">
                      <input
                        type="text"
                        value={editedStudentName}
                        onChange={(e) => setEditedStudentName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </td>
                    <td className="px-6 py-4 border-b">
                      <button onClick={() => handleUpdateStudent(student.id)} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Save
                      </button>
                      <button onClick={() => setEditingStudentId(null)} className="ml-2 px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600">
                        Cancel
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="px-6 py-4 border-b">{student.rank}</td>
                    <td className="px-6 py-4 border-b">{student.name}</td>
                    <td className="px-6 py-4 border-b">
                      <button onClick={() => handleEditStudent(student)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Edit
                      </button>
                      <button onClick={() => setStudentToEditWishes(student)} className="ml-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                        Edit Wishes
                      </button>
                      <button onClick={() => handleDeleteStudent(student.id)} className="ml-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Delete
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {studentToEditWishes && (
        <EditStudentWishesModal
            student={studentToEditWishes}
            onClose={() => setStudentToEditWishes(null)}
        />
      )}
    </div>
  );
};

export default StudentsList;
