/* FIREBASE */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore, collection, addDoc, onSnapshot,
  orderBy, query, deleteDoc, doc, getDocs
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

/* CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyAwH9t7ir6WkJrJK0S4jcoxeSQKN3PNgqI",
  authDomain: "database-visola.firebaseapp.com",
  projectId: "database-visola",
  storageBucket: "database-visola.firebasestorage.app",
  messagingSenderId: "722697883577",
  appId: "1:722697883577:web:b0f1090d6ef6f144f23068"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

/* DOM ELEMENTS */
const mathWrapper = document.getElementById("mathWrapper");
const chatWrapper = document.getElementById("chatWrapper");
const messagesDiv = document.getElementById("messages");
const msgInput = document.getElementById("msgInput");
const sendBtn = document.getElementById("sendBtn");
const clearBtn = document.getElementById("clearBtn");
const username = document.getElementById("username");
const avatar = document.getElementById("avatarURL");

/* LOAD PROFILE */
username.value = localStorage.getItem("chat_user") || "";
avatar.value = localStorage.getItem("chat_avatar") || "";

document.getElementById("saveProfile").onclick = () => {
  localStorage.setItem("chat_user", username.value);
  localStorage.setItem("chat_avatar", avatar.value);
  alert("Saved!");
};

/* SEND MESSAGE */
sendBtn.onclick = async () => {
  if (msgInput.value.trim() === "") return;

  await addDoc(messagesRef, {
    text: msgInput.value,
    user: username.value || "Unknown",
    avatar: avatar.value || "",
    time: Date.now()
  });

  msgInput.value = "";
};

/* ENTER TO SEND */
msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    sendBtn.click();
  }
});

/* RENDER MESSAGES */
const q = query(messagesRef, orderBy("time", "asc"));

onSnapshot(q, (snapshot) => {
  messagesDiv.innerHTML = "";

  snapshot.forEach((d) => {
    const msg = d.data();

    const div = document.createElement("div");
    div.className = "msg";

    const pfp = msg.avatar
      ? `<img src="${msg.avatar}">`
      : `<img style="background:#334155;">`;

    div.innerHTML = `
      ${pfp}
      <div class="msg-content">
        <div class="msg-header">
          <span>${msg.user}</span>
          <span>${new Date(msg.time).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}</span>
        </div>
        <div class="msg-text">${msg.text}</div>
      </div>
      <button class="delete-btn" data-id="${d.id}">✖</button>
    `;

    messagesDiv.appendChild(div);
  });

  // delete message
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.onclick = async () => {
      const pass = prompt("Admin password:");
      if (pass === "anthony11235") {
        await deleteDoc(doc(db, "messages", btn.dataset.id));
      } else alert("Wrong password");
    };
  });

  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

/* CLEAR ALL MESSAGES */
clearBtn.onclick = async () => {
  const pass = prompt("Admin password:");
  if (pass !== "anthony11235") return alert("Wrong password");

  const snap = await getDocs(messagesRef);
  for (let d of snap.docs) {
    await deleteDoc(doc(db, "messages", d.id));
  }
  alert("Chat cleared.");
};

/* MULTIPLICATION TABLE */
function buildMultiplicationTable() {
  const table = document.getElementById("multTable");
  table.innerHTML = "";

  for (let i = 1; i <= 12; i++) {
    const row = document.createElement("tr");
    for (let j = 1; j <= 12; j++) {
      const cell = document.createElement("td");
      const value = i * j;
      cell.textContent = value;

      if (value === 49) cell.id = "secret49";

      row.appendChild(cell);
    }
    table.appendChild(row);
  }
}
buildMultiplicationTable();

/* MATH PAGE SWITCH */
function switchMath(page) {
  const mc = document.getElementById("mathContent");

  if (page === "mult") {
    mc.innerHTML = "";
    buildMultiplicationTable();
    setTimeout(enableSecretTap, 400);
  }

  if (page === "quiz") {
    mc.innerHTML = `
      <h2>Random Math Quiz</h2>
      <p><b>Question:</b> <span id="quizQ"></span></p>
      <input id="quizA" placeholder="Answer">
      <button onclick="checkQuiz()">Check</button>
      <p id="quizR"></p>
    `;
    newQuizQuestion();
  }
}
// -----------------------------
// MOBILE LONG PRESS TO OPEN CHAT
// -----------------------------

