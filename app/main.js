Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
};

angular.module('laktofriApp', ['ui.router', 'swipe', 'ngAnimate'])
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
	.controller('scanController', function($rootScope, $timeout, product_list, product_list_codecheck) {
		var scanC = this; // $scope
		$rootScope.$broadcast('changeView');
		
		scanC.currentItem = null;
		scanC.currentItemAddon = null;
		scanC.product_list = product_list;
		scanC.product_list_codecheck = product_list_codecheck;
		scanC.status = '';
		
		var barcode_array = [];
		angular.forEach(scanC.product_list, function (value, key) {
			barcode_array.push(value.barcode);
		});
		angular.forEach(scanC.product_list_codecheck, function (value, key) {
			barcode_array.push(value.barcode);
		});

		scanC.scan = function() {
			if (scanC.currentItem != null) {
				scanC.currentItem = null;
				scanC.status = '';
			} else {
				var barcode = barcode_array[Math.floor(Math.random() * barcode_array.length)];
	// 			console.log(barcode);
				
				var newItem = null;
	
				angular.forEach(scanC.product_list, function (value, key) {
			        if (barcode == value.barcode) {
				        newItem = {
					        barcode: value.barcode,
					        name: value.name,
					        image: value.image,
					        reviewed: value.reviewed,
					        review_state: value.review_state,
					        review_date: value.review_date,
					        laktose: true
				        };
		            }
		        });	
		        
		        if (newItem == null) {
			        angular.forEach(scanC.product_list_codecheck, function (value, key) {
				        if (barcode == value.barcode) {
					        newItem = {
						        barcode: value.barcode,
						        name: value.name,
						        image: value.image,
						        reviewed: false,
						        review_state: '',
						        review_date: '',
						        laktose: value.laktose
					        };
			            }
			        });
		        }
		        
		        
		        if (newItem != null) {
			        scanC.status = 'load';
			        $timeout(function() {
				        scanC.status = '';
				        scanC.currentItem = newItem;
			        }, 1500);
		        }

     	    }    
		
		}
		
		scanC.addToLibrary = function(item) {
			if (item.laktose) {
				console.log('asdf');
				scanC.status = 'toLibrary';
				
				$timeout(function() {
					
					var itemChange = false;
					var date = new Date();
					
					angular.forEach(scanC.product_list, function (value, key) {
						if (item.barcode == value.barcode) {
							itemChange = true;
							
							
							value.reviewed = false;
							value.review_date = '';
							value.review_state = '';
							value.review_state_filter = '';
							value.add_date = date.yyyymmdd();
						}
					});
					
					if (!itemChange) {
						scanC.product_list.push({
							barcode: item.barcode,
							name: item.name,
							image: item.image,
							reviewed: false,
							review_date: '',
							review_state: '',
							review_state_filter: '',
							add_date: date.yyyymmdd()
						})
					}
					
					scanC.currentItem = null;
					scanC.status = '';
				
				}, 1000);

			
			}
			
		}
		
	})
	.controller('productController', function($rootScope, $scope, product_list) {
		var productC = this;
		
		$rootScope.$broadcast('changeView');
		
		productC.product_list = product_list;
		productC.currentState = 'all';
		productC.itemEdit = null;
				
		productC.changeFilter = function(state) {
			angular.forEach(productC.product_list, function (value, key) {
				value.review_state_filter = value.review_state;
	        });
			
			if(state == 'all') {
				productC.currentState = 'all';
			} else {
				productC.currentState = state;
			}
		}
		
		productC.openEdit = function(item) {
			productC.itemEdit = item;
		}
		
		productC.changeReview = function(item, state) {
			productC.itemEdit = null;
			
			angular.forEach(productC.product_list, function (value, key) {
		        if (item == value) {
	            	value.review_state = state;
	            }
	        });
	        
		}
		productC.deleteProduct = function(item) {
			
			
			angular.forEach(productC.product_list, function (value, key) {
		        if (item == value) {
			        productC.product_list.splice(key, 1);
	            }
	        });
	        
	        productC.itemEdit = null;
		}
		
		
	})
	.controller('reviewController', function($rootScope, product_list) {
		var reviewC = this; // $scope
		reviewC.product_list = product_list;
		
		$rootScope.$broadcast('changeView');
		
		
		reviewC.setReview = function(event, item, state) {
// 			console.log(event);
			angular.forEach(reviewC.product_list, function (value, key) {
		        if (item == value) {
			        var now = new Date();
			        
	            	value.reviewed = true;
	            	value.review_date = now.yyyymmdd();
	            	value.review_state = state;
	            	value.review_state_filter = state;
	            }
	        });
		}

// 		console.log(product_list);
		
	})
	.filter('productFilter', function() {
		return function (products, state) {
	        var out = [];
	        
	        angular.forEach(products, function (value, key) {
		        if (state == 'all') {
	            	out.push(value);
	            } else if (value.review_state_filter == state) {
		            out.push(value);
	            }
	        });
	        return out;
	    };
	})
	.value('product_list', [
		{
			barcode: '7610200282774',
			name: 'Actilife - Muesli Crunch mix plus 600g',
			image: 'http://www.codecheck.info/img/197056/1',
			reviewed: true,
			review_date: '2015-09-12',
			review_state: 'ok',
			review_state_filter: 'ok',
			add_date: '2015-10-01'
		},
		{
			barcode: '4016249004026',
			name: 'Allos - Amaranth Wildbeeren-Müsli',
			image: 'http://www.codecheck.info/img/25308/1',
			reviewed: true,
			review_date: '2015-09-22',
			review_state: 'good',
			review_state_filter: 'good',
			add_date: '2015-10-01'
		},
		{
			barcode: '9005182007008',
			name: 'ja! Natürlich Vanillemilch',
			image: 'http://www.codecheck.info/img/48987982/1',
			reviewed: true,
			review_date: '2015-08-01',
			review_state: 'bad',
			review_state_filter: 'bad',
			add_date: '2015-10-01'
		},
		{
			barcode: '8722700644682',
			name: 'Knorr Soße zu Geflügel',
			image: 'http://www.codecheck.info/img/48824937/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		},
		{
			barcode: '4003490039396',
			name: 'Happy Milchdrink 0,3% - Erdbeeren',
			image: 'http://www.lebensmittel.de/productpics//w_400/h_400/4003490039396_s_1.jpg',
			reviewed: true,
			review_date: '2015-05-23',
			review_state: 'ok',
			review_state_filter: 'ok',
			add_date: '2015-10-01'
		},
		{
			barcode: '4000540003765',
			name: 'Kölln Müsli Knusper Karamell',
			image: 'http://www.codecheck.info/img/48979576/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		},
		{
			barcode: '2000422455356',
			name: 'Jeden Tag Bananen-Trunk (1,18 EUR/1 l)',
			image: 'http://prdimg.affili.net/img/size/180/src/d2jdyzt6tc17s.cloudfront.net/products/images/4503080045_4250780306755_01.jpg.jpg',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		},
		{
			barcode: '4008230489103',
			name: 'Saliter Milchmischgetränk Erdbeer',
			image: 'http://www.codecheck.info/img/48811867/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		},
		{
			barcode: '9003740086793',
			name: 'Chef Menü - Sandwich mit Thunfisch und Ei',
			image: 'http://www.codecheck.info/img/648482/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		},
		{
			barcode: '4104420112360',
			name: 'ALNATURA - Pizza Salami',
			image: 'http://www.codecheck.info/img/106848/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		},
		{
			barcode: '7611654693222',
			name: 'Pizza Pomodori e Pesto',
			image: 'http://www.codecheck.info/img/48776318/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			add_date: '2015-10-01'
		}
	])
	.value('product_list_codecheck', [
		{
			barcode: '8003938005224',
			name: 'Bonta Divina Delizia Vanille (1,54 EUR/100 g)',
	        image: 'http://prdimg.affili.net/img/size/180/src/d2jdyzt6tc17s.cloudfront.net/products/images/4503060972_8003938005224_01.jpg.jpg',
	        laktose: true
		},
		{
			barcode: '4000521012632',
			name: 'Dr. Oetker Süße Mahlzeit Quarkauflauf (1,01 EUR/100 g)',
	        image: 'http://prdimg.affili.net/img/size/180/src/d2jdyzt6tc17s.cloudfront.net/products/images/4502112780_4000521012632_01.jpg.jpg',
	        laktose: true
		},
		{
			barcode: '2130050000007',
			name: 'Bonta Divina Delizia Vanille (1,54 EUR/100 g)',
	        image: 'http://www.codecheck.info/img/28370/1',
	        laktose: true
		},
		{
			barcode: '20430313',
			name: 'Biotrend - Bio Paprika-Lyoner Spitzenqualität',
	        image: 'http://www.codecheck.info/img/48536022/1',
	        laktose: false
		}
	]);
	


