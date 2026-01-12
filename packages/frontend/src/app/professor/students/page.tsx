// packages/frontend/src/app/professor/students/page.tsx
'use client';
import StudentsList from '../../../components/students-list';
import withProfessorAuth from '../../../components/withProfessorAuth';

const ProfessorStudentsPage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Student Management</h1>
      <p className="mb-8 text-gray-600">
        Here you can view, add, edit, and delete students, as well as manage their rankings.
      </p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <StudentsList />
      </div>
    </main>
  );
};

export default withProfessorAuth(ProfessorStudentsPage);
