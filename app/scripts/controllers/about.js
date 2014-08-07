'use strict';

/**
 * @ngdoc function
 * @name mastApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the mastApp
 */
angular.module('mastApp')
  .controller('AboutCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
