"use strict";

const searchForm = document.getElementById('search');


searchForm.addEventListener('submit', (e) => {
    e.preventDefault();


    if (document.getElementById('title-input').value.length >= 2) {
        pageNavReset();
        intiate();
    }
});


async function intiate(pagefetch, currentPage) {
    LoadingAnim();

    if (pagefetch) {
        const resArr = await fetchProtocol(currentPage, pagefetch)
        renderCards(resArr.resultsContent);
    } else {
        const resArr = await fetchProtocol()
        renderCards(resArr.resultsContent);
        pages(resArr.resCount)
    }
};


async function fetchProtocol(currentPage, pagefetch) {
    const movieTitle = document.getElementById('title-input').value.toLowerCase();
    const movieYear = document.getElementById('year-input').value;

    const fetchUrl = movieYear ? `https://www.omdbapi.com/?apikey=8792c2ab&type=movie&s=${movieTitle}&y=${movieYear}` : `https://www.omdbapi.com/?apikey=8792c2ab&type=movie&s=${movieTitle}`;

    const pageFetchUrl = pagefetch && movieYear ? `https://www.omdbapi.com/?apikey=8792c2ab&type=movie&s=${movieTitle}&y=${movieYear}&page=${currentPage}` : pagefetch ? `https://www.omdbapi.com/?apikey=8792c2ab&type=movie&s=${movieTitle}&page=${currentPage}` : "nope";


    // search by search
    const bySearchJson = await fetch(pageFetchUrl !== "nope" ? pageFetchUrl : fetchUrl);
    const bySearchRes = await bySearchJson.json();

    // search by ID
    const byIdResArr = new Array;
    const bySearchResArrLen = bySearchRes.Search.length;
    for (let i = 0; i < bySearchResArrLen; i++) {
        const byIdJson = await fetch(`https://www.omdbapi.com/?apikey=8792c2ab&type=movie&i=${bySearchRes.Search[i].imdbID}`);
        const byIdRes = await byIdJson.json();
        byIdResArr.push(byIdRes);

    }

    return {
        resultsContent: byIdResArr,
        resCount: bySearchRes.totalResults
    }
};


function renderCards(movies) {
    const resCon = document.getElementById("results");

    const movieCardsHtmlArr = movies.map(movie => {
        return getMovieCardHtml(movie);
    }).join(`<hr />`);

    resCon.innerHTML = movieCardsHtmlArr;
};


function getMovieCardHtml(movie) {
    const { Title, Poster, Actors, Director, Genre, Awards, Plot, Year, Runtime, Ratings, Language, Country, imdbID } = movie;

    const na = "N/A";
    const unavalible = "";

    const actionBtn = getMovieCardBtnHtml(imdbID)

    const imdb = 'Internet Movie Database';
    const roTo = 'Rotten Tomatoes';
    let ratingHtmlArr = new Array;
    if (Ratings.length) {
        ratingHtmlArr = Ratings.map(rate => {
            const sourceImg = rate.Source === imdb ? `<img class="imdb-ic" src="img/logos/imdb-icon.svg" alt="" />` : rate.Source === roTo ? ` <img class="rotten_tomatoes-ic" src="img/logos/Rotten_Tomatoes_logo.svg" alt="" />` : ` <img class="metacritic-ic" src="img/logos/Metacritic.svg" alt="" />`;

            const value = `<p class="">${rate.Value}</p>`;

            return `
                <div class="rating-icon-container un-selectable">
                    ${sourceImg}
                    ${value}
                </div>
            `;
        }).join("");
    } else {
        ratingHtmlArr = [`
        <div class="rating-icon-container un-selectable">
            <p>no ratings available</p>
        </div>
        `]
    }


    const cardHtml = `
    <div class="movie-card-container">
        <img class="movie-card-poster un-selectable"
            src="${Poster != na ? Poster : `img/not.jpg`}" />

        <div class="movie-card-description">

            <div class="section-one marg-bott">
                <div class="section-one-one">
                    <h2>${Title}</h2>

                    <div class="section-one-one-two minify un-selectable">
                        <p>${Genre != na ? Genre : unavalible}</p>
                        <p>${Year != na ? Year : unavalible}</p>
                        <p>${Runtime != na ? Runtime : unavalible}</p>
                        <p>${Country != na ? Country : unavalible}</p>
                    </div>
                </div>

                <div class="section-one-two">

                    <div class="section-one-two-one">

                        ${ratingHtmlArr}

                    </div>

                    ${actionBtn.outerHTML}
                </div>
            </div>


            <div class="marg-bott minify">
                <p>
                    ${Director != na ? `Director :` : unavalible}
                    <span>
                    ${Director != na ? Director : unavalible}
                    </span>
                </p>
                <p>
                    ${Actors != na ? `Actor(s) :` : unavalible}
                    <span>
                    ${Actors != na ? Actors : unavalible}
                    </span>
                </p>
            </div>

            <p class="plot marg-bott un-selectable">
            ${Plot != na ? Plot : unavalible}
            </p>

            <p class="awards-container marg-bott minify un-selectable">
                ${Awards != na ? `Awards :` : unavalible}
                <span>
                ${Awards != na ? Awards : unavalible}
                </span>
            </p>

            <p class="lang-container minify un-selectable">${Language != na ? Language : unavalible}</p>

        </div>
    </div>`

    return cardHtml;
};

