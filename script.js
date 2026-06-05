import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, updateDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
};

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
const gradeHtml = document.getElementById("grade-html");
const gradeCss = document.getElementById("grade-css");
const gradeJs = document.getElementById("grade-js");
const gradeAverage = document.getElementById("grade-average");

async function loadRanking() {
    topStudentsList.innerHTML = "";
    const querySnapshot = await getDocs(collection(db, "students"));
    const students = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const html = parseFloat(data.html) || 1;
        const css = parseFloat(data.css) || 1;
        const js = parseFloat(data.js) || 1;
        const avg = (html + css + js) / 3;
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
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${data.name || documentSnapshot.id}</td>
            <td><input type="number" class="input-table-grade html-grade" min="1" max="5" step="0.1" value="${data.html || 1}"></td>
            <td><input type="number" class="input-table-grade css-grade" min="1" max="5" step="0.1" value="${data.css || 1}"></td>
            <td><input type="number" class="input-table-grade js-grade" min="1" max="5" step="0.1" value="${data.js || 1}"></td>
            <td><button class="btn-save">Guardar</button></td>
        `;
        const saveBtn = tr.querySelector(".btn-save");
        saveBtn.addEventListener("click", async () => {
            let htmlVal = parseFloat(tr.querySelector(".html-grade").value);
            let cssVal = parseFloat(tr.querySelector(".css-grade").value);
            let jsVal = parseFloat(tr.querySelector(".js-grade").value);
            if (htmlVal < 1) htmlVal = 1;
            if (htmlVal > 5) htmlVal = 5;
            if (cssVal < 1) cssVal = 1;
            if (cssVal > 5) cssVal = 5;
            if (jsVal < 1) jsVal = 1;
            if (jsVal > 5) jsVal = 5;
            await updateDoc(doc(db, "students", documentSnapshot.id), {
                html: htmlVal,
                css: cssVal,
                js: jsVal
            });
            alert("Notas actualizadas");
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
            const html = parseFloat(data.html) || 1;
            const css = parseFloat(data.css) || 1;
            const js = parseFloat(data.js) || 1;
            const avg = (html + css + js) / 3;
            gradeHtml.textContent = html.toFixed(1);
            gradeCss.textContent = css.toFixed(1);
            gradeJs.textContent = js.toFixed(1);
            gradeAverage.textContent = avg.toFixed(1);
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
                       
