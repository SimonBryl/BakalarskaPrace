// === LOGIN ===
const loginForm = document.getElementById('login-form');
const messageDiv = document.getElementById('message');
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const userInfo = document.getElementById('user-info');
const adminSection = document.getElementById('admin-section');
const teacherSection = document.getElementById('teacher-section');

// === PŘIDÁVÁNÍ KNIH ===
const addBookBtn = document.getElementById('add-book-btn');
const addBookSection = document.getElementById('add-book-section');
const manualBookForm = document.getElementById('manual-book-form');
const csvBookForm = document.getElementById('csv-book-form');
const manualAddBtn = document.getElementById('manual-add-btn');
const csvAddBtn = document.getElementById('csv-add-btn');
const backBtn = document.getElementById('back-btn');

//úprava knih
const editBooksBtn = document.getElementById("edit-books-btn");
const editBooksSection = document.getElementById("edit-books-section");
const booksList = document.getElementById("books-list");
const backToAdminBtn = document.getElementById("back-to-admin-btn");

//vytvoření výpůjčky
const createLoanBtn = document.getElementById("create-loan");
const createLoanSection = document.getElementById("create-loan-section");
const backToAdminFromLoan = document.getElementById("back-to-admin-from-loan");
const booksResults = document.getElementById("booksResults");
const studentsResults = document.getElementById("studentsResults");
const vybranaKniha = document.getElementById("vybranaKniha");
const vybranyStudent = document.getElementById("vybranyStudent");
const datumVraceni = document.getElementById("datumVraceni");
const btnVypujcit = document.getElementById("btnVypujcit");
const btnZpet = document.getElementById("btnZpet");
const typKnihovny = document.getElementById("typKnihovny");
const searchZanr = document.getElementById("searchZanr");
const searchNazev = document.getElementById("searchNazev");
const searchAutor = document.getElementById("searchAutor");
const searchJmeno = document.getElementById("searchJmeno");
const searchPrijmeni = document.getElementById("searchPrijmeni");

// --- Otevření sekce pro vrácení knih ---
const returnLoanSection = document.getElementById("return-loan-section");
const returnLoanList = document.getElementById("return-loan-list");
const backFromReturnLoan = document.getElementById("back-from-return-loan");
const returnLoanBtn = document.getElementById("return-loan-btn");
const loansEvidenceSection = document.getElementById("loans-evidence-section");
const backFromLoans = document.getElementById("back-from-loans");

const loansTableBody = document.querySelector("#loans-table tbody");
const upcomingLoansBody = document.querySelector("#upcoming-loans-table tbody");

const loanStatusSelect = document.getElementById("loan-status");
const searchBook = document.getElementById("searchBook");
const searchStudent = document.getElementById("searchStudent");




// --- Rezervace vypůjčené knihy ---

const reserveLoanSection = document.getElementById("reserve-loan-section");
const backFromReserveLoan = document.getElementById("back-from-reserve-loan");
const reserveLoansTableBody = document.querySelector("#reserve-loans-table tbody");



const twoFAContainer = document.getElementById("twofa-container");
const twoFAForm = document.getElementById("twofa-form");
const pending2FATokenInput = null;
const API_BASE = "https://library-backend-obtm.onrender.com"

let pending2FAToken = null;

loginForm.addEventListener("submit", async e => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const data = await res.json();

    if (!res.ok) {
      messageDiv.textContent = data.message || "Přihlášení selhalo";
      return;
    }

    if (data.twoFA) {
      // přepni na 2FA formulář
      messageDiv.textContent = "";
      loginContainer.classList.add("hidden");
      twoFAContainer.classList.remove("hidden");
      pending2FAToken = data.token;
      return;
    }

    // normální přihlášení
    localStorage.setItem("accessToken", data.token);
    showApp(data.username, data.role);

  } catch (err) {
    messageDiv.textContent = "Chyba při přihlašování";
    console.error(err);
  }
});

