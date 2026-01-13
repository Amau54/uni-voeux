import React, { useState, useEffect } from 'react';
import { db, functions } from '../lib/firebase'; // Assurez-vous d'exporter 'functions' depuis votre config firebase
import { httpsCallable } from 'firebase/functions';
import { collection, getDocs } from 'firebase/firestore';

const Dashboard = () => {
  const [totalCapacity, setTotalCapacity] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      // Récupérer les vœux pour calculer la capacité totale
      const wishesSnapshot = await getDocs(collection(db, 'wishes'));
      const wishesCapacity = wishesSnapshot.docs.reduce((acc, doc) => acc + doc.data().maxCapacity, 0);
      setTotalCapacity(wishesCapacity);

      // Récupérer les utilisateurs pour le tableau des résultats et le nombre total
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersList = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        name: `${doc.data().firstName} ${doc.data().lastName}`,
        wish: doc.data().obtainedWishId || null, // Adapter selon le nom du champ
        status: doc.data().status,
      }));
      setResults(usersList);
      setTotalStudents(usersList.length);
      setIsLoading(false);
    };

    fetchData();
  }, []);

  const handleRunAlgorithm = async () => {
    // setLoading(true); // Idéalement, gérer un état de chargement spécifique
    const runAllocation = httpsCallable(functions, 'runAllocationAlgorithm');
    try {
      await runAllocation();
      alert('Algorithme exécuté avec succès !');
      // Re-fetch data to show results
    } catch (error) {
      console.error("Erreur lors de l'exécution de l'algorithme:", error);
      alert('Une erreur est survenue.');
    }
    // setLoading(false);
  };

  const isCapacityInsufficient = totalCapacity < totalStudents;

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tableau de Bord Professeur</h1>

      <div className="mb-4">
        <button
          onClick={handleRunAlgorithm}
          className="bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700"
        >
          Lancer l'Algorithme d'Affectation
        </button>
      </div>

      {/* Règle 1.1 : Alerte de capacité */}
      {isCapacityInsufficient && (
        <div className="bg-red-500 text-white p-4 rounded-md mb-4">
          <h2 className="text-lg font-semibold">ALERTE ROUGE</h2>
          <p>Capacité totale insuffisante. Risque d'étudiants sans affectation.</p>
        </div>
      )}

      {/* Règle 1.3 : Tableau des résultats avec gestion des lignes rouges */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nom</th>
              <th className="py-2 px-4 border-b">Vœu Obtenu</th>
              <th className="py-2 px-4 border-b">Statut</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result) => (
              <tr
                key={result.id}
                className={result.status === 'NON AFFECTÉ' ? 'bg-red-200' : ''}
              >
                <td className="py-2 px-4 border-b">{result.name}</td>
                <td className="py-2 px-4 border-b">{result.wish || 'N/A'}</td>
                <td className="py-2 px-4 border-b">{result.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
