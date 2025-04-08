const conversionFormulas = {
    length: {
      baseUnit: 'meter',
      units: { meter: { name: 'Meter', factor: 1 }, kilometer: { name: 'Kilometer', factor: 1000 }, centimeter: { name: 'Centimeter', factor: 0.01 }, millimeter: { name: 'Millimeter', factor: 0.001 }, mile: { name: 'Mile', factor: 1609.34 }, yard: { name: 'Yard', factor: 0.9144 }, foot: { name: 'Foot', factor: 0.3048 }, inch: { name: 'Inch', factor: 0.0254 } }
    },
    weight: {
      baseUnit: 'kilogram',
      units: { kilogram: { name: 'Kilogram', factor: 1 }, gram: { name: 'Gram', factor: 0.001 }, milligram: { name: 'Milligram', factor: 0.000001 }, tonne: { name: 'Metric Tonne', factor: 1000 }, pound: { name: 'Pound', factor: 0.453592 }, ounce: { name: 'Ounce', factor: 0.0283495 } }
    },
    volume: {
      baseUnit: 'liter',
      units: { liter: { name: 'Liter', factor: 1 }, milliliter: { name: 'Milliliter', factor: 0.001 }, cubic_meter: { name: 'Cubic Meter', factor: 1000 }, gallon_us: { name: 'US Gallon', factor: 3.78541 }, pint_us: { name: 'US Pint', factor: 0.473176 }, cup_us: { name: 'US Cup', factor: 0.236588 } }
    },
    time: {
      baseUnit: 'second',
      units: { second: { name: 'Second', factor: 1 }, millisecond: { name: 'Millisecond', factor: 0.001 }, minute: { name: 'Minute', factor: 60 }, hour: { name: 'Hour', factor: 3600 }, day: { name: 'Day', factor: 86400 }, week: { name: 'Week', factor: 604800 } }
    },
    temperature: {
      units: { celsius: { name: 'Celsius (°C)' }, fahrenheit: { name: 'Fahrenheit (°F)' }, kelvin: { name: 'Kelvin (K)' } },
      convert: (value, fromUnit, toUnit) => {
        if (fromUnit === toUnit) return value;
        const val = parseFloat(value); if (isNaN(val)) return NaN;
        let celsiusValue;
        switch (fromUnit) { case 'celsius': celsiusValue = val; break; case 'fahrenheit': celsiusValue = (val - 32) * (5 / 9); break; case 'kelvin': celsiusValue = val - 273.15; break; default: return NaN; }
        switch (toUnit) { case 'celsius': return celsiusValue; case 'fahrenheit': return celsiusValue * (9 / 5) + 32; case 'kelvin': return celsiusValue + 273.15; default: return NaN; }
      }
    }
};

// --- 2. Get References to HTML Elements ---
// We use document.getElementById to grab the elements we need to interact with.
const categorySelect = document.getElementById('category-select');
const fromValueInput = document.getElementById('from-value');
const fromUnitSelect = document.getElementById('from-unit');
const toValueInput = document.getElementById('to-value');
const toUnitSelect = document.getElementById('to-unit');
const swapButton = document.getElementById('swap-button');
const rateDisplay = document.getElementById('conversion-rate-display');
const currentYearSpan = document.getElementById('current-year');

// --- 3. Utility Functions ---

/**
 * Formats a number to a maximum number of decimal places, removing trailing zeros.
 * @param {number} num The number to format.
 * @param {number} maxDecimals Maximum decimal places.
 * @returns {string} The formatted number as a string.
 */
function formatNumber(num, maxDecimals = 6) {
    if (isNaN(num) || num === null) return '';
    // Use toFixed for rounding, then parseFloat to remove trailing zeros
    return parseFloat(num.toFixed(maxDecimals)).toString();
}

/**
 * Populates the "From" and "To" unit dropdowns based on the selected category.
 * @param {string} category The selected category key (e.g., 'length').
 */
function populateUnitDropdowns(category) {
    const categoryData = conversionFormulas[category];
    if (!categoryData) return; // Exit if category is invalid

    const units = Object.keys(categoryData.units);

    // Clear existing options
    fromUnitSelect.innerHTML = '';
    toUnitSelect.innerHTML = '';

    // Add new options
    units.forEach(unitKey => {
        const unitName = categoryData.units[unitKey].name;
        // Create <option> element for 'From' dropdown
        const fromOption = document.createElement('option');
        fromOption.value = unitKey;
        fromOption.textContent = unitName;
        fromUnitSelect.appendChild(fromOption);

        // Create <option> element for 'To' dropdown
        const toOption = document.createElement('option');
        toOption.value = unitKey;
        toOption.textContent = unitName;
        toUnitSelect.appendChild(toOption);
    });

    // Set default selections (e.g., first and second unit)
    fromUnitSelect.value = units[0];
    toUnitSelect.value = units.length > 1 ? units[1] : units[0];
}

