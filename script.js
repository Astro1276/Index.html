import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const studentGrade = document.getElementById("student-grade");

async function loadRanking() {
    topStudentsList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const grade = parseFloat(data.grade) || 1;
        students.push({ id: doc.id, name: data.name || doc.id, grade: grade });
    });
    students.sort((a, b) => b.grade - a.grade);
    students.forEach((student, index) => {
        const li = document.createElement("li");
        let badgeClass = "";
        if (index === 0) badgeClass = "gold";
        else if (index === 1) badgeClass = "silver";
        else if (index === 2) badgeClass = "bronze";
        li.innerHTML = `<span class="student-name">${student.name}</span><span class="student-badge ${badgeClass}">${student.grade.toFixed(1)}</span>`;
        topStudentsList.appendChild(li);
    });
}

async function loadAdminTable() {
    adminStudentsTbody.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "students"));
    querySnapshot.forEach((documentSnapshot) => {
        const data = documentSnapshot.data();
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.name || "Sin nombre"}</td>
            <td>${documentSnapshot.id}</td>
            <td><input type="number" class="input-table-grade global-grade" min="1" max="5" step="0.1" value="${data.grade || 1}"></td>
            <td><button class="btn-save">Guardar</button></td>
        `;
        const saveBtn = tr.querySelector(".btn-save");
        saveBtn.addEventListener("click", async () => {
            let gradeVal = parseFloat(tr.querySelector(".global-grade").value);
            if (gradeVal < 1) gradeVal = 1;
            if (gradeVal > 5) gradeVal = 5;
            await updateDoc(doc(db, "students", documentSnapshot.id), {
                grade: gradeVal
            });
            alert("Nota actualizada");
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
            const grade = parseFloat(data.grade) || 1;
            studentGrade.textContent = grade.toFixed(1);
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
