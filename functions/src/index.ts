import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

/**
 * Sets a custom user claim to define a user as a professor.
 * This function should be secured to only be callable by an admin in a real application.
 */
export const setProfessorRole = functions.https.onCall(async (data, context) => {
    // For now, this is open to any authenticated user for testing purposes.
    // In a production app, you would check if the caller has an 'admin' role.
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const email = data.email;
    try {
        const user = await admin.auth().getUserByEmail(email);
        await admin.auth().setCustomUserClaims(user.uid, { professor: true });
        return { message: `Success! ${email} has been made a professor.` };
    } catch (error) {
        functions.logger.error("Error setting professor role:", error);
        throw new functions.https.HttpsError('internal', 'An error occurred while setting the role.');
    }
});

/**
 * Cloud Function déclenchable via HTTPS pour exécuter l'algorithme d'affectation.
 * Cette fonction doit être sécurisée pour n'être accessible que par les administrateurs.
 */
export const runAssignment = functions.https.onCall(async (data, context) => {
    if (!context.auth || !context.auth.token.professor) {
        throw new functions.https.HttpsError(
            'permission-denied',
            'The function must be called by a professor.'
        );
    }

    functions.logger.info("Starting the assignment algorithm...", {structuredData: true});

    try {
        const studentsSnapshot = await db.collection("students").orderBy("rank").get();
        const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as { name: string; rank: number } }));

        const wishesSnapshot = await db.collection("wishes").get();
        const wishes: { [key: string]: { name: string; places: number; assignedStudents: string[] } } = {};
        wishesSnapshot.forEach(doc => {
            const wishData = doc.data();
            wishes[doc.id] = {
                name: wishData.name,
                places: wishData.places,
                assignedStudents: []
            };
        });

        // Clear previous assignments
        const assignmentsSnapshot = await db.collection("assignments").get();
        const batch = db.batch();
        assignmentsSnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        functions.logger.info("Previous assignments cleared.");

        let unassignedStudents = 0;

        for (const student of students) {
            const studentWishesSnapshot = await db.collection("studentWishes").doc(student.id).get();
            const studentWishesData = studentWishesSnapshot.data();
            const wishIds = studentWishesData ? studentWishesData.wishes : [];

            let isAssigned = false;

            for (const wishId of wishIds) {
                const wish = wishes[wishId];
                if (wish && wish.assignedStudents.length < wish.places) {
                    wish.assignedStudents.push(student.id);
                    
                    const assignmentData = {
                        studentId: student.id,
                        studentName: student.name,
                        studentRank: student.rank,
                        wishId: wishId,
                        wishName: wish.name,
                    };

                    await db.collection("assignments").add(assignmentData);
                    isAssigned = true;
                    functions.logger.info(`Student ${student.name} (Rank: ${student.rank}) assigned to Wish ${wish.name}`);
                    break; // Move to the next student
                }
            }
            if (!isAssigned) {
                unassignedStudents++;
                functions.logger.warn(`Student ${student.name} (Rank: ${student.rank}) could not be assigned.`);
            }
        }

        const summary = {
            totalStudents: students.length,
            assignedStudents: students.length - unassignedStudents,
            unassignedStudents: unassignedStudents,
        };

        functions.logger.info("Assignment algorithm finished successfully.", summary);
        return { message: "Assignment algorithm finished successfully.", summary };

    } catch (error) {
        functions.logger.error("Error running the assignment algorithm:", error);
        throw new functions.https.HttpsError(
            'internal',
            'An error occurred while running the assignment.'
        );
    }
});
