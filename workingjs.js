STATE = { results: [], savedPlayers: [] }

let $savedPlayers=$(".saved-players");

function hideSavedSection() {
  $savedPlayers.hide();
}

function getDataFromApi(searchTerm, callback) {
  $.ajax
    ({
      type: "GET",
      url: "https://api.mysportsfeeds.com/v2.1/pull/nba/2019-2020-regular/player_stats_totals.json",
      dataType: 'json',
      async: false,
      data: { player: searchTerm },
      headers: {
        "Authorization": "Basic " + btoa("5dd8ddef-d120-481b-8776-f0cd42" + ":" + "MYSPORTSFEEDS")
      },
      success: function (data) {
        callback(data);
      }
    });
}

function watchSubmit() {
  $(".js-search-SportsFeeds").submit(function (event) {
    event.preventDefault();
    if ($('#first-name').val() && $('#last-name').val()) {
      showSearchResults();
      getDataFromApi($('#first-name').val() + "-" + $('#last-name').val(), displaySportsFeedsSearchData);
    }
    else if ($('#last-name').val()) {
      showSearchResults()
      getDataFromApi($('#last-name').val(), displaySportsFeedsSearchData);
    }
    else {
      alert("Please enter first and last name");
    }
  })
}

function instructionsOn() {
  $(".instructions").click(function () {
    $(".overlay").css("display", "block");
  })
}

function instructionsOff() {
  $(".overlay-off").click(function () {
    $(".overlay").css("display", "none");
  })
}

function hideSearchResults() {
  $(".js-search-results").hide();
}

function showSearchResults() {
  $(".js-search-results").show();
}

function homeToSave() {
  $(".display-saved-players").click(function () {
    $(".search-players").hide();
    $(".saved-players").show();
  })
}



function displaySportsFeedsSearchData(data) {
  STATE.results = data.playerStatsTotals;

  if (STATE.results.length === 0) {
    alert("Sorry, no players by that name found")
  }
  else {
    const results = data.playerStatsTotals.map(function (player, index) {
      return renderResult(player);
    });

    $(".js-search-results").empty();
    $(".js-search-results").append("<h1>Search Results</h1>");
    $(".js-search-results").append(results);
  }
}

function renderResult(player) {
  if (STATE.savedPlayers.length === 0) {
    $(".saved-players").empty();
    return `
      <div class="col-6">
      <section class="player" role="region">
      ${player.player.firstName ? `<img class="player-image" src="https://nba-players.herokuapp.com/players/${player.player.lastName}/${player.player.firstName}" />` : ""}
      <p>${player.player.firstName} ${player.player.lastName}</p>
      <p>${player.team.abbreviation}</p>
      <p>Number: ${player.player.jerseyNumber}</p>
      <p>Position: ${player.player.primaryPosition}</p>
      <button type="button" class="save"  data-player-id="${player.player.id}">Select Player</button>
      </section>
    
      </div>  
    `
  }
  else {
    return `
      <div class="col-6">
      <section class="player" role="region">
      ${player.player.firstName ? `<img class="player-image" src="https://nba-players.herokuapp.com/players/${player.player.lastName}/${player.player.firstName}" />` : ""}
      <p>${player.player.firstName} ${player.player.lastName}</p>
      <p>${player.team.abbreviation} </p>
      <p>Number: ${player.player.jerseyNumber}</p>
      <p>Position: ${player.player.primaryPosition}</p>
      <button type="button" class="save"  data-player-id="${player.player.id}">Select</button>
      </section>
    
      </div>  
    `
  }
}


function savePlayer() {
  $(".js-search-results").on("click", ".save", function (event) {
    const clickedId = $(this).data('playerId');
    const playerToBeSaved = STATE.results.find(item => {
      return item.player.id == `${clickedId}`;
    })


    if (STATE.savedPlayers.find(p => p.player.id === playerToBeSaved.player.id)) {
      alert("Player already selected");
    } else {
      STATE.savedPlayers.push(playerToBeSaved);
      displaySavedPlayers(STATE);
    }
  })
}


