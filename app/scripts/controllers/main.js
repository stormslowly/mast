'use strict';

/**
 * @ngdoc function
 * @name mastApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the mastApp
 */
angular.module('mastApp')
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
  });
