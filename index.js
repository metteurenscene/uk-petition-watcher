// Copyright 2019 Thomas Angarano

// Global variables
var itemsPerPage = 20;

var constituencySourceArray = Array();
var constituencyFilteredArray = Array();
var constituencyTableElement;
var constituencyPage = -1;
var constituencyTotalPages = 0;
var constituencyPrevElement;
var constituencyNextElement;
var constituencyPageElement;
var constituencyPagesElement;
var constituencyFilterElement

var countrySourceArray = Array();
var countryFilteredArray = Array();
var countryTableElement;
var countryPage = -1;
var countryTotalPages = 1;
var countryPrevElement;
var countryNextElement;
var countryPageElement;
var countryPagesElement;
var countryFilterElement;

function createConstituencyTableRow(constituency) {
  const row = document.createElement('tr');

  // rank
  const indexCell = document.createElement('td');
  indexCell.id = 'rank-column';
  indexCell.innerText = constituency.rank;
  row.appendChild(indexCell);

  // constituency
  const constituencyCell = document.createElement('td');
  constituencyCell.innerText = constituency.name;

  // mp
  const mpCell = document.createElement('td');
  mpCell.innerText = constituency.mp;

  // signatures
  const signaturesCell = document.createElement('td');
  signaturesCell.id = 'signatures-column';
  signaturesCell.innerText = constituency.signature_count.toLocaleString();

  row.appendChild(constituencyCell);
  row.appendChild(mpCell);
  row.appendChild(signaturesCell);

  return row;
}

function updateConstituencyTable(constituencies, page, itemsPerPage) {
  // make sure page is within the permissible range
  page = Math.max(0, Math.min(page, constituencyTotalPages - 1));

  const constituencyStart = page * itemsPerPage;
  const constituencyEnd = Math.min((page + 1) * itemsPerPage, constituencies.length);

  const rowsToDisplay = constituencyEnd - constituencyStart;
  const currentTableRows = constituencyTableElement.children.length - 1;

  for (let i = 0; i < Math.min(rowsToDisplay, currentTableRows); i++) {
    const row = constituencyTableElement.children[i + 1];
    row.children[0].innerText = constituencies[constituencyStart + i].rank;
    row.children[1].innerText = constituencies[constituencyStart + i].name;
    row.children[2].innerText = constituencies[constituencyStart + i].mp;
    row.children[3].innerText = constituencies[constituencyStart + i].signature_count.toLocaleString();
  }
  // the following loop will be entered if there aren't enough table rows in the
  // table
  for (let i = currentTableRows; i < rowsToDisplay; i++) {
    const row = createConstituencyTableRow(constituencies[constituencyStart + i]);
    constituencyTableElement.appendChild(row);
  }
  // "else": the following loop will be entered if there are too many table rows
  // in the table (e.g. last page)
  for (let i = rowsToDisplay; i < currentTableRows; i++) {
    constituencyTableElement.removeChild(constituencyTableElement.children[rowsToDisplay + 1]);
  }

  // update the page input
  constituencyPageElement.value = page + 1;
  // update Prev and Next items
  constituencyPrevElement.className = (page === 0) ? 'disabled' : '';
  constituencyNextElement.className = (page === constituencyTotalPages - 1) ? 'disabled' : '';

  constituencyPage = page;
}

function createCountryTableRow(country) {
  const row = document.createElement('tr');

  // rank
  const indexCell = document.createElement('td');
  indexCell.id = 'rank-column';
  indexCell.innerText = country.rank;
  row.appendChild(indexCell);

  // country
  const countryCell = document.createElement('td');
  countryCell.innerText = country.name;

  // signatures
  const signaturesCell = document.createElement('td');
  signaturesCell.id = 'signatures-column';
  signaturesCell.innerText = country.signature_count.toLocaleString();

  row.appendChild(countryCell);
  row.appendChild(signaturesCell);

  return row;
}

