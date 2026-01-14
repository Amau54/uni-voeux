// packages/frontend/src/app/professor/wishes/page.tsx
'use client';
import WishesList from '../../../components/wishes-list';
import withProfessorAuth from '../../../components/withProfessorAuth';

const ProfessorWishesPage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Wish Management</h1>
      <p className="mb-8 text-gray-600">
        Here you can view, add, edit, and delete the wishes available to students.
      </p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Current Wishes</h2>
        <WishesList />
      </div>
    </main>
  );
};

export default withProfessorAuth(ProfessorWishesPage);