function renderSavedPlayers(savedPlayer) {

  return `
     <div class="col-6">
     <div class="saved-player">
     ${savedPlayer.player.firstName ? `<img class="player-image" src="https://nba-players.herokuapp.com/players/${savedPlayer.player.lastName}/${savedPlayer.player.firstName}" />` : ""}
     <p>${savedPlayer.player.firstName} ${savedPlayer.player.lastName}</p>
     <p>${savedPlayer.team.abbreviation}</p>
     <p>Number ${savedPlayer.player.jerseyNumber}</p>
     <p>Position: ${savedPlayer.player.primaryPosition}</p>
     </div>
     </div>
    `
}

function displaySavedPlayers(data) {
  $(".saved-players").empty();
  let html = "<h1>Saved Players</h1> <div class='display-saved-wrapper'><button class='remove-players'>Remove Saved Players</button> <button class='compare-points'> Compare Points Per Game</button> <button class='compare-rebounds'>Compare Rebounds Per Game</button><button class='compare-assists'>Compare Assists Per Game</button></div>"
  if (STATE.savedPlayers.length === 0) {
    html +=
      `
      <h1>You have not selected any players yet</h1>
      `
  }
  else {
    html+=data.savedPlayers.map(function (savedPlayer, index) {
      return renderSavedPlayers(savedPlayer);
    }).join("")
  }
  $savedPlayers.append(html);
  $(".js-search-results").hide();
  $savedPlayers.show();
}

function savedPlayersClick() {
  $(".display-saved-players").click(function () {

    displaySavedPlayers(STATE);
  })
}

function removeSavedPlayers() {
  $(".saved-players").on("click", ".remove-players", function () {
    STATE.savedPlayers = [];
    $(".saved-players").empty();
    $(".saved-players").append(
      `
      <div class="display-saved-wrapper">
      
      </div>
      <h1>Your players have been removed. Please search for new players!</h1>
  
     `)
  })
}


function backToSearch() {
  $(".saved-players").on('click', '.back-to-search', function () {
    $(".saved-players").hide();
    $(".search-players").show();
    $(".player").remove();
    $(hideSearchResults);
  })
}

function removeFromHome() {
  $(".remove-players").click(function () {
    STATE.savedPlayers = [];
  })
}




function comparePoints() {
  $(".saved-players").on('click', '.compare-points', function () {
    STATE.savedPlayers.sort(function (a, b) {
      return parseFloat(b.stats.offense.ptsPerGame) - (a.stats.offense.ptsPerGame);
    })

    $(".saved-players").empty();
    $(".saved-players").append("<h1>Players sorted by points per game scored</h1> <div class='display-saved-wrapper'><button class='remove-players'>Remove Saved Players</button> <button class='comparePoints'> Compare Points Per Game</button> <button class=compare-rebounds>Compare Rebounds Per Game</button><button class='compare-assists'>Compare Assists Per Game</button> <div class='row><div class='col-12'></div></div></div>")
    STATE.savedPlayers.forEach(function (player, index) {
      renderPointsScored(player, index);
    });

  })
}

function renderPointsScored(player, index) {
  $(".saved-players").append(
    `
    <div class="col-6">
    <div class="player">
    ${player.player.firstName ? `<img class="player-image" src="https://nba-players.herokuapp.com/players/${player.player.lastName}/${player.player.firstName}" />` : ""}
    <p class="rank">Rank: ${index + 1}</p>
    <p>${player.player.firstName} ${player.player.lastName}</p>
    <p>${player.team.abbreviation}</p>
    <p class="highlight">Points Per Game: ${player.stats.offense.ptsPerGame}</p>
    </div>
    </div>
  `
  )
}

