const listCont = document.getElementById("watch-list");

function isItEmptyNow() {
    const placeholder = `<div class="placeholder un-selectable">
    <p>Your watchlist is looking a little empty</p>
    <a href="index.html">let's add some movies!</a>
</div>`;

    if (listCont.childElementCount == 0) {
        listCont.innerHTML = placeholder;
    }

}


function loadList() {
    const watchListArr = JSON.parse(localStorage.getItem("watchList"));
    if (watchListArr.length > 0) {
        const theListHtml = watchListArr.map(listItem => {
            return listItem.card;
        }).join(`<hr />`);

        listCont.innerHTML = theListHtml;
    }

}
loadList();

function deleteMe(element) {
    const watchListArr = JSON.parse(localStorage.getItem("watchList"));
    const movieId = element.dataset.imdbId;
    const deleteIndex = getIndexOfId(watchListArr, movieId);

    watchListArr.splice(deleteIndex, 1);
    localStorage.setItem("watchList", JSON.stringify(watchListArr));

    const movieCard = element.parentElement.parentElement.parentElement.parentElement;

    const cardBreak = movieCard.previousElementSibling
    const hrElement = document.createElement('hr');
    if (hrElement.isEqualNode(cardBreak)) {
        cardBreak.remove();
    }

    movieCard.remove();

    firstElBreakCheck();
    isItEmptyNow();
}


function firstElBreakCheck() {
    const allCards = document.getElementsByClassName("movie-card-container");

    if (allCards.length > 0) {
        const cardBreak = allCards[0].previousElementSibling
        const hrElement = document.createElement('hr');
        if (hrElement.isEqualNode(cardBreak)) {
            cardBreak.remove();
        }
    }
}



function getIndexOfId(arr, id) {
    const len = arr.length
    for (let i = 0; i < len; i++) {
        const index = arr[i].id === id ? i : -1;

        if (index !== -1) {
            return index;
        }
    }

    return -1;
}