function updateCountryTable(countries, page, itemsPerPage) {
  // make sure page is within the permissible range
  page = Math.max(0, Math.min(page, countryTotalPages - 1));

  const countryStart = page * itemsPerPage;
  const countryEnd = Math.min((page + 1) * itemsPerPage, countries.length);

  const rowsToDisplay = countryEnd - countryStart;
  const currentTableRows = countryTableElement.children.length - 1;

  for (let i = 0; i < Math.min(rowsToDisplay, currentTableRows); i++) {
    const row = countryTableElement.children[i + 1];  // i + 1 as the first child is the table header
    row.children[0].innerText = countries[countryStart + i].rank;
    row.children[1].innerText = countries[countryStart + i].name;
    row.children[2].innerText = countries[countryStart + i].signature_count.toLocaleString();
  }
  // the following loop will be entered if there aren't enough table rows in the
  // table
  for (let i = currentTableRows; i < rowsToDisplay; i++) {
    const row = createCountryTableRow(countries[countryStart + i]);
    countryTableElement.appendChild(row);
  }
  // "else": the following loop will be entered if there are too many table rows
  // in the table (e.g. last page)
  for (let i = rowsToDisplay; i < currentTableRows; i++) {
    // remove the surplus rows
    countryTableElement.removeChild(countryTableElement.children[rowsToDisplay + 1]);
  }

  // update the page input
  countryPageElement.value = page + 1;
  // update Prev and Next items
  countryPrevElement.className = (page === 0) ? 'disabled' : '';
  countryNextElement.className = (page === countryTotalPages - 1) ? 'disabled' : '';

  countryPage = page;
}

function fetchData(id) {  
  fetch(`https://petition.parliament.uk/petitions/${id}.json`)
  .then(response => {
    if (response.ok) {
      return response.json();
    } else {
      throw new Error(response.statusText);
    }
  }).then(data => {
    loadPetition(data);
  }).catch(error => {
    console.log(`error: ${error}`);
    const fetchingElement = document.getElementById('fetching');
    fetchingElement.innerText = 'Failed to load petition data. Please try again later';
  });
}

function loadPetition(petition) {
  // update elements
  const fetchingElement = document.getElementById('fetching');
  const mainElement = document.getElementsByTagName('main')[0];
  const petitionIdElement = document.getElementById('petition-id');
  const petitionActionElement = document.getElementById('petition-action');
  const petitionBackgroundElement = document.getElementById('petition-background');
  const petitionLinkElement = document.getElementById('petition-link');
  const petitionSignatureCountElement = document.getElementById('petition-signature_count');

  petitionIdElement.innerText = `${petition.data.id}`;
  petitionActionElement.innerText = petition.data.attributes.action;
  petitionBackgroundElement.innerText = petition.data.attributes.background;
  petitionLinkElement.href = `https://petition.parliament.uk/petitions/${petition.data.id}`;
  petitionSignatureCountElement.innerText = `${petition.data.attributes.signature_count.toLocaleString()}`;

  // constituencies
  constituencySourceArray = petition.data.attributes.signatures_by_constituency;
  constituencySourceArray.sort((a, b) => {
    if (a.signature_count < b.signature_count) {
      return 1;
    }
    if (a.signature_count > b.signature_count) {
      return -1;
    }
    return 0;
  });
  constituencySourceArray.map((c, index) => {
    c['rank'] = index + 1;
  });
  handleConstituencyFilterChange();

  // countries
  countrySourceArray = petition.data.attributes.signatures_by_country;
  countrySourceArray.sort((a, b) => {
    if (a.signature_count < b.signature_count) {
      return 1;
    }
    if (a.signature_count > b.signature_count) {
      return -1;
    }
    return 0;
  });
  countrySourceArray.map((c, index) => {
    c['rank'] = index + 1;
  });
  handleCountryFilterChange();

  fetchingElement.hidden = true;
  mainElement.hidden = false;
}

function handleConstituencyPageChange(event) {
  let page = constituencyPageElement.value - 1;
  
  // limit to range of [0 .. constituencyTotalPages - 1]
  if (page < 0) page = 0;
  if (page >= constituencyTotalPages) page = constituencyTotalPages - 1;

  if (page != constituencyPage) {
    constituencyPage = page;
    updateConstituencyTable(constituencyFilteredArray, page, itemsPerPage);
  }
}

