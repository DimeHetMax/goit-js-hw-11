import { Notify } from 'notiflix/build/notiflix-notify-aio';
const axios = require('axios').default;
Notify.init({
    width: '350px',
    position: 'right-top',
    success: {
        background: '#ffb91a',
        textColor: '#333',
        },
    info: {
        background: '#333',
        },
    });

const refs = {
    form: document.querySelector(".search-form"),
    galleryEl: document.querySelector(".gallery"),
    loadButton: document.querySelector(".load-more")
}
refs.loadButton.classList.add("hidden");

let page = 1;
let searchQuery;

const URL = "https://pixabay.com/api/";
const KEY = "36536171-20dffb6feebbd7a17f40a2c96"

refs.form.addEventListener("submit", onButton);
refs.loadButton.addEventListener("click", addMarkUpOnLoadButton)

function onButton(event){
    event.preventDefault()
    const form = event.currentTarget
    searchQuery = form.elements.searchQuery.value.trim();
    
    if(searchQuery === ""){
        return
    }
    clearPictureList()

    refs.loadButton.classList.remove("hidden");
    getPictures(searchQuery, page).then(renderHTML).catch(console.log)
    refs.form.elements.searchQuery.value = "";
}

function updatePage(){
    return page +=1
}

async function getPictures(query, pageNum){
    try{
        return await axios.get(`${URL}?key=${KEY}&q=${query}&page=${pageNum}&per_page=39&orientation=horizontal&image_type=photo`);
    }catch(error){
       return onError(error)
    }
}

function renderHTML({data}){
    const {hits} = data;
    if(data.total === 0){
        refs.loadButton.classList.add("hidden");
        return Notify.info("Sorry, there are no images matching your search query. Please try again.")
    }
    Notify.success(`Hooray! We found ${data.totalHits} images.`)
    console.log(hits);
   const photoCard = hits.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) =>{
        return `
        <div class="photo-card">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" />
        <div class="info">
            <p class="info-item">
            <b>Likes: ${likes}</b>
            </p>
            <p class="info-item">
            <b>Views: ${views}</b>
            </p>
            <p class="info-item">
            <b>Comments: ${comments}</b>
            </p>
            <p class="info-item">
            <b>Downloads: ${downloads}</b>
            </p>
        </div>
        </div>
        `
    }).join(" ");

    updateMarkUp(photoCard)
}

function addMarkUpOnLoadButton(){
   const pageNumber = updatePage()
   getPictures(searchQuery, pageNumber).then(renderHTML).catch(console.log)
}

function updateMarkUp(markup){
    refs.galleryEl.insertAdjacentHTML("beforeend", markup)
}
function clearPictureList(){
    refs.galleryEl.innerHTML = "";
}
function onError(error){
    console.log(error);
    Notify.failure(`${error}`);
}