twoFAForm.addEventListener("submit", async e => {
  e.preventDefault();
  const code = document.getElementById("twofa-code").value.trim();

  try {
    const res = await fetch(`${API_BASE}/auth/verify-2fa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: pending2FAToken, code }),
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message);
      if (data.message.includes("vypršel") || data.message.includes("Příliš")) {
        twoFAContainer.classList.add("hidden");
        loginContainer.classList.remove("hidden");
      }
      return;
    }

    // 2FA úspěšná → uložit JWT
    localStorage.setItem("accessToken", data.token);
    twoFAContainer.classList.add("hidden");
    showApp(data.username, data.role);

  } catch (err) {
    alert("Chyba při ověřování 2FA");
    console.error(err);
  }
});

function showApp(username, role) {
  loginContainer.classList.add("hidden");
  twoFAContainer.classList.add("hidden");
  appContainer.classList.remove("hidden");
  

  if (role === 'vedouci') {
    adminSection.classList.remove('hidden');
    teacherSection.classList.add('hidden');
  } else if (role === 'pozorovatel') {
    adminSection.classList.add('hidden');
    teacherSection.classList.remove('hidden');
  }
}

// === ODHLÁŠENÍ ===
document.getElementById('logout-btn').addEventListener('click', () => {
  appContainer.classList.add('hidden');
  loginContainer.classList.remove('hidden');
  loginForm.reset();
  messageDiv.textContent = '';
  adminSection.classList.add('hidden');
  teacherSection.classList.add('hidden');
});

// === OTEVŘENÍ SEKCE PRO PŘIDÁNÍ KNIHY ===
addBookBtn.addEventListener('click', () => {
  appContainer.classList.add('hidden');
  addBookSection.classList.remove('hidden');
});

// === PŘEPÍNAČE MEZI FORMULÁŘI ===
manualAddBtn.addEventListener('click', () => {
  manualBookForm.classList.remove('hidden');
  csvBookForm.classList.add('hidden');
});

csvAddBtn.addEventListener('click', () => {
  csvBookForm.classList.remove('hidden');
  manualBookForm.classList.add('hidden');
});

// === ZPĚT DO ADMIN SEKCE ===
backBtn.addEventListener('click', () => {
  addBookSection.classList.add('hidden');
  appContainer.classList.remove('hidden');
});


// === PŘIDÁNÍ JEDNÉ KNIHY ===
manualBookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const author = document.getElementById('book-author').value;
  const title = document.getElementById('book-title').value;
  const genre = document.getElementById('book-genre').value;
  const libraryType = document.getElementById('library-type').value;

  try {
    const res = await fetch(`${API_BASE}/booksHandle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, title, genre, libraryType })
    });
    const data = await res.json();

    if (!res.ok) {
      alert(data.message || 'Nepodařilo se přidat knihu.');
      return;
    }

    alert('Kniha byla úspěšně přidána!');
    manualBookForm.reset();
  } catch (err) {
    console.error(err);
    alert('Chyba při přidávání knihy.');
  }
});


// === PŘIDÁNÍ KNIH Z CSV ===
const csvFileInput = document.getElementById('csv-file');
const csvUploadBtn = document.getElementById('csv-upload-btn');

csvBookForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = csvFileInput.files[0];

  if (!file) {
    alert('Vyberte CSV soubor.');
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch(`${API_BASE}/booksCsv`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.message || 'Nepodařilo se přidat knihy z CSV.');
      return;
    }

    alert('CSV bylo zpracováno!');
    csvBookForm.reset();
  } catch (err) {
    console.error(err);
    alert('Chyba při nahrávání CSV souboru.');
  }
});



// otevření sekce pro úpravu knih
editBooksBtn.addEventListener("click", () => {
  appContainer.classList.add("hidden");
  editBooksSection.classList.remove("hidden");
  loadBooks();
});

// zpět do admin sekce
backToAdminBtn.addEventListener("click", () => {
  editBooksSection.classList.add("hidden");
  appContainer.classList.remove("hidden");
});

