const jsonData = [
  {
    title: "CO2 Emissions Increase",
    description:
      "Carbon dioxide emissions from fossil fuels rose again in 2023, reaching record levels. The continued rise in emissions from the burning of oil, coal, and natural gas is impeding progress to limit global warming.",
    data: [
      { year: "1990", CO2Emissions: 22.523343 },
      { year: "1991", CO2Emissions: 22.967993 },
      { year: "1992", CO2Emissions: 22.30725 },
      { year: "1993", CO2Emissions: 22.519816 },
      { year: "1994", CO2Emissions: 22.744253 },
      { year: "1995", CO2Emissions: 23.270075 },
      { year: "1996", CO2Emissions: 23.986249 },
      { year: "1997", CO2Emissions: 24.119842 },
      { year: "1998", CO2Emissions: 24.018912 },
      { year: "1999", CO2Emissions: 24.55873 },
      { year: "2000", CO2Emissions: 25.204473 },
      { year: "2001", CO2Emissions: 25.390789 },
      { year: "2002", CO2Emissions: 25.945193 },
      { year: "2003", CO2Emissions: 27.313074 },
      { year: "2004", CO2Emissions: 28.251212 },
      { year: "2005", CO2Emissions: 29.2071 },
      { year: "2006", CO2Emissions: 30.184984 },
      { year: "2007", CO2Emissions: 31.056976 },
      { year: "2008", CO2Emissions: 31.580802 },
      { year: "2009", CO2Emissions: 31.023421 },
      { year: "2010", CO2Emissions: 32.805281 },
      { year: "2011", CO2Emissions: 33.908335 },
      { year: "2012", CO2Emissions: 34.379926 },
      { year: "2013", CO2Emissions: 34.652288 },
      { year: "2014", CO2Emissions: 34.772503 },
      { year: "2015", CO2Emissions: 34.723617 },
      { year: "2016", CO2Emissions: 34.72781 },
      { year: "2017", CO2Emissions: 35.286144 },
      { year: "2018", CO2Emissions: 36.004238 },
      { year: "2019", CO2Emissions: 36.365677 },
      { year: "2020", CO2Emissions: 34.368599 },
      { year: "2021", CO2Emissions: 36.198618 },
      { year: "2022", CO2Emissions: 36.496956 },
      { year: "2023", CO2Emissions: 37.007293 },
      { year: "2024", CO2Emissions: 37.406451 }
    ],
    th2: "Emissions in billion metric tons",
    side: {
      data: "<a href='https://www.globalcarbonproject.org'>GCP</a>",
      credit:
        "<a href='https://climate.esa.int/en/little-pictures-gallery/carbon-dioxide-spiral/'>ESA Climate Office</a>"
    }
  },
  {
    title: "Temperature Rise",
    description:
      "Earth’s average surface temperature in 2023 was the warmest on record since recordkeeping began in 1880. The 10 most recent years are the warmest on record.",
    data: [
      { year: "1960", temperatureAnomaly: -0.03 },
      { year: "1961", temperatureAnomaly: 0.06 },
      { year: "1962", temperatureAnomaly: 0.03 },
      { year: "1963", temperatureAnomaly: 0.05 },
      { year: "1964", temperatureAnomaly: -0.2 },
      { year: "1965", temperatureAnomaly: -0.11 },
      { year: "1966", temperatureAnomaly: -0.06 },
      { year: "1967", temperatureAnomaly: -0.02 },
      { year: "1968", temperatureAnomaly: -0.08 },
      { year: "1969", temperatureAnomaly: 0.05 },
      { year: "1970", temperatureAnomaly: 0.03 },
      { year: "1971", temperatureAnomaly: -0.08 },
      { year: "1972", temperatureAnomaly: 0.01 },
      { year: "1973", temperatureAnomaly: 0.16 },
      { year: "1974", temperatureAnomaly: -0.07 },
      { year: "1975", temperatureAnomaly: -0.01 },
      { year: "1976", temperatureAnomaly: -0.1 },
      { year: "1977", temperatureAnomaly: 0.18 },
      { year: "1978", temperatureAnomaly: 0.07 },
      { year: "1979", temperatureAnomaly: 0.16 },
      { year: "1980", temperatureAnomaly: 0.26 },
      { year: "1981", temperatureAnomaly: 0.32 },
      { year: "1982", temperatureAnomaly: 0.14 },
      { year: "1983", temperatureAnomaly: 0.31 },
      { year: "1984", temperatureAnomaly: 0.16 },
      { year: "1985", temperatureAnomaly: 0.12 },
      { year: "1986", temperatureAnomaly: 0.18 },
      { year: "1987", temperatureAnomaly: 0.32 },
      { year: "1988", temperatureAnomaly: 0.39 },
      { year: "1989", temperatureAnomaly: 0.27 },
      { year: "1990", temperatureAnomaly: 0.45 },
      { year: "1991", temperatureAnomaly: 0.4 },
      { year: "1992", temperatureAnomaly: 0.22 },
      { year: "1993", temperatureAnomaly: 0.23 },
      { year: "1994", temperatureAnomaly: 0.31 },
      { year: "1995", temperatureAnomaly: 0.45 },
      { year: "1996", temperatureAnomaly: 0.33 },
      { year: "1997", temperatureAnomaly: 0.47 },
      { year: "1998", temperatureAnomaly: 0.61 },
      { year: "1999", temperatureAnomaly: 0.38 },
      { year: "2000", temperatureAnomaly: 0.39 },
      { year: "2001", temperatureAnomaly: 0.54 },
      { year: "2002", temperatureAnomaly: 0.63 },
      { year: "2003", temperatureAnomaly: 0.62 },
      { year: "2004", temperatureAnomaly: 0.53 },
      { year: "2005", temperatureAnomaly: 0.68 },
      { year: "2006", temperatureAnomaly: 0.64 },
      { year: "2007", temperatureAnomaly: 0.66 },
      { year: "2008", temperatureAnomaly: 0.54 },
      { year: "2009", temperatureAnomaly: 0.66 },
      { year: "2010", temperatureAnomaly: 0.73 },
      { year: "2011", temperatureAnomaly: 0.61 },
      { year: "2012", temperatureAnomaly: 0.65 },
      { year: "2013", temperatureAnomaly: 0.68 },
      { year: "2014", temperatureAnomaly: 0.75 },
      { year: "2015", temperatureAnomaly: 0.9 },
      { year: "2016", temperatureAnomaly: 1.02 },
      { year: "2017", temperatureAnomaly: 0.92 },
      { year: "2018", temperatureAnomaly: 0.85 },
      { year: "2019", temperatureAnomaly: 0.98 },
      { year: "2020", temperatureAnomaly: 1.01 },
      { year: "2021", temperatureAnomaly: 0.85 },
      { year: "2022", temperatureAnomaly: 0.89 },
      { year: "2023", temperatureAnomaly: 1.17 }
    ],
    th2: "Land-Ocean Temperature Index (C)",
    side: {
      data:
        "<a href='https://climate.nasa.gov/vital-signs/global-temperature/?intent=121'>NASA</a>",
      credit:
        "<a href='https://climate.esa.int/nl/little-pictures-gallery/Arctic-sea-ice-loss-little-picture/'>ESA Climate Office</a>"
    }
  },

  {
    title: "Sea Ice Loss",
    description:
      "Every year, the polar oceans experience the formation of and then melting of vast amounts of sea ice according to the season. Observations show that Arctic summer sea-ice extent has decreased by half.",
    data: [
      { year: "1980", arcticSeaIceExtent: 8.2 },
      { year: "1981", arcticSeaIceExtent: 7.8 },
      { year: "1982", arcticSeaIceExtent: 7.9 },
      { year: "1983", arcticSeaIceExtent: 8.0 },
      { year: "1984", arcticSeaIceExtent: 7.4 },
      { year: "1985", arcticSeaIceExtent: 7.5 },
      { year: "1986", arcticSeaIceExtent: 7.9 },
      { year: "1987", arcticSeaIceExtent: 7.7 },
      { year: "1988", arcticSeaIceExtent: 7.3 },
      { year: "1989", arcticSeaIceExtent: 7.3 },
      { year: "1990", arcticSeaIceExtent: 6.6 },
      { year: "1991", arcticSeaIceExtent: 6.9 },
      { year: "1992", arcticSeaIceExtent: 7.8 },
      { year: "1993", arcticSeaIceExtent: 7.0 },
      { year: "1994", arcticSeaIceExtent: 7.5 },
      { year: "1995", arcticSeaIceExtent: 6.5 },
      { year: "1996", arcticSeaIceExtent: 7.8 },
      { year: "1997", arcticSeaIceExtent: 7.0 },
      { year: "1998", arcticSeaIceExtent: 6.9 },
      { year: "1999", arcticSeaIceExtent: 6.6 },
      { year: "2000", arcticSeaIceExtent: 6.8 },
      { year: "2001", arcticSeaIceExtent: 7.1 },
      { year: "2002", arcticSeaIceExtent: 6.3 },
      { year: "2003", arcticSeaIceExtent: 6.5 },
      { year: "2004", arcticSeaIceExtent: 6.3 },
      { year: "2005", arcticSeaIceExtent: 5.8 },
      { year: "2006", arcticSeaIceExtent: 6.2 },
      { year: "2007", arcticSeaIceExtent: 4.8 },
      { year: "2008", arcticSeaIceExtent: 5.4 },
      { year: "2009", arcticSeaIceExtent: 5.8 },
      { year: "2010", arcticSeaIceExtent: 5.4 },
      { year: "2011", arcticSeaIceExtent: 5.1 },
      { year: "2012", arcticSeaIceExtent: 4.1 },
      { year: "2013", arcticSeaIceExtent: 5.6 },
      { year: "2014", arcticSeaIceExtent: 5.7 },
      { year: "2015", arcticSeaIceExtent: 5.2 },
      { year: "2016", arcticSeaIceExtent: 5.1 },
      { year: "2017", arcticSeaIceExtent: 5.3 },
      { year: "2018", arcticSeaIceExtent: 5.2 },
      { year: "2019", arcticSeaIceExtent: 4.8 },
      { year: "2020", arcticSeaIceExtent: 4.6 },
      { year: "2021", arcticSeaIceExtent: 5.5 },
      { year: "2022", arcticSeaIceExtent: 5.4 }
    ],
    th2: "Extent (million square per mile)",
    side: {
      data:
        "<a href='https://osi-saf.eumetsat.int/products/sea-ice-products'>EUMETSAT</a>",
      credit:
        "<a href='https://climate.esa.int/nl/little-pictures-gallery/Arctic-sea-ice-loss-little-picture/'>ESA Climate Office</a>"
    }
  },
  {
    title: "Sea Level Rise",
    description:
      "Sea level rise is one of the clearest indicators of climate change and puts millions living in coastal zone under threat of inundation.",
    data: [
      { year: "1993", seaLevelHeight: 4.74 },
      { year: "1994", seaLevelHeight: 7.57 },
      { year: "1995", seaLevelHeight: 11.39 },
      { year: "1996", seaLevelHeight: 15.16 },
      { year: "1997", seaLevelHeight: 18.48 },
      { year: "1998", seaLevelHeight: 16.28 },
      { year: "1999", seaLevelHeight: 18.91 },
      { year: "2000", seaLevelHeight: 21.57 },
      { year: "2001", seaLevelHeight: 27.44 },
      { year: "2002", seaLevelHeight: 32.94 },
      { year: "2003", seaLevelHeight: 34.72 },
      { year: "2004", seaLevelHeight: 36.49 },
      { year: "2005", seaLevelHeight: 41.01 },
      { year: "2006", seaLevelHeight: 44.63 },
      { year: "2007", seaLevelHeight: 43.74 },
      { year: "2008", seaLevelHeight: 47.42 },
      { year: "2009", seaLevelHeight: 48.45 },
      { year: "2010", seaLevelHeight: 49.07 },
      { year: "2011", seaLevelHeight: 49.44 },
      { year: "2012", seaLevelHeight: 49.98 },
      { year: "2013", seaLevelHeight: 50.35 },
      { year: "2014", seaLevelHeight: 50.7 },
      { year: "2015", seaLevelHeight: 51.15 },
      { year: "2016", seaLevelHeight: 51.79 },
      { year: "2017", seaLevelHeight: 52.19 },
      { year: "2018", seaLevelHeight: 52.83 },
      { year: "2019", seaLevelHeight: 53.25 },
      { year: "2020", seaLevelHeight: 53.52 },
      { year: "2021", seaLevelHeight: 54.01 },
      { year: "2022", seaLevelHeight: 54.45 }
    ],
    th2: "Sea height variation in millimeters",
    side: {
      data:
        "<a href='https://www.nasa.gov/stem-content/sea-level-height-data-set/'>NASA</a>",
      credit:
        "<a href='https://climate.esa.int/nl/little-pictures-gallery/Arctic-sea-ice-loss-little-picture/'>ESA Climate Office</a>"
    }
  }
];