function backFromPoints() {
  $(".saved-players").on('click', '.back-from-points', function () {
    $(".saved-players").hide();
    $(".search-players").show();
    $(".player").remove();
    $(hideSearchResults)
  })
}

function compareRebounds() {
  $(".saved-players").on('click', '.compare-rebounds', function () {
    STATE.savedPlayers.sort(function (a, b) {
      return parseFloat(b.stats.rebounds.rebPerGame['#text']) - (a.stats.rebounds.rebPerGame['#text']);
    })

    $(".saved-players").empty();
    $(".saved-players").append("<h1>Players sorted by rebounds collected</h1> <div class='row'><div class='col-12'><div class='display-saved-wrapper'><button class='remove-players'>Remove Saved Players</button> <button class='compare-points'> Compare Points Per Game</button> <button class=compare-rebounds>Compare Rebounds Per Game</button><button class='compare-assists'>Compare Assists Per Game</button></div></div></div>")

    let reboundsSorted = STATE.savedPlayers.map(function (player, index) {
      return renderRebounds(player, index);
    });
  })
}

function renderRebounds(player, index) {
  $(".saved-players").append(`
    <div class="col-6">
    <div class="player">
      ${ player.player.firstName ? `<img class="player-image" src="https://nba-players.herokuapp.com/players/${player.player.lastName}/${player.player.firstName}" />` : ""}
      <p class="rank">Rank: ${index + 1}</p>
      <p>${player.player.firstName} ${player.player.lastName}</p>
      <p>${player.team.abbreviation}</p>
      <p class="highlight">Rebounds Per Game: ${player.stats.rebounds.rebPerGame}</p>
   </div>
   </div>
 `
  )
}

function backFromRebounds() {
  $(".saved-players").on('click', '.back-from-rebounds', function () {
    $(".saved-players").hide();
    $(".search-players").show();
    $(".player").remove();
    $(hideSearchResults)
  })
}

function compareAssists() {
  $(".saved-players").on('click', '.compare-assists', function () {
    STATE.savedPlayers.sort(function (a, b) {
      return parseFloat(b.stats.offense.astPerGame) - (a.stats.offense.astPerGame);
    })

    $(".saved-players").empty();
    $(".saved-players").append("<h1>Players sorted by assists dished</h1> <div class='row'><div class='col-12'><div class='display-saved-wrapper'><button class='remove-players'>Remove Saved Players</button> <button class='compare-points'> Compare Points Per Game</button> <button class=compare-rebounds>Compare Rebounds Per Game</button><button class='compare-assists'>Compare Assists Per Game</button></div></div></div>")

    let reboundsSorted = STATE.savedPlayers.map(function (player, index) {
      return renderAssists(player, index);
    });

  })
}

function renderAssists(player, index) {
  $(".saved-players").append(`
    <div class="col-6">
    <div class="player">
      ${ player.player.firstName ? `<img class="player-image" src="https://nba-players.herokuapp.com/players/${player.player.lastName}/${player.player.firstName}" />` : ""}
      <p class="rank">Rank: ${index + 1}</p>
      <p>${player.player.firstName} ${player.player.lastName}</p>
      <p>${player.team.abbreviation}</p>
      <p class="highlight">Assists Per Game: ${player.stats.offense.astPerGame}</p>
    </div>
    </div>
 `
  )
}

function backFromAssists() {
  $(".saved-players").on('click', '.back-from-assists', function () {
    $(".saved-players").hide();
    $(".search-players").show();
    $(".player").remove();
  })
}

$(function () {
  watchSubmit()
  instructionsOn()
  instructionsOff();
  savePlayer();
  hideSavedSection();
  backToSearch();
  backFromPoints()
  backFromRebounds();
  backFromRebounds();
  backFromAssists();
  comparePoints();
  compareRebounds();
  compareAssists();
  hideSearchResults();
  homeToSave();
  hideSearchResults();
  savedPlayersClick();
  removeSavedPlayers();
  removeFromHome()
});