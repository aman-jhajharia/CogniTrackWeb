import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy } from "firebase/firestore";
import { db, auth } from "./firebase";

// Get reference to user's expenses collection
function getExpensesRef() {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");
    return collection(db, "users", user.uid, "expenses");
}

export async function addExpense(expenseData) {
    try {
        const expensesRef = getExpensesRef();
        const docRef = await addDoc(expensesRef, {
            ...expenseData,
            createdAt: new Date().toISOString()
        });
        return { id: docRef.id, ...expenseData };
    } catch (error) {
        console.error("Error adding expense:", error);
        throw error;
    }
}

export async function getExpenses() {
    try {
        const expensesRef = getExpensesRef();
        // Query expenses ordered by date descending
        const q = query(expensesRef, orderBy("date", "desc"));
        const snapshot = await getDocs(q);

        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting expenses:", error);
        throw error;
    }
}

export async function deleteExpense(expenseId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("User not authenticated");

        const expenseRef = doc(db, "users", user.uid, "expenses", expenseId);
        await deleteDoc(expenseRef);
    } catch (error) {
        console.error("Error deleting expense:", error);
        throw error;
    }
}
