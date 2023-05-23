import { Notify } from 'notiflix/build/notiflix-notify-aio';

import "simplelightbox/dist/simple-lightbox.min.css";
import SimpleLightbox from "simplelightbox";

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

// refs.loadButton.classList.add("hidden");
hideLoadButton()

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
    page = 1
    refs.loadButton.classList.remove("hidden");

    getPictures(searchQuery, page)
    .then(renderHTML)
    .then(initializeLightbox)
    .then(smootheSlide)
    
    refs.form.elements.searchQuery.value = "";
}
async function getPictures(query, pageNum){
    try{
        return await axios.get(`${URL}?key=${KEY}&q=${query}&page=${pageNum}&per_page=39&orientation=horizontal&image_type=photo&safesearch=true`);
    }catch(error){
        // refs.loadButton.classList.add("hidden");
        hideLoadButton()
        if(error.message === "Request failed with status code 400"){
          Notify.failure("We're sorry, but you've reached the end of search results.")
        }else{
            onError(error)
        }
    }
}

function renderHTML({data}){
    const {hits} = data;
    if(data.total === 0){
        // refs.loadButton.classList.add("hidden");
        hideLoadButton()
        return Notify.info("Sorry, there are no images matching your search query. Please try again.")
    }
    Notify.success(`Hooray! We found ${data.totalHits} images.`)

   const photoCard = hits.map(({webformatURL, largeImageURL, tags, likes, views, comments, downloads}) =>{
        return `
        <div class="photo-card">
            <a href="${largeImageURL}" class="large-img-link">
                <img src="${webformatURL}" alt="${tags}" loading="lazy" />
            </a>
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
   getPictures(searchQuery, pageNumber)
   .then(renderHTML)
   .then(initializeLightbox)
   .then(smootheSlideLoadMore)
}

function updateMarkUp(markup){
    refs.galleryEl.insertAdjacentHTML("beforeend", markup)
}
function clearPictureList(){
    refs.galleryEl.innerHTML = "";
}
function onError(error){
    Notify.failure(`${error}`);
}
function updatePage(){
    return page +=1
}
function initializeLightbox() {
   return new SimpleLightbox('.photo-card .large-img-link', {captions: true, captionsData: 'alt', captionPosition: 'bottom', captionDelay: 250});
  }
function smootheSlide(){
    const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight / 2,
      behavior: "smooth",
    });
}
function smootheSlideLoadMore(){
    const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 1.5,
      behavior: "smooth",
    })
}

function hideLoadButton(){
    refs.loadButton.classList.add("hidden");
}