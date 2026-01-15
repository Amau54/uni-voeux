import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function appelable pour exécuter l'algorithme d'affectation.
 * Seuls les administrateurs peuvent exécuter cette fonction.
 */
export const runAllocationAlgorithm = functions.https.onCall(async (data, context) => {
    // Vérifier l'authentification et le rôle de l'utilisateur
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Vous devez être connecté pour effectuer cette action.');
    }

    const userId = context.auth.uid;
    const userDoc = await db.collection('users').doc(userId).get();

    if (!userDoc.exists || userDoc.data()?.role !== 'admin') {
        throw new functions.https.HttpsError('permission-denied', 'Vous devez être administrateur pour effectuer cette action.');
    }

    functions.logger.info("Début de l'algorithme d'affectation...", { structuredData: true });

    try {
        // Étape 1 : Récupérer tous les étudiants, classés par leur rang.
        const usersSnapshot = await db.collection("users").orderBy("rank").get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        const allocationPromises = users.map(async (user) => {
            // Pour chaque utilisateur, récupérer ses choix de vœux, triés par priorité.
            const selectionsSnapshot = await db.collection("users").doc(user.id).collection("selections").orderBy("priority").get();
            const selections = selectionsSnapshot.docs.map(doc => doc.data());

            let isAssigned = false;

            for (const selection of selections) {
                await db.runTransaction(async (transaction) => {
                    if (isAssigned) return;

                    const wishRef = db.collection("wishes").doc(selection.wishId);
                    const wishDoc = await transaction.get(wishRef);
                    if (!wishDoc.exists) return;

                    const wish = wishDoc.data()!;
                    
                    if (wish.currentCapacity < wish.maxCapacity) {
                        transaction.update(wishRef, { currentCapacity: admin.firestore.FieldValue.increment(1) });
                        
                        const userRef = db.collection("users").doc(user.id);
                        transaction.update(userRef, { obtainedWishId: wish.id, status: "Affecté" });
                        
                        isAssigned = true;
                        functions.logger.info(`Utilisateur ${user.id} affecté au vœu ${wish.id}`);
                    }
                });

                if (isAssigned) break;
            }

            if (!isAssigned) {
                const userRef = db.collection("users").doc(user.id);
                await userRef.update({ status: "NON AFFECTÉ" });
                functions.logger.warn(`Utilisateur ${user.id} n'a pas pu être affecté.`);
            }
        });

        await Promise.all(allocationPromises);

        return { message: "Algorithme d'affectation terminé avec succès." };

    } catch (error) {
        functions.logger.error("Erreur lors de l'exécution de l'algorithme :", error);
        throw new functions.https.HttpsError('internal', "Une erreur est survenue lors de l'affectation.");
    }
});
