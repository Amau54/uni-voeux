"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAllocationAlgorithm = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
/**
 * Cloud Function déclenchable via HTTPS pour exécuter l'algorithme d'affectation.
 * Cette fonction doit être sécurisée pour n'être accessible que par les administrateurs.
 */
exports.runAllocationAlgorithm = functions.https.onRequest(async (request, response) => {
    functions.logger.info("Début de l'algorithme d'affectation...", { structuredData: true });
    try {
        // Étape 1 : Récupérer tous les étudiants, classés par leur rang.
        const usersSnapshot = await db.collection("users").orderBy("rank").get();
        const users = usersSnapshot.docs.map(doc => (Object.assign({ id: doc.id }, doc.data())));
        const allocationPromises = users.map(async (user) => {
            // Pour chaque utilisateur, récupérer ses choix de vœux, triés par priorité.
            const selectionsSnapshot = await db.collection("users").doc(user.id).collection("selections").orderBy("priority").get();
            const selections = selectionsSnapshot.docs.map(doc => doc.data());
            let isAssigned = false;
            for (const selection of selections) {
                // Utiliser une transaction pour garantir une lecture/écriture atomique sur un vœu.
                await db.runTransaction(async (transaction) => {
                    if (isAssigned)
                        return; // Si déjà assigné dans une transaction précédente, ne rien faire.
                    const wishRef = db.collection("wishes").doc(selection.wishId);
                    const wishDoc = await transaction.get(wishRef);
                    if (!wishDoc.exists)
                        return;
                    const wish = wishDoc.data();
                    // Étape 2 : Vérifier si le vœu a des places disponibles.
                    if (wish.currentCapacity < wish.maxCapacity) {
                        // Étape 3 : Affecter le vœu à l'étudiant.
                        transaction.update(wishRef, { currentCapacity: admin.firestore.FieldValue.increment(1) });
                        const userRef = db.collection("users").doc(user.id);
                        transaction.update(userRef, { obtainedWishId: wish.id, status: "Validé" });
                        isAssigned = true;
                        functions.logger.info(`Utilisateur ${user.id} affecté au vœu ${wish.id}`);
                    }
                });
                if (isAssigned) {
                    break; // Sortir de la boucle des vœux pour cet utilisateur.
                }
            }
            // Étape 4 : Gérer les étudiants non affectés.
            if (!isAssigned) {
                const userRef = db.collection("users").doc(user.id);
                await userRef.update({ status: "NON AFFECTÉ" });
                functions.logger.warn(`Utilisateur ${user.id} n'a pas pu être affecté.`);
            }
        });
        await Promise.all(allocationPromises);
        response.status(200).send({ message: "Algorithme d'affectation terminé avec succès." });
    }
    catch (error) {
        functions.logger.error("Erreur lors de l'exécution de l'algorithme :", error);
        response.status(500).send({ error: "Une erreur est survenue lors de l'affectation." });
    }
});
//# sourceMappingURL=index.js.map