// searchPlaces.js
export const getPlaceDetails = (placeId) => {
  return new Promise((resolve, reject) => {
    const service = new google.maps.places.PlacesService(
      document.createElement("div")
    );
    service.getDetails(
      {
        placeId: placeId,
        fields: [
          "place_id",
          "name",
          "formatted_phone_number",
          "website",
          "photos",
          "geometry",
          "rating",
          "formatted_address",
          "vicinity",
        ],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Verificar que place.geometry y place.geometry.location existan
          if (!place.geometry || !place.geometry.location) {
            reject("Geometry or location not available for this place");
            return;
          }

          // Define y llena 'details' con la información que quieres devolver
          const details = {
            placeId: place.place_id,
            name: place.name,
            phoneNumber: place.formatted_phone_number,
            website: place.website,
            rating: place.rating,
            address: place.formatted_address || place.vicinity,
            location: {
              lat: typeof place.geometry.location.lat === 'function' ? place.geometry.location.lat() : place.geometry.location.lat,
              lng: typeof place.geometry.location.lng === 'function' ? place.geometry.location.lng() : place.geometry.location.lng,
            },
            photos: place.photos
              ? place.photos.map((photo) => photo.getUrl())
              : [],
          };
          resolve(details);
        } else {
          reject(status);
        }
      }
    );
  });
};

export const initSearch = async (city, business, callback, location) => {
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  );

  if (!location) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: city, componentRestrictions: { country: 'AR' } }, (results, status) => {
      if (status === "OK" && results[0]) {
        location = results[0].geometry.location;
        doSearch(location);
      } else {
        console.error("Geocode no tuvo éxito por la siguiente razón: " + status);
        callback(null);
      }
    });
  } else {
    doSearch(location);
  }

  function doSearch(loc) {
    if (!loc) return;

    const request = {
      location: loc,
      radius: "50000",
      keyword: business,
      maxResultCount: 30,
    };

    console.log(request);
    service.nearbySearch(request, async (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        const detailsPromises = results.map((result) =>
          getPlaceDetails(result.place_id)
        );

        try {
          const detailsArray = await Promise.all(detailsPromises);
          console.log(detailsArray);
          callback(detailsArray);
        } catch (error) {
          console.error(error);
        }
      }
    });
  }
};


// export const autocompleteInput = () =>{

//     const center = { lat: -31.537297012068002, lng: -68.52507581988237 };

//     const defaultBounds = {
//         north: center.lat + 0.1,
//         south: center.lat - 0.1,
//         east: center.lng + 0.1,
//         west: center.lng - 0.1,
//       };
//     const options = {
//         bounds: defaultBounds,
//         componentRestrictions: { country: "ar" },
//         fields: ["address_components", "geometry", "icon", "name"],
//         strictBounds: false,
//         types: ["establishment"],
//       };
    
//       const input = document.getElementById("autocomplete");
//     const autocomplete = new google.maps.places.Autocomplete(input, options);
//     console.log(autocomplete);
    


// }