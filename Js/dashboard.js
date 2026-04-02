// --- 1. Configuration & Data ---
// NOTE: This dashboard uses client-side demo behavior when backend is unavailable.
const API_BASE_URL = 'http://localhost:8080/api/v1/quantities';

const unitData = {
    'LENGTH': ['KILOMETER','METER','CENTIMETER','FEET','INCHES'],
    'WEIGHT': ['GRAM','KILOGRAM','TONNE'],
    'TEMPERATURE': ['CELSIUS','FAHRENHEIT'],
    'VOLUME': ['LITER','MILLILITER','GALLON']
};

let currentType = 'LENGTH';
let currentAction = 'COMPARE';

// --- 2. DOM Elements ---
const typeCards = document.querySelectorAll('.type-card');
const actionBtns = document.querySelectorAll('.actions .action-btn');
const unit1Select = document.getElementById('unit1');
const unit2Select = document.getElementById('unit2');
const val1Input = document.getElementById('val1');
const val2Input = document.getElementById('val2');
const calculateBtn = document.getElementById('calculateBtn');
const resultDisplay = document.getElementById('resultDisplay');

// Profile elements
const userNameEl = document.getElementById('userName');
const userEmailEl = document.getElementById('userEmail');

// --- 3. Dynamic UI Updates ---
function populateDropdowns(type) {
    const units = unitData[type] || [];
    unit1Select.innerHTML = '';
    unit2Select.innerHTML = '';
    units.forEach(unit => {
        unit1Select.insertAdjacentHTML('beforeend', `<option value="${unit}">${unit}</option>`);
        unit2Select.insertAdjacentHTML('beforeend', `<option value="${unit}">${unit}</option>`);
    });
}

// Type Selection Click (Length, Weight, etc.)
typeCards.forEach(card => {
    card.addEventListener('click', () => {
        typeCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const type = card.getAttribute('data-type');
        currentType = type;
        populateDropdowns(currentType);
        resultDisplay.innerText = "Result: --";
    });
});

// Action Selection Click (Compare, Convert, Add)
actionBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        actionBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const act = btn.getAttribute('data-action');
        currentAction = act;
        if (currentAction === 'CONVERT') val2Input.style.display = 'none'; else val2Input.style.display = 'block';
        resultDisplay.innerText = "Result: --";
    });
});

// Initialize first load
populateDropdowns(currentType);

// populate profile from localStorage (if available)
try{
    const logged = JSON.parse(localStorage.getItem('loggedInUser'));
    if(logged){
        userNameEl.textContent = logged.name || logged;
        userEmailEl.textContent = logged.email || '';
    }
}catch(e){console.warn('no user in localStorage')}

// --- 4. API Communication ---
calculateBtn.addEventListener('click', async () => {
    // Build the payload that Spring Boot expects (QuantityInputDTO)
    const payload = {
        thisQuantityDTO: {
            value: parseFloat(val1Input.value),
            unit: unit1Select.value,
            measurementType: currentType
        },
        thatQuantityDTO: {
            value: currentAction === 'CONVERT' ? 0 : parseFloat(val2Input.value), // Ignore val2 for conversion
            unit: unit2Select.value,
            measurementType: currentType
        }
    };

    try {
        resultDisplay.innerText = "Calculating...";
        
        // Client-side conversion logic (linear factors + temperature formulas)
        function round(v){
            if (Math.abs(v) < 1e-6) return 0;
            return Math.round(v * 100000) / 100000;
        }

        const factors = {
            LENGTH: {
                KILOMETER:1000, METER:1, CENTIMETER:0.01, FEET:0.3048, INCHES:0.0254
            },
            WEIGHT: {
                GRAM:1, KILOGRAM:1000, TONNE:1000000
            },
            VOLUME: {
                LITER:1, MILLILITER:0.001, GALLON:3.78541
            }
        };

        function convertLinear(type, value, fromUnit, toUnit){
            const map = factors[type] || {};
            const fromF = map[fromUnit] || 1;
            const toF = map[toUnit] || 1;
            const inBase = value * fromF; // convert to base (meter, gram, liter)
            return inBase / toF;
        }

        function convertTemperature(value, fromUnit, toUnit){
            if (fromUnit === toUnit) return value;
            if (fromUnit === 'CELSIUS' && toUnit === 'FAHRENHEIT') return (value * 9/5) + 32;
            if (fromUnit === 'FAHRENHEIT' && toUnit === 'CELSIUS') return (value - 32) * 5/9;
            return value;
        }

        const a = parseFloat(val1Input.value) || 0;
        const b = parseFloat(val2Input.value) || 0;
        const u1 = unit1Select.value;
        const u2 = unit2Select.value;

        if (currentAction === 'COMPARE'){
            let res = false;
            if (currentType === 'TEMPERATURE'){
                const aa = convertTemperature(a, u1, 'CELSIUS');
                const bb = convertTemperature(b, u2, 'CELSIUS');
                res = round(aa) === round(bb);
            } else {
                const aa = convertLinear(currentType, a, u1, Object.keys(factors[currentType]||{ })[0] || u1);
                const bb = convertLinear(currentType, b, u2, Object.keys(factors[currentType]||{ })[0] || u2);
                res = round(aa) === round(bb);
            }
            resultDisplay.innerText = `Result: ${res}`;
        } else if (currentAction === 'ADD'){
            let sum = 0;
            if (currentType === 'TEMPERATURE'){
                // Adding temperatures is not meaningful; show concatenated or simple sum in same unit
                const bConv = convertTemperature(b, u2, u1);
                sum = a + bConv;
                resultDisplay.innerText = `Result: ${round(sum)} ${u1}`;
            } else {
                // convert both to unit2 then add
                const aConv = convertLinear(currentType, a, u1, u2);
                sum = aConv + b;
                resultDisplay.innerText = `Result: ${round(sum)} ${u2}`;
            }
        } else if (currentAction === 'CONVERT'){
            let out = 0;
            if (currentType === 'TEMPERATURE'){
                out = convertTemperature(a, u1, u2);
            } else {
                out = convertLinear(currentType, a, u1, u2);
            }
            resultDisplay.innerText = `Result: ${round(out)} ${u2}`;
        }

    } catch (error) {
        console.error(error);
        resultDisplay.innerText = `Error: ${error.message}`;
        resultDisplay.style.color = 'red';
        setTimeout(() => resultDisplay.style.color = 'black', 3000); // Reset color
    }
});

// --- Logout ---
document.getElementById('logoutBtn')?.addEventListener('click', () => {
    window.location.href = 'index.html';
});