function handleConstituencyFilterChange(event) {
  const filterTerm = constituencyFilterElement.value.toLowerCase();
  if (filterTerm === '') {
      constituencyFilteredArray = constituencySourceArray;
  } else {
    constituencyFilteredArray = constituencySourceArray.filter(c => {
      return c.name.toLowerCase().includes(filterTerm) || (c.mp !== null && c.mp.toLowerCase().includes(filterTerm));
    });
  }
  constituencyTotalPages = Math.max(1, Math.ceil(constituencyFilteredArray.length / itemsPerPage));
  constituencyPageElement.max = constituencyTotalPages;
  // disable page input if only 1 page is available
  constituencyPageElement.disabled = (constituencyTotalPages === 1)
  constituencyPagesElement.innerText = constituencyTotalPages;
  // paint filter box background red if no results
  constituencyFilterElement.className = (constituencyFilteredArray.length === 0) ? 'not-found' : '';
  updateConstituencyTable(constituencyFilteredArray, 0, itemsPerPage);
}

function handleCountryPageChange(event) {
  let page = countryPageElement.value - 1;
  
  // limit to range of [0 .. constituencyTotalPages - 1]
  if (page < 0) page = 0;
  if (page >= countryTotalPages) page = countryTotalPages - 1;

  if (page != countryPage) {
    countryPage = page;
    updateCountryTable(countryFilteredArray, page, itemsPerPage);
  }
}

function handleCountryFilterChange(event) {
  const filterTerm = countryFilterElement.value.toLowerCase();
  if (filterTerm === '') {
      countryFilteredArray = countrySourceArray;
  } else {
    countryFilteredArray = countrySourceArray.filter(c => {
      return c.name.toLowerCase().includes(filterTerm);
    });
  }
  countryTotalPages = Math.max(1, Math.ceil(countryFilteredArray.length / itemsPerPage));
  countryPageElement.max = countryTotalPages;
  // disable page input if only 1 page is available
  countryPageElement.disabled = (countryTotalPages === 1);
  countryPagesElement.innerText = countryTotalPages;
  // paint filter box background red if no results
  countryFilterElement.className = (countryFilteredArray.length === 0) ? 'not-found' : '';
  updateCountryTable(countryFilteredArray, 0, itemsPerPage);
}

function initialise() {
  fetchData(241584);

  constituencyPrevElement = document.getElementById('constituency-prev');
  constituencyPrevElement.onclick = (e) => {
    constituencyPage--;
    updateConstituencyTable(constituencyFilteredArray, constituencyPage, itemsPerPage);
    e.preventDefault();
  };
  constituencyNextElement = document.getElementById('constituency-next');
  constituencyNextElement.onclick = (e) => {
    constituencyPage++;
    updateConstituencyTable(constituencyFilteredArray, constituencyPage, itemsPerPage);
    e.preventDefault();
  };
  constituencyTableElement = document.getElementById('constituency-table');
  constituencyPageElement = document.getElementById('constituency-page');
  constituencyPageElement.onchange = handleConstituencyPageChange;
  constituencyPagesElement = document.getElementById('constituency-pages');

  constituencyFilterElement = document.getElementById('constituency-filter');
  constituencyFilterElement.oninput = handleConstituencyFilterChange;

  countryPrevElement = document.getElementById('country-prev');
  countryPrevElement.onclick = (e) => {
    countryPage--;
    updateCountryTable(countryFilteredArray, countryPage, itemsPerPage);
    e.preventDefault();
  };
  countryNextElement = document.getElementById('country-next');
  countryNextElement.onclick = (e) => {
    countryPage++;
    updateCountryTable(countryFilteredArray, countryPage, itemsPerPage);
    e.preventDefault();
  };
  countryTableElement = document.getElementById('country-table');
  countryPageElement = document.getElementById('country-page');
  countryPageElement.onchange = handleCountryPageChange;
  countryPagesElement = document.getElementById('country-pages');

  countryFilterElement = document.getElementById('country-filter');
  countryFilterElement.oninput = handleCountryFilterChange;
}

window.onload = (event) => {
  initialise();
};