function getMovieCardBtnHtml(id) {
    const watchListArr = JSON.parse(localStorage.getItem("watchList"));
    const btn = document.createElement('button');
    btn.classList.add("un-selectable")
    if (watchListArr) {
        const saveCheck = getIndexOfId(watchListArr, id);
        if (saveCheck != -1) {
            btn.setAttribute("id", "action-btn");
            btn.setAttribute("onclick", "deleteMe(this)");
            btn.dataset.imdbId = id;
            btn.style.backgroundImage = 'url("img/icons/remove.svg")';
            btn.style.width = '100px';
            btn.textContent = "Remove";

            return btn;
        } else {
            unsavedState();
            return btn;

        }
    } else {
        unsavedState();
        return btn;
    }

    function unsavedState() {
        btn.setAttribute("id", "action-btn");
        btn.setAttribute("onclick", "saveMe(this)");
        btn.dataset.imdbId = id;
        btn.style.backgroundImage = 'url("img/icons/add.svg")';
        btn.textContent = "Watch Later";
    }
}

/////////////////////////////////////////////////////////////////////////////////////

function pages(movieCount) {
    const numPages = numberOfPages(movieCount);
    renderPagesNav(numPages);
}

function numberOfPages(movieCount) {
    const remainder = movieCount % 10
    let pages

    if (movieCount > 10) {
        if (remainder) {
            pages = ((movieCount - remainder) / 10) + 1
            return pages;
        } else {
            pages = movieCount / 10
            return pages;
        }
    } else {
        return 0;
    }
}

function renderPagesNav(numOfPages) {
    const navCon = document.getElementById("page-nav");

    const pageIndex = document.createElement('span');

    if (numOfPages) {
        const prevBtn = document.createElement('button');
        prevBtn.setAttribute("id", "prev");
        prevBtn.setAttribute("type", "button");
        prevBtn.classList.add("nav-btn-enabled", "nav-btn")
        prevBtn.textContent = "previous";
        navCon.appendChild(prevBtn);

        pageIndex.setAttribute("id", "page-index");
        pageIndex.textContent = `${currentPage} of ${numOfPages}`
        navCon.appendChild(pageIndex);

        const nexBtn = document.createElement('button');
        nexBtn.setAttribute("id", "nex");
        nexBtn.setAttribute("type", "button");
        nexBtn.classList.add("nav-btn-enabled", "nav-btn")
        nexBtn.textContent = "next";
        navCon.appendChild(nexBtn);

        navCon.removeAttribute("hidden");

        pageNavControls(numOfPages);

    } else {
        !navCon.hasAttribute("hidden") ? navCon.setAttribute("hidden", "") : {};
    }
}

