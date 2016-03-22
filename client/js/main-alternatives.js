"use strict";

(function(){

    var map = createMap(getCurrentSearch(), document.querySelector('#map'));
    var currentMapBoundsPlaces = [];
    var filterValues = [];


    function getCurrentBounds(map){
        var bounds = map.getBounds(); 
        return {
            'maxLat': bounds.getNorth(),
            'minLat': bounds.getSouth(),
            'maxLon': bounds.getEast(),
            'minLon': bounds.getWest()
        };
    }

    function refreshMap(){
        displayPlaces(getCurrentSearch(), map, currentMapBoundsPlaces, filterValues);
    }

    function reloadMap(){

        var certified = document.querySelector('#certified').className === 'btn-active';
        findPlaces(getCurrentSearch(), getCurrentBounds(map), certified)
        .then(function(res){
            currentMapBoundsPlaces = res.objects;
            refreshMap();
        });

    }

    /*
        FILTERS
    */
    // fetch('/networks', {headers: {'Content-Type': 'application/json'}})
    fetch('/categories', {headers: {'Content-Type': 'application/json'}})
    .then(function(result){ return result.json() })
    .then(function(categories){
        console.log('categories', categories)
        filterValues = categories.map(function(category){
            return { name: category.name, color: category.color, checked: true };
        });
        
        var filtersElement = document.querySelector('#filters');

        var ul = createFilterList(filterValues, function(newFilterValues){
            filterValues = newFilterValues;
            refreshMap();
        });

        filtersElement.appendChild(ul);
        
        refreshMap();
    })
    .catch(function(err){ console.error('fetch /categories error', err) });

    map.on('moveend', function(){
        reloadMap();
    });

    
    /*
        INIT
    */
    reloadMap();
    document.querySelector('#uncertified').addEventListener('click', reloadMap);
    document.querySelector('#certified').addEventListener('click', reloadMap);
    hideFilters();
})();