/**
 * Performs the conversion calculation (same logic as before).
 */
 function performConversion(value, fromUnit, toUnit, category) {
    const numericValue = parseFloat(value);
    if (isNaN(numericValue)) return null;

    const categoryData = conversionFormulas[category];
    if (!categoryData) return null;

    if (category === 'temperature') {
        const result = categoryData.convert(numericValue, fromUnit, toUnit);
        return isNaN(result) ? null : result;
    }

    const from = categoryData.units[fromUnit];
    const to = categoryData.units[toUnit];
    if (!from || !to) return null;

    const baseUnitFactor = categoryData.units[categoryData.baseUnit].factor;
    const valueInBaseUnit = (numericValue * from.factor) / baseUnitFactor;
    const valueInTargetUnit = (valueInBaseUnit * baseUnitFactor) / to.factor;

    return valueInTargetUnit;
}


/**
 * Updates the 'To' input field based on the 'From' input and selected units.
 * Also updates the conversion rate display.
 */
function updateResult() {
    const fromValue = fromValueInput.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    const category = categorySelect.value;

    const result = performConversion(fromValue, fromUnit, toUnit, category);
    toValueInput.value = formatNumber(result); // Format before displaying

    // Update the rate display (e.g., "1 Meter = 3.2808 Feet")
    const rate = performConversion(1, fromUnit, toUnit, category);
    const fromUnitName = conversionFormulas[category]?.units[fromUnit]?.name || fromUnit;
    const toUnitName = conversionFormulas[category]?.units[toUnit]?.name || toUnit;
    if (rate !== null && fromUnit !== toUnit) {
         rateDisplay.textContent = `1 ${fromUnitName} = ${formatNumber(rate)} ${toUnitName}`;
    } else if (fromUnit === toUnit) {
         rateDisplay.textContent = `1 ${fromUnitName} = 1 ${toUnitName}`;
    }
     else {
        rateDisplay.textContent = ''; // Clear if conversion fails
    }
}

/**
 * Updates the 'From' input field based on the 'To' input and selected units.
 * Called when the user types in the 'To' box.
 */
 function updateReverseResult() {
    const toValue = toValueInput.value;
    const fromUnit = fromUnitSelect.value;
    const toUnit = toUnitSelect.value;
    const category = categorySelect.value;

    // Perform conversion in reverse (To -> From)
    const result = performConversion(toValue, toUnit, fromUnit, category);
    fromValueInput.value = formatNumber(result); // Format before displaying

     // Update rate display (optional, could skip here as updateResult covers it)
     updateResult(); // Easiest way to keep rate display consistent
}


/**
 * Swaps the units and values between the 'From' and 'To' sides.
 */
function swapUnits() {
    // Swap selected units
    const currentFromUnit = fromUnitSelect.value;
    fromUnitSelect.value = toUnitSelect.value;
    toUnitSelect.value = currentFromUnit;

    // Swap input values
    const currentFromValue = fromValueInput.value;
    fromValueInput.value = toValueInput.value;
    toValueInput.value = currentFromValue; // Use the *original* 'from' value

    // Recalculate the result after swapping
    updateResult();
}

// --- 4. Attach Event Listeners ---
// These tell the browser to call our functions when the user interacts with the page.

// When the category changes: Populate units and update the result.
categorySelect.addEventListener('change', () => {
    populateUnitDropdowns(categorySelect.value);
    updateResult();
});

// When the user types in the 'From' input: Update the result.
fromValueInput.addEventListener('input', updateResult);

// When the 'From' unit changes: Update the result.
fromUnitSelect.addEventListener('change', updateResult);

// When the user types in the 'To' input: Update the 'From' value (reverse).
toValueInput.addEventListener('input', updateReverseResult);

// When the 'To' unit changes: Update the result (based on 'From' value).
toUnitSelect.addEventListener('change', updateResult);

// When the swap button is clicked: Swap units and values.
swapButton.addEventListener('click', swapUnits);

// --- 5. Initial Setup ---
// Run these once when the page loads.

// Set the current year in the footer
currentYearSpan.textContent = new Date().getFullYear();

// Populate the dropdowns for the default category ('length').
populateUnitDropdowns(categorySelect.value);

// Perform the initial conversion based on default values.
updateResult();


console.log("Simple Unit Converter Initialized!"); // Message in browser console