// Function to create the HTML structure for a single card
function createCard(json, index) {
  const container = document.querySelector(".card-wrapper"); // Select the element with class "card-wrapper"

  // Create the card container
  const card = document.createElement("div");
  card.className = "card";

  // Add heading
  const heading = document.createElement("h2");
  heading.textContent = json.title;
  card.appendChild(heading);

  // Add description
  const paragraph = document.createElement("p");
  paragraph.textContent = json.description;
  card.appendChild(paragraph);

  // Create the tabs structure
  const tabs = document.createElement("div");
  tabs.className = "tabs";

  // Create input radio elements with unique IDs
  ["tab1", "tab2", "tab3"].forEach((id, idx) => {
    const input = document.createElement("input");
    input.type = "radio";
    input.name = `tabset-${index}`; // Unique name for each card
    input.id = `${id}-${index}`; // Unique ID for each card

    // Mark the first radio button as checked
    if (idx === 0) {
      input.checked = true;
    }

    tabs.appendChild(input);
  });

  // Create a wrapper for labels
  const labelWrapper = document.createElement("div");
  labelWrapper.className = "tab-label";

  // Create labels for the inputs
  ["Visual", "Graph", "Table"].forEach((labelText, idx) => {
    const label = document.createElement("label");
    label.htmlFor = `tab${idx + 1}-${index}`; // Match the unique ID
    label.textContent = labelText;
    labelWrapper.appendChild(label);
  });

  // Append the label wrapper to the tabs
  tabs.appendChild(labelWrapper);

  // Create tab content container
  const tabContent = document.createElement("div");
  tabContent.className = "tab-content";

  // Create the table
  const table = document.createElement("table");
  const headerRow = document.createElement("tr");

  // Set header for the first column as 'Year'
  const th1 = document.createElement("th");
  th1.textContent = "Year";
  headerRow.appendChild(th1);

  // Set header for the second column as json.th2
  const th2 = document.createElement("th");
  th2.textContent = json.th2; // Dynamically set the second header
  headerRow.appendChild(th2);

  table.appendChild(headerRow);

  // Determine the key dynamically and calculate max and min values
  const dataKeys = Object.keys(json.data[0]).filter((key) => key !== "year");
  const key = dataKeys[0]; // Pick the first key (assuming all data entries have the same structure)

  const values = json.data.map((e) => e[key]);
  const maxExtent = Math.max(...values);
  const minExtent = Math.min(...values);

  // Generate rows for the table
  json.data.forEach((e, idx) => {
    const row = document.createElement("tr");

    // Year cell
    const yearCell = document.createElement("td");
    yearCell.className = "year";
    yearCell.textContent = e.year;
    row.appendChild(yearCell);

    // Data cell
    const dataCell = document.createElement("td");
    dataCell.className = "extent-bar";

    const dataValue = e[key];
    const previousValue = idx === 0 ? dataValue : json.data[idx - 1][key];

    // Calculate width and position for the bar (using absolute values for the width but keeping the sign for negative values)
    const range = maxExtent - minExtent;
    const normalizedValue = ((dataValue - minExtent) / range) * 100;
    const previousNormalizedValue = ((previousValue - minExtent) / range) * 100;

    dataCell.style.setProperty("--value", `${normalizedValue}%`);
    dataCell.style.setProperty(
      "--previous-value",
      `${previousNormalizedValue}%`
    );

    const span = document.createElement("span");
    span.textContent = dataValue;
    dataCell.appendChild(span);
    row.appendChild(dataCell);

    table.appendChild(row);
  });

  // Append the table directly to the tab content (no dataContainer)
  tabContent.appendChild(table);

  // Append the tab content to the tabs
  tabs.appendChild(tabContent);

  // Append the tabs to the card
  card.appendChild(tabs);

  // Dynamically calculate footer values
  const firstYear = parseInt(json.data[0].year);
  const lastYear = parseInt(json.data[json.data.length - 1].year);
  const yearsRange = lastYear - firstYear + 1;

  // Add footer
  const footer = document.createElement("div");
  footer.className = "bottom";
  footer.innerHTML = `<span>${yearsRange} Years</span> <span>${firstYear} - ${lastYear}</span>`;
  card.appendChild(footer);

  // Add references using <dl>
  const references = document.createElement("dl");
  references.className = "references";

  // Add "Data" reference
  const dataTerm = document.createElement("dt");
  dataTerm.textContent = "Data:";
  references.appendChild(dataTerm);

  const dataDefinition = document.createElement("dd");
  dataDefinition.innerHTML = json.side.data;
  references.appendChild(dataDefinition);

  // Add "Credit" reference
  const creditTerm = document.createElement("dt");
  creditTerm.textContent = "Credit:";
  references.appendChild(creditTerm);

  const creditDefinition = document.createElement("dd");
  creditDefinition.innerHTML = json.side.credit;
  references.appendChild(creditDefinition);

  // Append the references to the card
  card.appendChild(references);

  // Append the card to the container
  container.appendChild(card);
}

// Run the function when the window loads
window.onload = function () {
  jsonData.forEach((data, index) => createCard(data, index)); // Loop through each dataset and create cards with unique IDs
};
