import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyC5mkT_JX0bGE0Ves_aY1ivRI3vdQuY7s4",
    authDomain: "notas-e1f61.firebaseapp.com",
    projectId: "notas-e1f61",
    storageBucket: "notas-e1f61.firebasestorage.app",
    messagingSenderId: "14068896226",
    appId: "1:14068896226:web:009f9cc8c573dfa33469bb",
    measurementId: "G-9BCWCKKT2M"
}


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const loginContainer = document.getElementById("login-container");
const dashboardContainer = document.getElementById("dashboard-container");
const studentView = document.getElementById("student-view");
const adminView = document.getElementById("admin-view");
const loginForm = document.getElementById("login-form");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const topStudentsList = document.getElementById("top-students-list");
const userDisplay = document.getElementById("user-display");
const userRoleText = document.getElementById("user-role-text");
const logoutBtn = document.getElementById("logout-btn");
const adminStudentsTbody = document.getElementById("admin-students-tbody");
const studentGradesList = document.getElementById("student-grades-list");
const studentAverage = document.getElementById("student-average");

function calculateAverage(gradesArray) {
    if (!gradesArray || gradesArray.length === 0) return 1.0;
    const sum = gradesArray.reduce((acc, curr) => acc + curr, 0);
    return sum / gradesArray.length;
}

async function loadRanking() {
    topStudentsList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const grades = data.grades || [];
        const avg = calculateAverage(grades);
        students.push({ id: doc.id, name: data.name || doc.id, avg: avg });
    });
    students.sort((a, b) => b.avg - a.avg);
    students.forEach((student, index) => {
        const li = document.createElement("li");
        let badgeClass = "";
        if (index === 0) badgeClass = "gold";
        else if (index === 1) badgeClass = "silver";
        else if (index === 2) badgeClass = "bronze";
        li.innerHTML = `<span class="student-name">${student.name}</span><span class="student-badge ${badgeClass}">${student.avg.toFixed(1)}</span>`;
        topStudentsList.appendChild(li);
    });
}

async function loadAdminTable() {
    adminStudentsTbody.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "students"));
    querySnapshot.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        const grades = data.grades || [];
        const avg = calculateAverage(grades);
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.name || "Sin nombre"}</td>
            <td>${documentSnapshot.id}</td>
            <td><span class="history-text">${grades.length > 0 ? grades.join(" | ") : "Sin notas"}</span></td>
            <td><strong>${avg.toFixed(1)}</strong></td>
            <td><input type="number" class="input-table-grade new-grade-input" min="1" max="5" step="0.1" placeholder="0.0"></td>
            <td><button class="btn-save">Añadir</button></td>
        `;
        const saveBtn = tr.querySelector(".btn-save");
        saveBtn.addEventListener("click", async () => {
            const inputField = tr.querySelector(".new-grade-input");
            let newGrade = parseFloat(inputField.value);
            if (isNaN(newGrade)) {
                alert("Por favor ingresa una nota válida");
                return;
            }
            if (newGrade < 1) newGrade = 1;
            if (newGrade > 5) newGrade = 5;
            await updateDoc(doc(db, "students", documentSnapshot.id), {
                grades: arrayUnion(newGrade)
            });
            alert("Nueva nota añadida al historial");
            await loadAdminTable();
            loadRanking();
        });
        adminStudentsTbody.appendChild(tr);
    });
}

loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = usernameInput.value;
    const pass = passwordInput.value;
    if (user === "Admin" && pass === "1276") {
        loginContainer.classList.add("hidden");
        dashboardContainer.classList.remove("hidden");
        adminView.classList.remove("hidden");
        studentView.classList.add("hidden");
        userDisplay.textContent = "Administrador";
        userRoleText.textContent = "Rol: Profesor";
        await loadAdminTable();
    } else {
        const docRef = doc(db, "students", user);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().password === pass) {
            const data = docSnap.data();
            loginContainer.classList.add("hidden");
            dashboardContainer.classList.remove("hidden");
            studentView.classList.remove("hidden");
            adminView.classList.add("hidden");
            userDisplay.textContent = data.name || user;
            userRoleText.textContent = "Rol: Estudiante";
            const grades = data.grades || [];
            const avg = calculateAverage(grades);
            studentGradesList.textContent = grades.length > 0 ? grades.join(" , ") : "No tienes notas registradas";
            studentAverage.textContent = avg.toFixed(1);
        } else {
            alert("Credenciales incorrectas");
        }
    }
});

logoutBtn.addEventListener("click", () => {
    dashboardContainer.classList.add("hidden");
    loginContainer.classList.remove("hidden");
    loginForm.reset();
    loadRanking();
});

loadRanking();