async function loadBooks() {
  booksList.innerHTML = "";

  try {
    const res = await fetch(`${API_BASE}/edit/books`);
    const books = await res.json();

    books.forEach(book => {
      // Hlavní řádek s údaji
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${book.autor}</td>
        <td>${book.nazev}</td>
        <td>${book.zanr}</td>
        <td>${book.typ_knihovny}</td>
        <td>${book.stav}</td>
        <td>
          <button class="edit-btn">Upravit</button>
          <button class="delete-btn">Odstranit</button>
        </td>
      `;

      // Skrytý řádek s editačními poli
      const editRow = document.createElement("tr");
      editRow.classList.add("hidden", "edit-row");
      editRow.innerHTML = `
        <td><input type="text" value="${book.autor}"></td>
        <td><input type="text" value="${book.nazev}"></td>
        <td><input type="text" value="${book.zanr}"></td>
        <td>
          <select>
            <option value="zak" ${book.typ_knihovny === 'zak' ? 'selected' : ''}>zak</option>
            <option value="ucitel" ${book.typ_knihovny === 'ucitel' ? 'selected' : ''}>ucitel</option>
          </select>
        </td>
        <td></td> <!-- stav se neupravuje -->
        <td><button class="save-btn">Uložit</button></td>
      `;

      // Logika tlačítek
      row.querySelector(".edit-btn").addEventListener("click", () => {
        editRow.classList.toggle("hidden");
      });

      row.querySelector(".delete-btn").addEventListener("click", async () => {
        if (confirm(`Opravdu chcete odstranit knihu "${book.nazev}"?`)) {
          try {
            const res = await fetch(`${API_BASE}/edit/books/${book.id_kniha}`, {
              method: "DELETE"
            });
            if (!res.ok) throw new Error("Mazání selhalo");
            row.remove();
            editRow.remove();
            alert("Kniha odstraněna.");
          } catch (err) {
            console.error(err);
            alert("Chyba při mazání knihy.");
          }
        }
      });

      editRow.querySelector(".save-btn").addEventListener("click", async () => {
        const inputs = editRow.querySelectorAll("input, select"); // přidán select
        const updatedBook = {
          autor: inputs[0].value,
          nazev: inputs[1].value,
          zanr: inputs[2].value,
          typ_knihovny: inputs[3].value
        };

        try {
          const res = await fetch(`${API_BASE}/edit/books/${book.id_kniha}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedBook)
          });

          if (!res.ok) throw new Error("Úprava selhala");

          // přepsání hodnot v hlavním řádku
          row.children[0].textContent = updatedBook.autor;
          row.children[1].textContent = updatedBook.nazev;
          row.children[2].textContent = updatedBook.zanr;
          row.children[3].textContent = updatedBook.typ_knihovny;

          alert("Změny uloženy.");
          editRow.classList.add("hidden");
        } catch (err) {
          console.error(err);
          alert("Chyba při úpravě knihy.");
        }
      });

      booksList.appendChild(row);
      booksList.appendChild(editRow);
    });
  } catch (err) {
    console.error("Chyba při načítání knih:", err);
    alert("Nepodařilo se načíst knihy.");
  }
}

//VÝPŮJČKY
// ===== Načtení knih ze serveru =====
// ===== VÝPŮJČKY =====

let selectedBook = null;
let selectedStudent = null;
// ===== Otevření sekce vytvoření výpůjčky =====
createLoanBtn.addEventListener("click", async () => {
  appContainer.classList.add("hidden");
  createLoanSection.classList.remove("hidden");
  await filterBooks();
  await filterStudents();
});

