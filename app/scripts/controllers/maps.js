'use strict';

/**
 * @ngdoc function
 * @name mastApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mastApp
 */
angular.module('mastApp')
  .controller('MapsCtrl', function ($scope,$resource) {

    var Map = $resource('http://localhost:1337/api/1/map', {
      id: '@id'
    }, {
      update: {
        method: 'PUT'
      }
    });


    $scope.maps = Map.query();
    var x = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


  });
