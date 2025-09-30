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
        ],
      },
      (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
          // Define y llena 'details' con la información que quieres devolver
          const details = {
            placeId: place.place_id,
            name: place.name,
            phoneNumber: place.formatted_phone_number,
            website: place.website,
            location: {
              lat: place.geometry.location.lat(),
              lng: place.geometry.location.lng(),
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

export const initSearch = async (city, business, callback) => {
  const service = new google.maps.places.PlacesService(
    document.createElement("div")
  );

  // Obtener la ubicación de la ciudad
  function getCityLocation(city, callback) {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: city }, (results, status) => {
      if (status === "OK" && results[0]) {
        callback(results[0].geometry.location);
      } else {
        console.error(
          "Geocode no tuvo éxito por la siguiente razón: " + status
        );
        callback(null); // Devolver null en caso de error
      }
    });
  }

  getCityLocation(city, (location) => {
    if (!location) {
      return; // Salir si no se pudo obtener la ubicación
    }

    const request = {
      location: location,
      radius: "50000", // Define el radio en metros
      keyword: business,
      maxResultCount: 30,
    };

    console.log(request);
    service.nearbySearch(request, async (results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Crear un array de promesas para obtener los detalles de todos los lugares encontrados
        const detailsPromises = results.map((result) =>
          getPlaceDetails(result.place_id)
        );

        try {
          // Esperar a que todas las promesas se resuelvan
          const detailsArray = await Promise.all(detailsPromises);
          console.log(detailsArray);
          callback(detailsArray); // Pasar el array de detalles al callback
        } catch (error) {
          console.error(error);
        }
      }
    });
  });
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