let pagefetch = false;
let currentPage = 1;
function pageNavControls(numOfPages) {

    const prev = document.getElementById("prev");
    const nex = document.getElementById("nex");
    const pageIndex = document.getElementById("page-index");

    if (nex) {
        nex.addEventListener('click', function () {
            if (currentPage < numOfPages) {
                currentPage++;
                pageNavStatus(currentPage, numOfPages, prev, nex);
                pageIndex.textContent = `${currentPage} of ${numOfPages}`;
                pagefetch = true;
                intiate(pagefetch, currentPage);
            }
        })
    }

    if (prev) {
        pageNavStatus(currentPage, numOfPages, prev, nex);
        prev.addEventListener('click', function () {
            if (currentPage > 1) {
                currentPage--;
                pageNavStatus(currentPage, numOfPages, prev, nex);
                pageIndex.textContent = `${currentPage} of ${numOfPages}`;
                pagefetch = true;
                intiate(pagefetch, currentPage);
            }
        })
    }

}

function pageNavStatus(currentPage, numOfPages, prevBtn, nexBtn) {
    if (currentPage === numOfPages) {
        nexBtn.classList.remove("nav-btn-enabled")
        nexBtn.classList.add("nav-btn-disabled")
    } else {
        nexBtn.classList.remove("nav-btn-disabled")
        nexBtn.classList.add("nav-btn-enabled")
    }

    if (currentPage === 1) {
        prevBtn.classList.remove("nav-btn-enabled")
        prevBtn.classList.add("nav-btn-disabled")

    } else {
        prevBtn.classList.remove("nav-btn-disabled")
        prevBtn.classList.add("nav-btn-enabled")
    }
}

function pageNavReset() {
    pagefetch = false;
    currentPage = 1;
    const navCon = document.getElementById("page-nav");
    navCon.innerHTML = '';
}

/////////////////////////////////////////////////////////////////////////

function saveMe(element) {
    const LocalacessState = isLocalStorageSupported();

    if (LocalacessState) {
        const updateActionBtn = true;
        actionBtnState(updateActionBtn, element);

        const innards = element.parentElement.parentElement.parentElement.parentElement.outerHTML;

        const storCheck = localStorage.getItem("watchList");
        if (storCheck) {
            const watchListArr = JSON.parse(storCheck);
            watchListArr.push({
                id: element.dataset.imdbId,
                card: innards
            });
            localStorage.setItem("watchList", JSON.stringify(watchListArr));

            // const updateActionBtn = true;
            // actionBtnState(updateActionBtn, element);
        } else {
            const watchListArr = new Array;
            watchListArr.push({
                id: element.dataset.imdbId,
                card: innards
            });
            localStorage.setItem("watchList", JSON.stringify(watchListArr));

            // const updateActionBtn = true;
            // actionBtnState(updateActionBtn, element);
        }
    }
}


function deleteMe(element) {
    const watchListArr = JSON.parse(localStorage.getItem("watchList"));
    const movieId = element.dataset.imdbId;
    const deleteIndex = getIndexOfId(watchListArr, movieId);

    watchListArr.splice(deleteIndex, 1);
    localStorage.setItem("watchList", JSON.stringify(watchListArr));

    const updateActionBtn = false;
    actionBtnState(updateActionBtn, element);
}


function actionBtnState(add, btnElement) {
    if (add) {
        btnElement.setAttribute('onclick', 'deleteMe(this)');
        btnElement.textContent = 'Remove';
        btnElement.style.backgroundImage = 'url(img/icons/remove.svg)';
        btnElement.style.width = '100px';
    } else {
        btnElement.setAttribute('onclick', 'saveMe(this)');
        btnElement.textContent = 'Watch Later';
        btnElement.style.backgroundImage = 'url("img/icons/add.svg")';
        btnElement.style.width = '125px';
    }

}

//////////////////////////////////////////////////////////

function LoadingAnim() {
    const resCon = document.getElementById("results");
    const loaSvg = `<div class="un-selectable loading-svg-cont">
    <svg class="load-s" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
        <path fill="none" stroke="lightgrey" d="M20,50 C20,-50 180,150 180,50 C180-50 20,150 20,50 z" />
        <circle r="5" fill="red">
            <animateMotion dur="5s" repeatCount="indefinite"
                path="M20,50 C20,-50 180,150 180,50 C180-50 20,150 20,50 z" />
        </circle>
    </svg>
</div>`;

    resCon.innerHTML = loaSvg;
}

function isLocalStorageSupported() {
    try {
        localStorage.setItem("blah", "blah");
        localStorage.removeItem("blah");
        return true;
    } catch (e) {
        alert(e);
        return false;
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

