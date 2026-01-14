// packages/frontend/src/app/student/wishes/page.tsx
import WishSelector from '../../../components/WishSelector';

const StudentWishesPage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Select Your Wishes</h1>
      <p className="mb-8 text-gray-600">
        Please select exactly 9 wishes from the list below and order them by priority. Your first choice is your most desired wish.
      </p>
      <div className="bg-white shadow-md rounded-lg p-6">
        <WishSelector />
      </div>
    </main>
  );
};

export default StudentWishesPage;