// ===== Fetch knih a studentů =====
async function fetchBooks() {
  try {
    const res = await fetch(`${API_BASE}/createLoan/books`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

async function fetchStudents() {
  try {
    const res = await fetch(`${API_BASE}/createLoan/students`, {
      headers: {
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      }
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}


// ===== Render knih =====
function renderBooks(books) {
  booksResults.innerHTML = "";
  books.forEach(book => {
    const div = document.createElement("div");
    div.classList.add("book-item");
    div.style.display = "flex";           // flex řádek
    div.style.justifyContent = "space-between"; // text vlevo, tlačítko vpravo
    div.style.alignItems = "center";
    div.innerHTML = `
      <span>${book.autor} - ${book.nazev} (${book.stav})</span>
      <button class="vybrat-knihu">Vybrat</button>
    `;
    div.querySelector(".vybrat-knihu").addEventListener("click", () => {
      selectedBook = book;
      vybranaKniha.value = `${book.autor} - ${book.nazev}`;
    });
    booksResults.appendChild(div);
  });
}

// ===== Render studentů =====
function renderStudents(students) {
  studentsResults.innerHTML = "";
  students.forEach(student => {
    const div = document.createElement("div");
    div.classList.add("student-item");
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.innerHTML = `
      <span>${student.name} ${student.surname}, narozen: ${student.datum_narozeni}</span>
      <button class="vybrat-studenta">Vybrat</button>
    `;
    div.querySelector(".vybrat-studenta").addEventListener("click", () => {
      selectedStudent = student;
      vybranyStudent.value = `${student.name} ${student.surname}`;
    });
    studentsResults.appendChild(div);
  });
}

// ===== Filtrování knih a studentů =====
async function filterBooks() {
  const allBooks = await fetchBooks();
  const filtered = allBooks.filter(b =>
    (!typKnihovny.value || b.typ_knihovny === typKnihovny.value) &&
    (!searchZanr.value || b.zanr.toLowerCase().includes(searchZanr.value.toLowerCase())) &&
    (!searchNazev.value || b.nazev.toLowerCase().includes(searchNazev.value.toLowerCase())) &&
    (!searchAutor.value || b.autor.toLowerCase().includes(searchAutor.value.toLowerCase()))
  );
  renderBooks(filtered);
}

async function filterStudents() {
  const allStudents = await fetchStudents();
  const filtered = allStudents.filter(s =>
    (!searchJmeno.value || (s.name || "").toLowerCase().includes(searchJmeno.value.toLowerCase())) &&
    (!searchPrijmeni.value || (s.surname || "").toLowerCase().includes(searchPrijmeni.value.toLowerCase()))
  );
  renderStudents(filtered);
}

// ===== Event listenery pro filtrování =====
[typKnihovny, searchZanr, searchNazev, searchAutor].forEach(el =>
  el.addEventListener("input", filterBooks)
);
[searchJmeno, searchPrijmeni].forEach(el =>
  el.addEventListener("input", filterStudents)
);

// ===== Vytvoření výpůjčky =====
btnVypujcit.addEventListener("click", async () => {
  if (!selectedBook || !selectedStudent || !datumVraceni.value) {
    alert("Vyberte knihu, studenta a datum vrácení.");
    return;
  }

  const loanData = {
    knihaId: selectedBook.id_kniha,        // backend čeká knihaId
    studentId: selectedStudent.id_zak, // backend čeká studentId
    datumVraceni: datumVraceni.value,      // backend čeká datumVraceni
    datumVypujceni: new Date().toISOString().split("T")[0] // volitelně dnešní datum
  };

  console.log("Odesílám půjčku:", loanData);

  try {
    const res = await fetch(`${API_BASE}/createLoan/loans`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + localStorage.getItem("accessToken")
      },
      body: JSON.stringify(loanData)
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.message || "Nepodařilo se vytvořit výpůjčku.");
      return;
    }

    alert("Výpůjčka úspěšně vytvořena!");
    createLoanSection.classList.add("hidden");
    appContainer.classList.remove("hidden");

  } catch (err) {
    console.error(err);
    alert("Chyba při vytváření výpůjčky.");
  }
});





// ===== Zpět do admin sekce =====
btnZpet.addEventListener("click", () => {
  createLoanSection.classList.add("hidden");
  appContainer.classList.remove("hidden");
});

// ===== CSS posuvník pro seznam knih a studentů =====
booksResults.style.maxHeight = "300px";
booksResults.style.overflowY = "auto";
studentsResults.style.maxHeight = "300px";
studentsResults.style.overflowY = "auto";



// --- Otevření sekce pro vrácení knih ---

  returnLoanBtn.addEventListener("click", async () => {
    appContainer.classList.add("hidden");
    returnLoanSection.classList.remove("hidden");
    await loadReturnLoans();
  });
  


// --- Zpět ---
backFromReturnLoan.addEventListener("click", () => {
  returnLoanSection.classList.add("hidden");
  appContainer.classList.remove("hidden");
});

// --- Načtení nevrácených výpůjček ---
async function fetchReturnLoans() {
  try {
    const res = await fetch(`${API_BASE}/returnS`, {
      headers: { "Authorization": "Bearer " + localStorage.getItem("accessToken") }
    });
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
}

// --- Render výpůjček ---
async function loadReturnLoans() {
  const allLoans = await fetchReturnLoans();
  const filtered = allLoans.filter(l =>
    (!searchReturnJmeno.value || (l.name || "").toLowerCase().includes(searchReturnJmeno.value.toLowerCase())) &&
    (!searchReturnPrijmeni.value || (l.surname || "").toLowerCase().includes(searchReturnPrijmeni.value.toLowerCase()))
  );

  returnLoanList.innerHTML = "";
  filtered.forEach(loan => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${loan.nazev}</td>
      <td>${loan.autor}</td>
      <td>${loan.datum_vypujceni}</td>
      <td>${loan.predpoklad_datum_vraceni}</td>
      <td>${loan.name}</td>
      <td>${loan.surname}</td>
      <td>${loan.datum_narozeni}</td>
      <td><button class="return-btn">Vrátit</button></td>
    `;

    tr.querySelector(".return-btn").addEventListener("click", async () => {
      if (confirm(`Opravdu chcete vrátit knihu "${loan.nazev}" půjčenou ${loan.name} ${loan.surname}?`)) {
        try {
          const res = await fetch(`${API_BASE}/returnS/${loan.id_loan}`, {
            method: "PUT",
            headers: {
              "Authorization": "Bearer " + localStorage.getItem("accessToken")
            }
          });
          if (!res.ok) throw new Error("Vrácení selhalo");
          alert("Kniha byla vrácena.");
          await loadReturnLoans(); // znovu načíst tabulku
        } catch (err) {
          console.error(err);
          alert("Chyba při vracení knihy.");
        }
      }
    });

    returnLoanList.appendChild(tr);
  });
}

// --- Filtrování podle jména/příjmení ---
const searchReturnJmeno = document.getElementById("searchReturnJmeno");
const searchReturnPrijmeni = document.getElementById("searchReturnPrijmeni");

[searchReturnJmeno, searchReturnPrijmeni].forEach(el =>
  el.addEventListener("input", loadReturnLoans)
);



document.addEventListener("DOMContentLoaded", () => {
  const loansEvidenceBtns = document.querySelectorAll(".evidence");
  const loansEvidenceSection = document.getElementById("loans-evidence-section");
  const backFromLoans = document.getElementById("back-from-loans");
  const appContainer = document.getElementById("app-container"); // hlavní menu

  const loanStatus = document.getElementById("loan-status");
  const searchBook = document.getElementById("searchBook");
  const searchStudent = document.getElementById("searchStudent");
  const loansTableBody = document.querySelector("#loans-table tbody");
  const upcomingLoansBody = document.querySelector("#upcoming-loans-table tbody"); // NOVÉ

  let allLoans = [];

  // Přepnutí na evidenci
  loansEvidenceBtns.forEach(btn => {
  btn.addEventListener("click", async() => {
    appContainer.classList.add("hidden");
    loansEvidenceSection.classList.remove("hidden");
    await loadLoans();
  });
  });

  // Zpět do menu
  backFromLoans.addEventListener("click", () => {
    loansEvidenceSection.classList.add("hidden");
    appContainer.classList.remove("hidden");
  });


// Načtení výpůjček z backendu
async function loadLoans() {
  try {
    const response = await fetch(`${API_BASE}/evidence/loans`);
    const data = await response.json();
    allLoans = data;
    renderLoans();
  } catch (err) {
    console.error("Chyba při načítání výpůjček:", err);
  }
}

// Vykreslení tabulky podle filtrů
function renderLoans() {
  const status = loanStatus.value; // vypujcene / vracene
  const bookFilter = searchBook.value.toLowerCase();
  const studentFilter = searchStudent.value.toLowerCase();

  loansTableBody.innerHTML = "";
  if (upcomingLoansBody) upcomingLoansBody.innerHTML = ""; // upozornění na vrácení

  const today = new Date();
  const sevenDaysLater = new Date();
  sevenDaysLater.setDate(today.getDate() + 7);

  const filtered = allLoans.filter((loan) => {
    // filtr podle statusu (jen podle real_datum_vraceni)
    if (status === "vypujcene" && loan.real_datum_vraceni) return false;
    if (status === "vracene" && !loan.real_datum_vraceni) return false;

    // filtr podle knihy
    const bookMatch =
      (loan.Books?.nazev || "").toLowerCase().includes(bookFilter) ||
      (loan.Books?.autor || "").toLowerCase().includes(bookFilter);

    // filtr podle studenta/učitele
    const borrowerName = loan.Zak
      ? `${loan.Zak.name} ${loan.Zak.surname}`
      : loan.Users
        ? `${loan.Users.name} ${loan.Users.surname}`
        : "";
    const studentMatch = borrowerName.toLowerCase().includes(studentFilter);

    return bookMatch && studentMatch;
  });

  filtered.forEach((loan) => {
    // hlavní tabulka
    const borrowerName = loan.Zak
      ? `${loan.Zak.name}`
      : loan.Users
        ? `${loan.Users.name}`
        : "";
    const borrowerSurname = loan.Zak
       ? `${loan.Zak.surname}`
      : loan.Users
        ? ` ${loan.Users.surname}`
        : "";
    const bookmaster =loan.Users
        ? `${loan.Users.name} ${loan.Users.surname}`:"";
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${loan.Books?.nazev || ""}</td>
      <td>${loan.Books?.autor || ""}</td>
      <td>${loan.predpoklad_datum_vraceni ? new Date(loan.predpoklad_datum_vraceni).toLocaleDateString() : ""}</td>
      <td>${borrowerName}</td>
      <td>${borrowerSurname}</td>
      <td>${bookmaster}</td>
    `;
    loansTableBody.appendChild(tr);

    // upozornění na vrácení do 7 dnů
    if (!loan.real_datum_vraceni && loan.predpoklad_datum_vraceni && upcomingLoansBody) {
      const dueDate = new Date(loan.predpoklad_datum_vraceni);
      if (dueDate >= today && dueDate <= sevenDaysLater) {
        const upcomingBorrowerName = loan.Zak
          ? `${loan.Zak.name}`
          : loan.Users
            ? `${loan.Users.name}`
            : "";
        const upcomingBorrowerSurname = loan.Zak
          ? `${loan.Zak.surname}`
          : loan.Users
            ? `${loan.Users.surname}`
            : "";

        const upTr = document.createElement("tr");
        upTr.innerHTML = `
          <td>${loan.Books?.nazev || ""}</td>
          <td>${loan.Books?.autor || ""}</td>
          <td>${dueDate.toLocaleDateString()}</td>
          <td>${upcomingBorrowerName}</td>
          <td>${upcomingBorrowerSurname}</td>
        `;
        upcomingLoansBody.appendChild(upTr);
      }
    }
  });
}

// posluchače statusu a filtrů
loanStatus.addEventListener("change", renderLoans);
searchBook.addEventListener("input", renderLoans);
searchStudent.addEventListener("input", renderLoans);

});


// --- Rezervace vypůjčené knihy ---
document.addEventListener("DOMContentLoaded", () => {
  const reserveLoanBtn = document.querySelectorAll(".reserve-loan-btn");
  reserveLoanBtn.forEach(btn => {
  btn.addEventListener("click", async() => {
  appContainer.classList.add("hidden");
  reserveLoanSection.classList.remove("hidden");

  const token = localStorage.getItem("accessToken");

  try {
    const res = await fetch(`${API_BASE}/reservation/res`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const loans = await res.json();

    // vyčisti tabulku
    reserveLoansTableBody.innerHTML = "";

    loans.forEach(loan => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${loan.nazev}</td>
        <td>${loan.autor}</td>
        <td>${loan.predpoklad_datum_vraceni}</td>
        <td><button class="reserve-btn">Provést rezervaci</button></td>
      `;

      // logika rezervace
      tr.querySelector(".reserve-btn").addEventListener("click", async () => {
        const confirmReserve = confirm(
          `Opravdu chcete rezervovat knihu ${loan.nazev} od ${loan.autor}?`
        );
        if (!confirmReserve) return;

        const today = new Date().toISOString().split("T")[0];

        const res = await fetch(`${API_BASE}/reservation/res`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            nazev_knihy: loan.nazev,
            datum_rezervace: today
          })
        });

        const data = await res.json();
        if (res.ok) {
          alert("Rezervace byla úspěšně vytvořena.");
        } else {
          alert("Chyba: " + data.message);
        }
      });

      reserveLoansTableBody.appendChild(tr);
    });

    // --- vyhledávání podle názvu nebo autora ---
    const searchInput = document.getElementById("searchReserveBook");
    searchInput.addEventListener("input", () => {
      const filter = searchInput.value.toLowerCase();

      Array.from(reserveLoansTableBody.querySelectorAll("tr")).forEach(tr => {
        const nazev = tr.children[0].textContent.toLowerCase();
        const autor = tr.children[1].textContent.toLowerCase();

        if (nazev.includes(filter) || autor.includes(filter)) {
          tr.style.display = "";
        } else {
          tr.style.display = "none";
        }
      });
    });

  } catch (err) {
    console.error(err);
    alert("Nepodařilo se načíst výpůjčky.");
  }
});
});

backFromReserveLoan.addEventListener("click", () => {
  reserveLoanSection.classList.add("hidden");
  appContainer.classList.remove("hidden");
});
});



document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app-container");
  const loanReserveLoanBtn =document.querySelectorAll(".loan-reserve-loan-btn");
  const loanReserveLoanSection = document.getElementById("loan-reserve-loan-section");
  const backFromLoanReserve = document.getElementById("btnBackFromLoanReserve");

  const reserveTableBody = document.querySelector("#loan-reserve-loan-table tbody");
  const selectedTitleInput = document.getElementById("vybranyNazev");
  const selectedAuthorInput = document.getElementById("vybranyAutor");
const loanReserveBtn = document.getElementById("btnLoanReserve");

  let selectedBookId = null; // uchováme id vybrané knihy
  const token = localStorage.getItem("accessToken"); // token uložený po přihlášení

  // Zobrazí sekci "Vypůjčení rezervované knihy"
  loanReserveLoanBtn.forEach(btn => {
  btn.addEventListener("click", async() => {
    appContainer.classList.add("hidden");
    loanReserveLoanSection.classList.remove("hidden");

// Načti rezervace z backendu
    try {
     const res = await fetch(`${API_BASE}/loanreservation/reservations`, {
  headers: {
    "Authorization": "Bearer " + localStorage.getItem("accessToken"),
    "Content-Type": "application/json"
  }
});
      if (!res.ok) throw new Error("Chyba při načítání rezervací");

      const reservations = await res.json();
      reserveTableBody.innerHTML = ""; // vyčisti tabulku

      reservations.forEach(res => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${res.nazev}</td>
          <td>${res.autor}</td>
          <td><button class="select-reserve-btn">Vybrat</button></td>
        `;

        const selectBtn = tr.querySelector(".select-reserve-btn");
        selectBtn.addEventListener("click", () => {
          selectedTitleInput.value = res.nazev;
          selectedAuthorInput.value = res.autor;
          selectedBookId = res.id_kniha; // uložíme id knihy
        });

        reserveTableBody.appendChild(tr);
      });
    } catch (err) {
      console.error("Chyba při načítání rezervací:", err);
      reserveTableBody.innerHTML = `<tr><td colspan="3">Nepodařilo se načíst rezervace.</td></tr>`;
    }
  });
  });

  // Tlačítko Zpět
  backFromLoanReserve.addEventListener("click", () => {
    loanReserveLoanSection.classList.add("hidden");
    appContainer.classList.remove("hidden");
  });

  // Potvrzení výpůjčky
  loanReserveBtn.addEventListener("click", async () => {
    const date = document.getElementById("datumPredpoklad").value;

    if (!selectedBookId || !date) {
      alert("Vyberte knihu a vyplňte datum");
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/loanreservation/loanReserved `, {
        method: "POST",
        headers: { 
          "Authorization": "Bearer " + localStorage.getItem("accessToken"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id_kniha: selectedBookId, datumVraceni: date })
      });

      if (!response.ok) throw new Error("Chyba při vytváření výpůjčky");

      alert("Rezervovaná kniha byla úspěšně vypůjčena!");
      selectedBookId = null;
      selectedTitleInput.value = "";
      selectedAuthorInput.value = "";
      document.getElementById("datumPredpoklad").value = "";
    } catch (err) {
      console.error("Chyba při vytváření výpůjčky:", err);
      alert("Nepodařilo se vytvořit výpůjčku");
    }
  });
});


//učitel loan sekce
// učitel loan sekce
document.addEventListener("DOMContentLoaded", () => {
  let selectedBook = null;

  // Změna typu knihovny -> načíst knihy
  document.getElementById("typKnihovnyTeacher").addEventListener("change", async () => {
    await loadBooks();
  });

  // Vyhledávání
  ["searchTeacherZanr", "searchTeacherNazev", "searchTeacherAutor"].forEach(id => {
    document.getElementById(id).addEventListener("input", () => {
      loadBooks();
    });
  });

  async function loadBooks() {
    const typKnihovny = document.getElementById("typKnihovnyTeacher").value;
    const searchZanr = document.getElementById("searchTeacherZanr").value.toLowerCase();
    const searchNazev = document.getElementById("searchTeacherNazev").value.toLowerCase();
    const searchAutor = document.getElementById("searchTeacherAutor").value.toLowerCase();

    try {
      const res = await fetch(`${API_BASE}/loanteacher/books/${typKnihovny}`, {
        headers: { "Authorization": "Bearer " + localStorage.getItem("accessToken") }
      });
      if (!res.ok) throw new Error("Chyba při načítání knih");
      let books = await res.json();

      // odfiltruj vypůjčené a rezervované
      books = books.filter(b => b.stav !== "vypujceno" && b.stav !== "rezervace");

      // filtr vyhledáváním
      books = books.filter(b =>
        b.nazev.toLowerCase().includes(searchNazev) &&
        b.autor.toLowerCase().includes(searchAutor) &&
        b.zanr.toLowerCase().includes(searchZanr)
      );

      renderBooks(books);
    } catch (err) {
      console.error("Chyba při načítání knih:", err);
    }
  }

  function renderBooks(books) {
    const container = document.getElementById("booksResultsTeacher");
    container.innerHTML = "";

    const table = document.createElement("table");
    table.id = "books-table";
    const thead = document.createElement("thead");
    thead.innerHTML = `
      <tr>
        <th>Název</th>
        <th>Autor</th>
        <th>Žánr</th>
        <th>Akce</th>
      </tr>`;
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    books.forEach(book => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${book.nazev}</td>
        <td>${book.autor}</td>
        <td>${book.zanr}</td>
        <td><button class="select-book-btn">Vybrat</button></td>
      `;

      tr.querySelector(".select-book-btn").addEventListener("click", () => {
        document.getElementById("vybranaKnihaTeacher").value = `${book.nazev} - ${book.autor}`;
        selectedBook = book;
      });

      tbody.appendChild(tr);
    });

    table.appendChild(tbody);
    container.appendChild(table);
  }

  // Vytvoření výpůjčky
  document.getElementById("btnVypujcitTeacher").addEventListener("click", async () => {
    if (!selectedBook) {
      alert("Vyberte knihu!");
      return;
    }

    const datumVraceni = document.getElementById("datumVraceniTeacher").value;
    if (!datumVraceni) {
      alert("Zadejte datum vrácení!");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/loanteacher/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + localStorage.getItem("accessToken")
        },
        body: JSON.stringify({
          id_kniha: selectedBook.id_kniha,
          predpoklad_datum_vraceni: datumVraceni
        })
      });

      if (!res.ok) throw new Error("Chyba při vytváření výpůjčky");
      alert("Výpůjčka byla vytvořena!");
      document.getElementById("btnZpetTeacher").click();
    } catch (err) {
      console.error("Chyba při vytváření výpůjčky:", err);
      alert("Nepodařilo se vytvořit výpůjčku.");
    }
  });

  // Zpět
  document.getElementById("btnZpetTeacher").addEventListener("click", () => {
    document.getElementById("create-loan-teacher-section").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");
    selectedBook = null;
  });

  // Načti knihy při otevření sekce pro učitele
  const createloanteacherbtn = document.querySelectorAll(".create-loan-teacher-btn");
  createloanteacherbtn.forEach(btn => {
  btn.addEventListener("click", async() => {
    document.getElementById("app-container").classList.add("hidden");
    document.getElementById("create-loan-teacher-section").classList.remove("hidden");
    await loadBooks();
  });
  });
});

