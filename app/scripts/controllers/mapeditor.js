'use strict';

angular.module('mastApp')
  .controller('MapEditorCtrl', function ($scope,$resource) {

    var Map = $resource('http://localhost:1337/api/1/map', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });


    $scope.maps = Map.query();


  });
