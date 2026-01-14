import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Cloud Function appelable pour exécuter l'algorithme d'affectation.
 * L'accès est restreint aux utilisateurs ayant le rôle d'administrateur.
 */
export const runAllocationAlgorithm = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.admin) {
        functions.logger.error("Tentative d'accès non autorisée.", { uid: context.auth?.uid });
        throw new functions.https.HttpsError(
            "permission-denied",
            "Vous devez être un administrateur pour exécuter cette action."
        );
    }

    functions.logger.info("Début de l'algorithme d'affectation optimisé...", { uid: context.auth.uid });

    try {
        // Étape 1 : Récupérer toutes les données en amont
        const usersSnapshot = await db.collection("users").orderBy("rank").get();
        const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));

        const wishesSnapshot = await db.collection("wishes").get();
        const wishes: { [key: string]: any } = {};
        wishesSnapshot.forEach(doc => {
            wishes[doc.id] = { id: doc.id, ...doc.data() };
        });

        const userSelectionsPromises = users.map(user =>
            db.collection("users").doc(user.id).collection("selections").orderBy("priority").get()
        );
        const userSelectionsSnapshots = await Promise.all(userSelectionsPromises);
        const userSelections = users.reduce((acc, user, index) => {
            acc[user.id] = userSelectionsSnapshots[index].docs.map(doc => doc.data());
            return acc;
        }, {} as { [key: string]: any[] });

        // Étape 2 : Traitement en mémoire
        const assignments: { [key: string]: string } = {};
        const wishesCapacity: { [key: string]: any } = JSON.parse(JSON.stringify(wishes));

        for (const user of users) {
            const selections = userSelections[user.id] || [];
            for (const selection of selections) {
                const wish = wishesCapacity[selection.wishId];
                if (wish && wish.currentCapacity < wish.maxCapacity) {
                    assignments[user.id] = wish.id;
                    wish.currentCapacity++;
                    break;
                }
            }
        }

        // Étape 3 : Écrire les résultats en une seule fois
        const batch = db.batch();

        users.forEach(user => {
            const userRef = db.collection("users").doc(user.id);
            const assignedWishId = assignments[user.id];
            if (assignedWishId) {
                batch.update(userRef, { obtainedWishId: assignedWishId, status: "Validé" });
            } else {
                batch.update(userRef, { status: "NON AFFECTÉ" });
            }
        });

        Object.values(wishesCapacity).forEach(wish => {
            if (wish.currentCapacity !== wishes[wish.id].currentCapacity) {
                const wishRef = db.collection("wishes").doc(wish.id);
                batch.update(wishRef, { currentCapacity: wish.currentCapacity });
            }
        });

        await batch.commit();

        functions.logger.info("Algorithme d'affectation optimisé terminé.");
        return { message: "Algorithme d'affectation optimisé terminé avec succès." };

    } catch (error) {
        functions.logger.error("Erreur lors de l'exécution de l'algorithme optimisé :", error);
        throw new functions.https.HttpsError(
            "internal",
            "Une erreur est survenue lors de l'affectation."
        );
    }
});
