// packages/frontend/src/app/professor/assignment/page.tsx
'use client';
import AssignmentView from '../../../components/AssignmentView';
import withProfessorAuth from '../../../components/withProfessorAuth';

const ProfessorAssignmentPage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Run Assignment</h1>
      <p className="mb-8 text-gray-600">
        Run the assignment algorithm to assign students to wishes based on their rank and preferences.
      </p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <AssignmentView />
      </div>
    </main>
  );
};

export default withProfessorAuth(ProfessorAssignmentPage);
