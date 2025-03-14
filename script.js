let teams = [];
let currentRace = 1;

// Load persisted teams on startup:
if (localStorage.getItem('teams')) {
    teams = JSON.parse(localStorage.getItem('teams'));
}

// Persist teams to localStorage.
function persistTeams() {
    localStorage.setItem('teams', JSON.stringify(teams));
}

// Add helper function to get the team ranking key based on currentRace.
function getRankingKey(team) {
	if (currentRace === 1) {
		return [team.grades[0] || 0];
	} else if (currentRace === 2) {
		let g1 = team.grades[0] || 0, g2 = team.grades[1] || 0;
		return [Math.max(g1, g2), Math.min(g1, g2)];
	} else if (currentRace === 3) {
		return [team.grades[0] || 0, team.grades[1] || 0, team.grades[2] || 0].sort((a,b)=> b-a);
	}
}

// Helper function to compare two ranking keys.
function keysEqual(keyA, keyB) {
	if (keyA.length !== keyB.length) return false;
	for (let i = 0; i < keyA.length; i++) {
		if (keyA[i] !== keyB[i]) return false;
	}
	return true;
}

// Update registration table display (on registration.html)
function updateRegistrationDisplay() {
	const regTbody = document.querySelector("#registrationTable tbody");
	if (!regTbody) return;
	regTbody.innerHTML = "";
	teams.forEach(team => {
		const tr = document.createElement("tr");
		tr.innerHTML = `
			<td>${team.name}</td>
			<td>
				<button class="delete-btn" data-team="${team.name}">Delete</button>
			</td>
		`;
		regTbody.appendChild(tr);
	});
	// Attach deletion events.
	document.querySelectorAll(".delete-btn").forEach(btn => {
		btn.addEventListener("click", function() {
			const teamName = this.getAttribute("data-team");
			if (confirm(`Are you sure you want to delete team "${teamName}"?`)) {
				deleteTeam(teamName);
			}
		});
	});
	// Update team select options on race pages.
	updateTeamSelect("teamSelectRace1");
	updateTeamSelect("teamSelectRace2");
	updateTeamSelect("teamSelectRace3");
}

// Update select options for race forms.
function updateTeamSelect(selectId) {
	const selectElem = document.getElementById(selectId);
	if (!selectElem) return;
	// Add a default option.
	selectElem.innerHTML = '<option value="">Select Team</option>';
	teams.forEach(team => {
		const option = document.createElement("option");
		option.value = team.name;
		option.textContent = team.name;
		selectElem.appendChild(option);
	});
}

