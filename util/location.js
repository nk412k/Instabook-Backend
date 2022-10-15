const axios=require('axios');
const HttpError = require('../models/http-error');

const API_KEY = process.env.MAP_API_KEY;

async function getCoordsForAddress(address){
    // return { lat: 22.5448082, lng: 88.3403691 };

    const response = await axios.get(
      `http://api.positionstack.com/v1/forward?access_key=${API_KEY}&query=${encodeURIComponent(address)}`
    );
    const data=response.data.data[0];
    if(response.status !==200 || !data){
        const error=new HttpError('Could not find the address',404);
        throw error;
    }
    const coordinates={lat:data.latitude,lng:data.longitude};
    return coordinates;
}

module.exports=getCoordsForAddress;