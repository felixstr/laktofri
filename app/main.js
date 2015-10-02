// alert('asdf');

angular.module('laktofriApp', ['ui.router'])
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
		
		$stateProvider
			.state('scan', {
				url: '/',
				templateUrl: 'view/scan.html'
			})
			.state('products', {
				url: '/products',
				templateUrl: 'view/products.html'
			})
			.state('review', {
				url: '/review',
				templateUrl: 'view/review.html'
			});
			
	})
	.controller('mainController', function($scope, $state) {
		var mainCtrl = this;

		$scope.$on('changeView', function(event, msg) {

			switch($state.current.name) {
				case 'scan': 
					mainCtrl.title = 'Scanner';
					mainCtrl.className = 'viewScan';
					mainCtrl.viewName = 'scan';
				break;
				case 'products': 
					mainCtrl.title = 'Meine Produkte'
					mainCtrl.className = 'viewProducts';
					mainCtrl.viewName = 'products';
				break;
				case 'review': 
					mainCtrl.title = 'Meine Produkte'
					mainCtrl.className = 'viewReview';
					mainCtrl.viewName = 'products';
				break;
			}
		});

	})
	.controller('scanController', function($rootScope) {
		var scanC = this; // $scope
		$rootScope.$broadcast('changeView');
		
	})
	.controller('productController', function($rootScope, $scope) {
		
		$rootScope.$broadcast('changeView');
		
		
	})
	.controller('reviewController', function($rootScope) {
		var scanR = this; // $scope
		$rootScope.$broadcast('changeView');
// 		mainC.title = 'Meine Produkte';
		
	});
	


