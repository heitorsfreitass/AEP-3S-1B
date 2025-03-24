let countdownTimer = null;
let countdownSeconds = 300;
let currentRental = null;
let currentReservation = null;
let rentalTimer = null;
let rentalStartTime = null;

let bicicletasDisponiveis = [
    { id: 1, lat: -23.4184, lng: -51.9324, nome: "Shopping Avenida Center", disponivel: true, status: "available", rentalStartTime: null, problemReport: null, reservedBy: null, rentedBy: null },
    { id: 2, lat: -23.4266, lng: -51.9380, nome: "Praça da Catedral", disponivel: true, status: "available", rentalStartTime: null, problemReport: null, reservedBy: null, rentedBy: null },
    { id: 3, lat: -23.4260, lng: -51.9330, nome: "Parque do Ingá", disponivel: true, status: "available", rentalStartTime: null, problemReport: null, reservedBy: null, rentedBy: null },
    { id: 4, lat: -23.4210, lng: -51.9280, nome: "Praça Rocha Pombo", disponivel: true, status: "available", rentalStartTime: null, problemReport: null, reservedBy: null, rentedBy: null },
    { id: 5, lat: -23.4290, lng: -51.9480, nome: "Bosque II", disponivel: true, status: "available", rentalStartTime: null, problemReport: null, reservedBy: null, rentedBy: null }
];

let mapa;

document.addEventListener("DOMContentLoaded", function () {
    atualizarMapa();
    updateButtonStates();
});

function updateButtonStates() {
    const reservarBtn = document.getElementById('reservarBtn');
    const devolverBtn = document.getElementById('devolverBtn');

    if (!reservarBtn || !devolverBtn) return;

    reservarBtn.disabled = !!currentRental || !!currentReservation;
    devolverBtn.disabled = !currentRental;
}

function updateRentalInfo() {
    const rentalInfo = document.getElementById('rentalInfo');
    const rentalDetails = document.getElementById('rentalDetails');

    if (!rentalInfo || !rentalDetails) return;

    if (currentRental) {
        const bike = bicicletasDisponiveis.find(b => b.id === currentRental);
        if (bike) {
            const rentalDuration = Math.floor((new Date() - bike.rentalStartTime) / 1000 / 60);
            rentalDetails.textContent = `Bicicleta ${bike.id} - ${bike.nome}\n`;
            rentalInfo.style.display = 'block';
            return;
        }
    }
    rentalInfo.style.display = 'none';
}

function atualizarMapa() {
    if (!mapa) {
        mapa = L.map('mapa').setView([-23.4273, -51.9375], 14);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapa);
    }

    mapa.eachLayer(layer => {
        if (layer instanceof L.Marker) {
            mapa.removeLayer(layer);
        }
    });

    bicicletasDisponiveis.forEach(bike => {
        let cor;
        if (bike.status === "maintenance") {
            cor = "red";
        } else if (bike.status === "reserved") {
            cor = "orange";
        } else if (bike.status === "rented") {
            cor = "gray";
        } else {
            cor = "green";
        }

        let marcador = L.circleMarker([bike.lat, bike.lng], {
            color: cor,
            radius: 8,
            fillOpacity: 0.8
        }).addTo(mapa);

        let statusText;
        if (bike.status === "maintenance") {
            statusText = "Em Manutenção";
        } else if (bike.status === "reserved") {
            statusText = `Reservada (${formatTime(countdownSeconds)} restante)`;
        } else if (bike.status === "rented") {
            statusText = `Alugada por ${bike.rentedBy || 'usuário'}`;
        } else {
            statusText = "Disponível";
        }

        marcador.bindPopup(`<strong>${bike.nome}</strong><br>Status: ${statusText}`);
    });
}

function exibirBicicletas() {
    const listaBicicletas = document.getElementById("listaBicicletas");
    if (!listaBicicletas) return;

    let lista = "<h2>Bicicletas</h2><ul>";
    bicicletasDisponiveis.forEach(bike => {
        let statusText;
        if (bike.status === "maintenance") {
            statusText = "<strong>Em Manutenção</strong>";
        } else if (bike.status === "reserved") {
            statusText = `<strong>Reservada (${formatTime(countdownSeconds)} restante)</strong>`;
        } else if (bike.status === "rented") {
            statusText = `<strong>Alugada por ${bike.rentedBy || 'usuário'}</strong>`;
        } else {
            statusText = "<strong>Disponível</strong>";
        }
        lista += `<li>Bicicleta ${bike.id} - ${bike.nome} - ${statusText}</li>`;
    });
    lista += "</ul>";
    listaBicicletas.innerHTML = lista;
}

function pegarBicicleta() {
    if (currentRental) {
        mostrarNotificacao("Você já tem uma bicicleta alugada. Devolva-a antes de reservar outra.", true);
        return;
    }

    if (currentReservation) {
        mostrarNotificacao("Você já tem uma reserva em andamento.", true);
        return;
    }

    let id = parseInt(prompt("Digite o ID da bicicleta que deseja reservar:"));
    if (isNaN(id)) {
        mostrarNotificacao("ID inválido.", true);
        return;
    }

    let bike = bicicletasDisponiveis.find(b => b.id === id && b.disponivel && b.status === "available");

    if (bike) {
        bike.disponivel = false;
        bike.status = "reserved";
        bike.reservedBy = "Heitor";
        currentReservation = bike.id;
        atualizarMapa();
        exibirBicicletas();
        updateButtonStates();
        mostrarNotificacao(`Você reservou a bicicleta ${bike.id} - ${bike.nome}. Você tem 5 minutos para chegar até ela.`);

        startCountdown(bike);
    } else {
        mostrarNotificacao("ID inválido ou bicicleta indisponível.", true);
    }
}

