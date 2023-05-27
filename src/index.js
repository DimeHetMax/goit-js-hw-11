import "simplelightbox/dist/simple-lightbox.min.css";
import SimpleLightbox from "simplelightbox";
import {getPictures, Notify, PER_PAGE} from "./api";

const refs = {
    form: document.querySelector(".search-form"),
    galleryEl: document.querySelector(".gallery"),
    loadButton: document.querySelector(".load-more")
}

hideLoadButton()

let page = 1;
let searchQuery;

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
    getPictures(searchQuery, page)
    .then(renderHTML)
    .then(initializeLightbox)
    .then(smootheSlide)
    .catch(onError)
    
    refs.loadButton.classList.remove("visually-hidden");
    refs.form.elements.searchQuery.value = "";
}

function renderHTML({data}){
    const {hits} = data;
    if(data.total === 0){
        hideLoadButton()
        return Notify.info("Sorry, there are no images matching your search query. Please try again.")
    }else if(data.total <= PER_PAGE){
        hideLoadButton()
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
   .then( data => {
        if(data === undefined){
            return 
        }
    renderHTML(data)
   })
   .then(initializeLightbox)
   .then(smootheSlideLoadMore)
   .catch()
}

function updateMarkUp(markup){
    refs.galleryEl.insertAdjacentHTML("beforeend", markup)
}
function clearPictureList(){
    refs.galleryEl.innerHTML = "";
}

function updatePage(){
    return page +=1
}
function initializeLightbox() {
   return new SimpleLightbox('.photo-card .large-img-link', {captions: true, captionsData: 'alt', captionPosition: 'bottom', captionDelay: 250});
}
function smootheSlide(){
    if(refs.galleryEl.firstChild){
        const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
        window.scrollBy({
        top: cardHeight / 2,
        behavior: "smooth",
        });
    }
}
function smootheSlideLoadMore(){
    const { height: cardHeight } = document.querySelector(".gallery").firstElementChild.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 1.5,
      behavior: "smooth",
    })
}

export function hideLoadButton(){
    refs.loadButton.classList.add("visually-hidden");
}
export function onError(error){
    Notify.failure(`${error}`);
}