// Update ranking table (on ranking.html)
function updateRanking() {
    const tbody = document.querySelector("#rankingTable tbody");
    if (!tbody) return;
    // Sort teams by comparing their best scores (sorted in descending order) lexicographically.
    teams.sort((a, b) => {
        let aScores = [a.grades[0]||0, a.grades[1]||0, a.grades[2]||0].sort((x,y)=> y-x);
        let bScores = [b.grades[0]||0, b.grades[1]||0, b.grades[2]||0].sort((x,y)=> y-x);
        for(let i = 0; i < 3; i++){
            if(bScores[i] !== aScores[i]) {
                return bScores[i] - aScores[i];
            }
        }
        return 0;
    });
    
    tbody.innerHTML = "";
    let rank = 1;
    let prevScores = null;
    teams.forEach(team => {
        let scores = [team.grades[0]||0, team.grades[1]||0, team.grades[2]||0].sort((x,y)=> y-x);
        if (prevScores !== null) {
            for (let i = 0; i < 3; i++) {
                if (scores[i] < prevScores[i]) {
                    rank++;
                    break;
                } else if (scores[i] > prevScores[i]) {
                    break;
                }
            }
        }
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${rank}</td>
            <td>${team.name}</td>
            <td>${team.grades[0] !== undefined ? team.grades[0] : ""}</td>
            <td>${team.grades[1] !== undefined ? team.grades[1] : ""}</td>
            <td>${team.grades[2] !== undefined ? team.grades[2] : ""}</td>
        `;
        tbody.appendChild(tr);
        prevScores = scores;
    });
}

// Delete a team.
function deleteTeam(teamName) {
	teams = teams.filter(t => t.name.toLowerCase() !== teamName.toLowerCase());
	persistTeams();
	updateRegistrationDisplay();
	updateRanking();
}

// Call update routines on page load.
updateRegistrationDisplay();
updateRanking();

// Also update team select options on race pages (if present)
updateTeamSelect("teamSelectRace1");
updateTeamSelect("teamSelectRace2");
updateTeamSelect("teamSelectRace3");

// Registration form event (on registration.html)
const regForm = document.getElementById("registration-form");
if (regForm) {
	regForm.addEventListener("submit", function(e) {
		e.preventDefault();
		const name = document.getElementById("registerTeamName").value.trim();
		if (name) {
			if (teams.some(t => t.name.toLowerCase() === name.toLowerCase())) {
				alert("Team already registered.");
			} else {
				teams.push({ name, grades: [] });
				persistTeams();
				updateRegistrationDisplay();
				updateRanking();
			}
			e.target.reset();
		}
	});
}

// Race 1 form event (on race1.html)
const race1Form = document.getElementById("race1-form");
if (race1Form) {
	race1Form.addEventListener("submit", function(e) {
		e.preventDefault();
		const teamName = document.getElementById("teamSelectRace1").value;
		const grade1 = parseFloat(document.getElementById("race1Grade").value);
		if (teamName && !isNaN(grade1)) {
			const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
			if (team) {
				team.grades[0] = grade1;
				persistTeams();
				updateRanking();
			}
			e.target.reset();
		}
	});
}

// Race 2 form event (on race2.html)
const race2Form = document.getElementById("race2-form");
if (race2Form) {
	race2Form.addEventListener("submit", function(e) {
		e.preventDefault();
		const teamName = document.getElementById("teamSelectRace2").value;
		const grade2 = parseFloat(document.getElementById("race2Grade").value);
		if (teamName && !isNaN(grade2)) {
			const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
			if (team) {
				team.grades[1] = grade2;
				persistTeams();
				updateRanking();
			}
			e.target.reset();
		}
	});
}

// Race 3 form event (on race3.html)
const race3Form = document.getElementById("race3-form");
if (race3Form) {
	race3Form.addEventListener("submit", function(e) {
		e.preventDefault();
		const teamName = document.getElementById("teamSelectRace3").value;
		const grade3 = parseFloat(document.getElementById("race3Grade").value);
		if (teamName && !isNaN(grade3)) {
			const team = teams.find(t => t.name.toLowerCase() === teamName.toLowerCase());
			if (team) {
				team.grades[2] = grade3;
				persistTeams();
				updateRanking();
			}
			e.target.reset();
		}
	});
}

// NEW: Function to generate CSV and download ranking data.
function downloadRanking() {
    // Create CSV header.
    const csvHeader = "Rank,Team,Race 1,Race 2,Race 3\n";
    let csvContent = csvHeader;
    
    // Clone and sort teams using best scores descending.
    let sortedTeams = teams.slice();
    sortedTeams.sort((a, b) => {
        let aScores = [a.grades[0] || 0, a.grades[1] || 0, a.grades[2] || 0].sort((x, y) => y - x);
        let bScores = [b.grades[0] || 0, b.grades[1] || 0, b.grades[2] || 0].sort((x, y) => y - x);
        for (let i = 0; i < 3; i++) {
            if (bScores[i] !== aScores[i]) {
                return bScores[i] - aScores[i];
            }
        }
        return 0;
    });
    
    // Determine ranking based on best scores.
    let rank = 1;
    let prevScores = null;
    sortedTeams.forEach(team => {
        let scores = [team.grades[0] || 0, team.grades[1] || 0, team.grades[2] || 0].sort((x, y) => y - x);
        if (prevScores !== null) {
            for (let i = 0; i < 3; i++) {
                if (scores[i] < prevScores[i]) {
                    rank++;
                    break;
                } else if (scores[i] > prevScores[i]) {
                    break;
                }
            }
        }
        csvContent += `${rank},${team.name},${team.grades[0] || ""},${team.grades[1] || ""},${team.grades[2] || ""}\n`;
        prevScores = scores;
    });
    
    // Create blob and force download.
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.setAttribute("href", URL.createObjectURL(blob));
    link.setAttribute("download", "ranking.csv");
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