// -------------------
// VRACENÍ KNIH UČITELEM
// -------------------

document.addEventListener("DOMContentLoaded", () => {
  const appContainer = document.getElementById("app-container");
  const returnLoanTeacherBtn = document.querySelectorAll(".return-loan-teacher-btn");
  const returnLoanTeacherSection = document.getElementById("return-loan-teacher-section");
  const returnLoanTeacherList = document.getElementById("return-loan-teacher-list");
  const backFromReturnTeacher = document.getElementById("back-from-return-teacher");

  if (returnLoanTeacherBtn) {
    returnLoanTeacherBtn.forEach(btn => {
  btn.addEventListener("click", async() => {
      appContainer.classList.add("hidden");
      returnLoanTeacherSection.classList.remove("hidden");
      await loadTeacherLoans();
    });
    });
  }

  if (backFromReturnTeacher) {
    backFromReturnTeacher.addEventListener("click", () => {
      returnLoanTeacherSection.classList.add("hidden");
      appContainer.classList.remove("hidden");
    });
  }

  async function loadTeacherLoans() {
    returnLoanTeacherList.innerHTML = "";

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        returnLoanTeacherList.innerHTML = `<tr><td colspan="4" style="color:red;">Chybí přihlášení</td></tr>`;
        return;
      }

      const res = await fetch(`${API_BASE}/returnteacher/l`, {
        method: "GET",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        }
      });

      if (!res.ok) throw new Error("Chyba při načítání výpůjček");

      const loans = await res.json();

      if (!loans || loans.length === 0) {
        returnLoanTeacherList.innerHTML = `<tr><td colspan="4">Žádné aktivní výpůjčky</td></tr>`;
        return;
      }

      loans.forEach(l => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${l.autor || "-"}</td>
          <td>${l.nazev || "-"}</td>
          <td>${l.predpoklad_datum_vraceni || "-"}</td>
          <td><button class="return-btn" data-id="${l.id_loan}" data-nazev="${l.nazev}" data-autor="${l.autor}">Vrátit</button></td>
        `;
        returnLoanTeacherList.appendChild(tr);
      });

      // Event listener na tlačítka
      document.querySelectorAll(".return-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
          const loanId = e.target.dataset.id;
          const nazev = e.target.dataset.nazev;
          const autor = e.target.dataset.autor;

          if (confirm(`Opravdu chcete vrátit knihu "${nazev}" od ${autor}?`)) {
            await returnTeacherLoan(loanId);
          }
        });
      });
    } catch (err) {
      console.error("Chyba při načítání:", err);
      returnLoanTeacherList.innerHTML = `<tr><td colspan="4" style="color:red;">Nepodařilo se načíst výpůjčky</td></tr>`;
    }
  }

  async function returnTeacherLoan(loanId) {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        alert("Chybí přihlášení");
        return;
      }

      const res = await fetch(`${API_BASE}/returnteacher/${loanId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Chyba při vracení knihy");

      alert("Kniha byla vrácena");
      await loadTeacherLoans();
    } catch (err) {
      console.error("Chyba při vracení:", err);
      alert("Nepodařilo se vrátit knihu");
    }
  }
});