function startCountdown(bike) {
    let timeLeft = countdownSeconds;

    // Remove existing countdown if any
    const existingCountdown = document.getElementById('countdownDisplay');
    if (existingCountdown) {
        document.body.removeChild(existingCountdown);
    }

    const countdownDiv = document.createElement('div');
    countdownDiv.id = 'countdownDisplay';
    countdownDiv.innerHTML = `
                <h3>Tempo para chegar na bicicleta ${bike.id}:</h3>
                <div id="countdownTime">${formatTime(timeLeft)}</div>
                <button class="btn btn-sm btn-success mt-2" onclick="confirmarChegada(${bike.id})">Cheguei na bicicleta</button>
            `;
    document.body.appendChild(countdownDiv);

    countdownTimer = setInterval(() => {
        timeLeft--;
        const countdownTime = document.getElementById('countdownTime');
        if (countdownTime) {
            countdownTime.textContent = formatTime(timeLeft);
        }

        if (timeLeft <= 0) {
            clearInterval(countdownTimer);
            countdownTimer = null;
            const countdownDiv = document.getElementById('countdownDisplay');
            if (countdownDiv) {
                document.body.removeChild(countdownDiv);
            }

            bicicletasDisponiveis.forEach(b => {
                if (b.id === bike.id && b.status === "reserved") {
                    b.disponivel = true;
                    b.status = "available";
                    b.reservedBy = null;
                }
            });
            currentReservation = null;
            atualizarMapa();
            exibirBicicletas();
            updateButtonStates();
            mostrarNotificacao('Tempo esgotado! Reserva cancelada.', true);
        }
    }, 1000);
}

function confirmarChegada(bikeId) {
    if (countdownTimer) {
        clearInterval(countdownTimer);
        countdownTimer = null;
        const countdownDiv = document.getElementById('countdownDisplay');
        if (countdownDiv) {
            document.body.removeChild(countdownDiv);
        }
        
        const bike = bicicletasDisponiveis.find(b => b.id === bikeId);
        if (bike && bike.status === "reserved") {
            bike.status = "rented";
            bike.rentalStartTime = new Date();
            rentalStartTime = new Date(); // Store rental start time
            bike.rentedBy = "Heitor";
            bike.reservedBy = null;
            currentRental = bike.id;
            currentReservation = null;
            atualizarMapa();
            exibirBicicletas();
            updateButtonStates();
            updateRentalInfo();
            mostrarNotificacao('Aluguel iniciado! Agora você está usando a bicicleta.');
            
            // Start rental timer
            startRentalTimer();
        }
    }
}

function startRentalTimer() {
    // Clear any existing timer
    if (rentalTimer) {
        clearInterval(rentalTimer);
    }
    
    // Update immediately
    updateRentalTimerDisplay();
    
    // Update every second
    rentalTimer = setInterval(updateRentalTimerDisplay, 1000);
}

function updateRentalTimerDisplay() {
    if (!rentalStartTime) return;
    
    const now = new Date();
    const elapsed = new Date(now - rentalStartTime);
    
    const hours = String(elapsed.getUTCHours()).padStart(2, '0');
    const minutes = String(elapsed.getUTCMinutes()).padStart(2, '0');
    const seconds = String(elapsed.getUTCSeconds()).padStart(2, '0');
    
    document.getElementById('timerDisplay').textContent = `${hours}:${minutes}:${seconds}`;
}

function devolverBicicleta() {
    if (!currentRental) {
        mostrarNotificacao("Você não tem nenhuma bicicleta alugada para devolver.", true);
        return;
    }

    // Stop the rental timer
    if (rentalTimer) {
        clearInterval(rentalTimer);
        rentalTimer = null;
    }
    
    let bike = bicicletasDisponiveis.find(b => b.id === currentRental && b.status === "rented");
    if (bike) {
        let rentalEndTime = new Date();
        let rentalDuration = rentalEndTime - bike.rentalStartTime;
        
        // Calculate final rental time
        const elapsed = new Date(rentalDuration);
        const hours = String(elapsed.getUTCHours()).padStart(2, '0');
        const minutes = String(elapsed.getUTCMinutes()).padStart(2, '0');
        const seconds = String(elapsed.getUTCSeconds()).padStart(2, '0');
        const finalTime = `${hours}:${minutes}:${seconds}`;
        
        let problemReport = prompt("Reporte algum problema (deixe em branco se não houver):");
        if (problemReport) {
            bike.problemReport = problemReport;
            bike.status = "maintenance";
            mostrarNotificacao(`Problema reportado: ${problemReport}. Bicicleta ${bike.id} - ${bike.nome} está em manutenção.`, true);
        } else {
            bike.status = "available";
            mostrarNotificacao(`Você devolveu a bicicleta ${bike.id} - ${bike.nome} após ${finalTime}.`);
        }
        
        bike.disponivel = true;
        bike.rentalStartTime = null;
        bike.rentedBy = null;
        currentRental = null;
        rentalStartTime = null;
        atualizarMapa();
        exibirBicicletas();
        updateButtonStates();
        updateRentalInfo();
    } else {
        mostrarNotificacao("Bicicleta não encontrada ou não está alugada.", true);
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

function mostrarNotificacao(mensagem, erro = false) {
    Toastify({
        text: mensagem,
        duration: 3000,
        gravity: erro ? "top" : "bottom",
        position: "right",
        backgroundColor: erro ? "#dc3545" : "#28a745",
        stopOnFocus: true,
        close: true
    }).showToast();
}

atualizarMapa();
updateButtonStates();