let mobile = /Mobi|Android/i.test(navigator.userAgent);
let pressTimer;

function enableMobileHold() {
  const fracBtn = document.getElementById("fractionsBtn");
  if (!fracBtn) return;

  // Start press timer
  fracBtn.addEventListener("touchstart", () => {
    if (!mobile) return;
    pressTimer = setTimeout(() => {
      toggleChat(); // opens chat
    }, 2000); // 2 seconds
  });

  // Cancel if finger lifted early
  fracBtn.addEventListener("touchend", () => {
    clearTimeout(pressTimer);
  });

  fracBtn.addEventListener("touchmove", () => {
    clearTimeout(pressTimer); // if they slide finger away
  });
}

// Run after buttons exist
setTimeout(enableMobileHold, 500);

/* QUIZ GENERATOR */
let qNum1, qNum2, qOp, qCorrect;

function newQuizQuestion() {
  qNum1 = Math.floor(Math.random() * 20) - 5;
  qNum2 = Math.floor(Math.random() * 20) - 5;

  const ops = ["+", "-", "×", "÷"];
  qOp = ops[Math.floor(Math.random() * ops.length)];

  if (qOp === "+") qCorrect = qNum1 + qNum2;
  if (qOp === "-") qCorrect = qNum1 - qNum2;
  if (qOp === "×") qCorrect = qNum1 * qNum2;
  if (qOp === "÷") qCorrect = Number((qNum1 / qNum2).toFixed(2));

  document.getElementById("quizQ").textContent = `${qNum1} ${qOp} ${qNum2}`;
}

function checkQuiz() {
  const ans = document.getElementById("quizA").value.trim();
  const res = document.getElementById("quizR");

  if (ans == qCorrect) {
    res.textContent = "Correct!";
    res.style.color = "lightgreen";
  } else {
    res.textContent = `Wrong — ${qCorrect}`;
    res.style.color = "red";
  }

  setTimeout(() => {
    newQuizQuestion();
    res.textContent = "";
    document.getElementById("quizA").value = "";
  }, 900);
}

/* MOBILE TRIPLE TAP */
let tapCount = 0;
let tapTimer = null;
let mobileMode = /Mobi|Android/i.test(navigator.userAgent);

function enableSecretTap() {
  const cell = document.getElementById("secret49");
  if (!cell) return;

  cell.addEventListener("touchstart", () => {
    if (!mobileMode) return;

    tapCount++;

    if (tapTimer) clearTimeout(tapTimer);
    tapTimer = setTimeout(() => tapCount = 0, 350);

    if (tapCount === 3) {
      tapCount = 0;
      toggleChat();
    }
  });
}

setTimeout(enableSecretTap, 500);

/* CHAT OPEN/CLOSE LOGIC */
let chatOpen = false;

function toggleChat() {
  chatOpen = !chatOpen;

  if (chatOpen) {
    mathWrapper.classList.add("hidden");
    chatWrapper.classList.remove("hidden");
  } else {
    chatWrapper.classList.add("hidden");
    mathWrapper.classList.remove("hidden");
  }
}

/* P KEY FOR DESKTOP */
document.addEventListener("keydown", (e) => {
  if (document.activeElement === msgInput ||
      document.activeElement === username ||
      document.activeElement === avatar) return;

  if (e.key.toLowerCase() === "p") toggleChat();
});

/* iPHONE KEYBOARD SAFE-AREA FIX */
function updateVH() {
  let vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

updateVH();
window.addEventListener('resize', updateVH);
window.addEventListener('orientationchange', updateVH);

/* iPhone auto-scroll fix */
msgInput.addEventListener("focus", () => {
  setTimeout(() => {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }, 250);
});
