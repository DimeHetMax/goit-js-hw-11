import { Notify } from 'notiflix/build/notiflix-notify-aio';
import axios from 'axios';
import {hideLoadButton, onError} from "./index";
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

const URL = "https://pixabay.com/api/";
const KEY = "36536171-20dffb6feebbd7a17f40a2c96"
const PER_PAGE = 39;

async function getPictures(query, pageNum){
    try{
        return await axios.get(`${URL}?key=${KEY}&q=${query}&page=${pageNum}&per_page=${PER_PAGE}&orientation=horizontal&image_type=photo&safesearch=true`);
    }catch(error){
        hideLoadButton()
        if(error.message === "Request failed with status code 400"){
          Notify.failure("We're sorry, but you've reached the end of search results.")
        }else{
            onError(error)
        }
    }
}
export {getPictures, Notify, PER_PAGE};