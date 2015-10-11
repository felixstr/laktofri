var scanditEnable = false;


Date.prototype.yyyymmdd = function() {
	var yyyy = this.getFullYear().toString();
	var mm = (this.getMonth()+1).toString(); // getMonth() is zero-based
	var dd  = this.getDate().toString();
	return yyyy +'-'+ (mm[1]?mm:"0"+mm[0]) +'-'+ (dd[1]?dd:"0"+dd[0]); // padding
};




angular.module('laktofriApp', ['ui.router', 'ngAnimate', 'ngTouch', 'hmTouchEvents'])
	.config(function($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
		
		$stateProvider
			.state('/', {
				url: '/',
				templateUrl: 'view/scan'+(scanditEnable ? '2' : '')+'.html'
			})
			.state('scan', {
				url: '/scan',
				templateUrl: 'view/scan.html'
			})
			.state('scan2', {
				url: '/scan2',
				templateUrl: 'view/scan2.html'
			})
			.state('products', {
				url: '/products',
				templateUrl: 'view/products.html'
			})
			.state('review', {
				url: '/review',
				templateUrl: 'view/review.html'
			})
			.state('help', {
				url: '/help',
				templateUrl: 'view/help.html'
			});
		
		
		
		
	})
	.run(function ($rootScope, $location, siteProperties) {
		$rootScope.$on("$locationChangeStart", function (event, next, current) {
			$rootScope.path = $location.path();
// 			console.log('siteProperties', siteProperties.scanditEnable);
			var from = current.split('/').reverse()[0];
			var to = next.split('/').reverse()[0];
			
			if (from == '' && to != '') {
				from = 'scan';
				if (siteProperties.scanditEnable) {
					from = 'scan2';
				}
			}
			var pageChange = (from == '' ? '' : from+'_')+to;
			
// 			console.log('from', from);
			if (siteProperties.scanditEnable) {
				if (from == 'scan2') {
					Scandit.hide();
				}
			}

			$rootScope.pageChange = pageChange;
		});
				
	})
	.controller('mainController', function($scope, $state, siteProperties) {
		var mainCtrl = this;
		
		mainCtrl.siteProperties = siteProperties;


	})
	.controller('scanController', function($scope, $animate, $timeout, siteProperties, product_list, product_list_codecheck, Review) {
		var scanC = this; // $scope
		
		siteProperties.title = 'Scanner';
		siteProperties.viewName = 'scan';
		siteProperties.reviewCount = Review.count();
		
		
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
				scanC.status = 'close';
				$timeout(function() {
			        scanC.status = '';
			        scanC.currentItem = null;
		        }, 300);
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
					        laktose: true,
					        message: false
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
						        laktose: value.laktose,
								message: false
					        };
			            }
			        });
		        }
		        
/*
		        newItem = {
					name: 'SORRY!',
					message: "Zu diesem Produkt wurden nicht genügend Daten gefunden. Versuche es mit einem anderen Produkt."
				}
*/
		        
		        
		        if (newItem != null) {
			        scanC.status = 'load';
			        $timeout(function() {

				        scanC.status = '';
				        scanC.currentItem = newItem;
			        }, 1500);
		        }

     	    }    
		
		}
		
		scanC.moveProduct = function(event, item) {
// 			var item = scanC.currentItem;
			
			$('.product').removeClass('animate');
			
			if (item.laktose) {
				
				
				
				event.element.css({
					'transform': 'translateX('+event.deltaX+'px)'
				});
				
		
				
				if (event.isFinal) {
					
					
					
					if (event.deltaX < -60) {
						
						
						scanC.toLibrary(Event, item);
						
		
					} else {
						event.element.css({
							'transform': 'translateX(0px)'
						});
					}
				
				}
			}
			
		}
		
		scanC.toLibrary = function(event, item) {
			scanC.status = 'toLibrary';
			$('.product').addClass('animate');			
				
			$timeout(function() {
				
				var itemChange = false;
				var date = new Date();
				var currentPosition = 0;
				
				angular.forEach(scanC.product_list, function (value, key) {
					if (value.stack_position > currentPosition) {
						currentPosition = value.stack_position;
					}
					if (item.barcode == value.barcode) {
						itemChange = key;
						
						
						value.reviewed = false;
						value.review_date = '';
						value.review_state = '';
						value.review_state_filter = '';
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
						stack_position: currentPosition+1
					})
				} else {
					scanC.product_list[itemChange].stack_position = currentPosition+1;
				}
				
				
				scanC.currentItem = null;
				scanC.status = '';
				siteProperties.reviewCount = Review.count();
				
				
				$('.product').css({
					'transform': 'translateX(0px)'
				});
			
			}, 600);
		}
		
	})
	.controller('scan2Controller', function($scope, $rootScope, $animate, $timeout, $interval, siteProperties, product_list, product_list_codecheck, Review) {
		var scanC = this; // $scope
		
		siteProperties.title = 'Scanner';
		siteProperties.viewName = 'scan';
		siteProperties.reviewCount = Review.count();
		
		
		scanC.currentItem = null;
		scanC.product_list = product_list;
		scanC.product_list_codecheck = product_list_codecheck;
		scanC.status = '';
		
		scanC.barcode = '';
		
		var lastItem = null;
		var lastScan = null;
		
		var interval = $interval(function() {

			var now = new Date().getTime();
			// offenes prodult schliessen falls es länger als 5 sekunden angezeigt wird			
			if (scanC.currentItem != null && lastItem == scanC.currentItem && now-lastScan > 4000 && lastScan != null) {
		
				scanC.barcode = '';
				scanC.status = 'close';
				$timeout(function() {
			        scanC.status = '';
			        scanC.currentItem = null;
		        }, 300);
		  
			}
			lastItem = scanC.currentItem;
		}, 1000);
		
		$scope.$on('$destroy', function() {
			console.log('destroy- scan2');
			$interval.cancel(interval);
		});
		
		
		if (siteProperties.scanditEnable) {
			$timeout(function() {
				Scandit.show();
			}, 800); // after view-transition
			
			Scandit.onSuccess = function(data) {
				console.log('onSuccess', data);

				$rootScope.$apply(function(){
					scanC.scan(data[0]);
				});
			}
		}
		

		scanC.scan = function(barcode) {
			console.log(barcode);
	
			lastScan = new Date().getTime();
			
			if (barcode != scanC.barcode) {
				scanC.barcode = barcode;
				
				navigator.notification.vibrate(200);
				
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
					        laktose: true,
					        message: false
				        };
		            }
		        });	
		        
		        scanC.status = 'load';
		        
		        $.ajax("http://felixstricker.ch/zhdk/mui/codecheck.php?c="+barcode, {
					type: 'GET',
					contentType: "application/json",
					success: function(data, textStatus, jqXHR) {
						console.log('data', data);
						
						if (data.status == 'found') {
							if (newItem == null) {
								newItem = {
							        barcode: barcode,
							        name: data.name,
							        image: data.img_src,
							        reviewed: false,
							        review_state: '',
							        review_date: '',
							        laktose: data.laktose,
									message: false
						        };
							} else {
								newItem.name = data.name;
								newItem.image = data.img_src;
								newItem.message = false;
							}
						} else {
							console.log('no complete product found on codecheck');
						}
						
						if (newItem == null) {
							newItem = {
								name: 'SORRY!',
								message: "Zu diesem Produkt wurden nicht genügend Daten gefunden. Versuche es mit einem anderen Produkt."
							}
					        console.log('kein produkt gefunden!');
				        } 
					        
						lastScan = new Date().getTime();
				        scanC.status = '';
				        scanC.currentItem = newItem;
				        
						
					},
					fail: function(error) {
						console.log('ERROR', error);
					}
				});
		        
			}
		
		}
		
		scanC.moveProduct = function(event, item) {
			
			$('.product').removeClass('animate');
			
			if (item.laktose) {
				
				event.element.css({
					'transform': 'translateX('+event.deltaX+'px)'
				});
				
				if (event.isFinal) {
					
					if (event.deltaX < -60) {
						
						scanC.toLibrary(Event, item);
		
					} else {
						event.element.css({
							'transform': 'translateX(0px)'
						});
					}
				
				}
			}
			
		}
		
		scanC.toLibrary = function(event, item) {
			scanC.status = 'toLibrary';
			$('.product').addClass('animate');			
				
			$timeout(function() {
				
				var itemChange = false;
				var date = new Date();
				var currentPosition = 0;
				
				angular.forEach(scanC.product_list, function (value, key) {
					if (value.stack_position > currentPosition) {
						currentPosition = value.stack_position;
					}
					if (item.barcode == value.barcode) {
						itemChange = key;
						
						
						value.reviewed = false;
						value.review_date = '';
						value.review_state = '';
						value.review_state_filter = '';
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
						stack_position: currentPosition+1
					})
				} else {
					scanC.product_list[itemChange].stack_position = currentPosition+1;
				}
				
				scanC.barcode = '';
				scanC.currentItem = null;
				scanC.status = '';
				siteProperties.reviewCount = Review.count();
				
				
				$('.product').css({
					'transform': 'translateX(0px)'
				});
			
			}, 600);
		}
		
	})
	.controller('productController', function($scope, $timeout, siteProperties, product_list, Review) {
		var productC = this;
		
		siteProperties.title = 'Meine Produkte';
		siteProperties.viewName = 'products';
		siteProperties.reviewCount = Review.count();
		
		productC.product_list = product_list;
		productC.currentState = 'all';
		productC.itemEdit = null;
		productC.viewCount = siteProperties.reviewCount;
				
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
		
		productC.moveProduct = function(event, item) {
			event.element.removeClass('animate');
			
			if (event.deltaX < 0) {
				event.element.css({
					'transform': 'translateX('+event.deltaX+'px)'
				});
			} else {
				productC.itemEdit = null;
			}
			
			if (event.isFinal) {
				
				if (event.deltaX < 0) {
					event.element.addClass('animate');
				}
				
				if (event.deltaX < -100) {
					
					productC.itemEdit = item;
					
					$timeout(function() {
						event.element.css({
							'transform': 'translateX(0px)'
						});
						
						event.element.removeClass('animate');
					}, 300);

				} else {
					
					
					event.element.css({
						'transform': 'translateX(0px)'
					});
				}
			}
			
			
		}
		
		/*
productC.openEdit = function(item) {
			productC.itemEdit = item;
		}
		
*/
		productC.changeReview = function(item, state) {

			var reviewItem = null;
			
			angular.forEach(productC.product_list, function (value, key) {
		        if (item == value) {
			        reviewItem = value;
	            }
	        });
	        
	        if (reviewItem) {
		        reviewItem.review_changed = true;
	            reviewItem.review_state = state;
	            
	            $timeout(function() {
			        productC.itemEdit = null;
			        reviewItem.review_changed = false;
		        }, 500);
	        }
	        
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
	.controller('reviewController', function($timeout, siteProperties, product_list, Review) {
		var reviewC = this; // $scope
		reviewC.product_list = product_list;
		reviewC.status = '';
		reviewC.stackLimit = 5;
		
		Review.order();
		reviewC.countReview = Review.count();
		reviewC.firstItem = Review.firstItem();
		
		console.log(reviewC.firstItem);
		
		reviewC.stackProperties = {
			firstY: 28,
			posDiff: 12,
			scaleDiff: 0.05,
			count: 5
		};
		
		
		siteProperties.title = 'Produkte bewerten';
		siteProperties.viewName = 'products';
		siteProperties.reviewCount = reviewC.countReview;
		
		

		reviewC.moveProduct = function(event, item) {
			$('.stack').removeClass('animate');
/* 			'transform': 'scale('+(1-(item.stack_position*0.05))+') translateY('+(28-(item.stack_position*12))+'px)' */
// 			console.log('event', event.deltaX);
			
			var max = 30;
			for (var i = 0; i < reviewC.stackProperties.count; i++) {
				var deltaX = event.deltaX;
				var deltaY = event.deltaY;
				if (i > 0) {
					if (event.deltaX < -max) {
						deltaX = -max;
					} else if(event.deltaX > max) {
						deltaX = max;
					}
					if (event.deltaY < -max) {
						deltaY = -max;
					} else if(event.deltaY > max) {
						deltaY = max;
					}
				}
				
				$('.product.position_'+i).css({
					'transform': 'scale('+(1-(i*reviewC.stackProperties.scaleDiff))+') translateX('+deltaX/reviewC.stackProperties.count*(reviewC.stackProperties.count-i)+'px) translateY('+(reviewC.stackProperties.firstY-(i*reviewC.stackProperties.posDiff)+(deltaY/reviewC.stackProperties.count*(reviewC.stackProperties.count-i)))+'px)'
				});
			}
			
			if (event.isFinal) {
				
				$('.stack').addClass('animate');
				var max = 80;
				if (
					(event.deltaX < -max || event.deltaX  > max) ||
					((event.deltaY < -150 && reviewC.countReview > 1) || event.deltaY  > max)
				) {
					var status = '';
					if (event.deltaX < -max) {
						status = 'good';	        
					} else if (event.deltaX > max) {
						status = 'bad';	
					}
					if (event.deltaY < -150) {
						status = 'back';	        
					} else if (event.deltaY > max) {
						status = 'ok';	
					}
					
					
					
					
					for (var i = 1; i < reviewC.stackProperties.count; i++) {
						$('.product.position_'+i).css({
							'transform': 'scale('+(1-(i*reviewC.stackProperties.scaleDiff))+') translateX(0px) translateY('+(reviewC.stackProperties.firstY-(i*reviewC.stackProperties.posDiff))+'px)'
						});
					}
					
					reviewC.rate(item, status);


				} else {
					
					for (var i = 0; i < reviewC.stackProperties.count; i++) {
						$('.product.position_'+i).css({
							'transform': 'scale('+(1-(i*reviewC.stackProperties.scaleDiff))+') translateX(0px) translateY('+(reviewC.stackProperties.firstY-(i*reviewC.stackProperties.posDiff))+'px)'
						});
					}
			
				}
			}
			
		}
		
		reviewC.rate = function(item, status) {
			console.log('item', item);
			
			$('.stack').addClass('animate');
			reviewC.status = 'move_'+status;
					
			$timeout(function() {
		        
		        if (status == 'back') {
			        var changeItem = null;
		
					angular.forEach(reviewC.product_list, function (value, key) {
						if (item == value) {
							changeItem = value;
						}
					});
		
		
					var newPosition = Review.order(changeItem);

					changeItem.stack_position = newPosition;
					
		        } else {
			        angular.forEach(reviewC.product_list, function (value, key) {
				        if (item == value) {
					        var now = new Date();
					        
			            	value.reviewed = true;
			            	value.review_date = now.yyyymmdd();
			            	value.review_state = status;
			            	value.review_state_filter = false;
			            	value.stack_position = 10000;
			            }
			        });
			   
			        reviewC.countReview = Review.count();
			        siteProperties.reviewCount = reviewC.countReview;
			        
			        Review.order();
		        
		        }
		        
		        reviewC.firstItem = Review.firstItem();
		        reviewC.status = '';
		        
	        }, 700);
		}
	

// 		console.log(product_list);
		
	})
	.controller('helpController', function(siteProperties) {
		var helpC = this; // $scope
		
		siteProperties.title = 'Hilfe';
		siteProperties.viewName = 'help';
		helpC.siteProperties = siteProperties;
		
		helpC.changeMode = function() {
			console.log('changeMode', siteProperties.scanditEnable);
			if (siteProperties.scanditEnable) {
				siteProperties.scanditEnable = false;
				Scandit.stop();
			} else {
				siteProperties.scanditEnable = true;
				Scandit.start();
			}
		}
		
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
			stack_position: 0
		},
		{
			barcode: '4016249004026',
			name: 'Allos - Amaranth Wildbeeren-Müsli',
			image: 'http://www.codecheck.info/img/25308/1',
			reviewed: true,
			review_date: '2015-09-22',
			review_state: 'good',
			review_state_filter: 'good',
			stack_position: 1
		},
		{
			barcode: '9005182007008',
			name: 'ja! Natürlich Vanillemilch',
			image: 'http://www.codecheck.info/img/48987982/1',
			reviewed: true,
			review_date: '2015-08-01',
			review_state: 'bad',
			review_state_filter: 'bad',
			stack_position: 2
		},
		{
			barcode: '8722700644682',
			name: 'Knorr Soße zu Geflügel',
			image: 'http://www.codecheck.info/img/48824937/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 3
		},
		{
			barcode: '4003490039396',
			name: 'Happy Milchdrink 0,3% - Erdbeeren',
			image: 'http://www.lebensmittel.de/productpics//w_400/h_400/4003490039396_s_1.jpg',
			reviewed: true,
			review_date: '2015-05-23',
			review_state: 'ok',
			review_state_filter: 'ok',
			stack_position: 4
		},
		{
			barcode: '4000540003765',
			name: 'Kölln Müsli Knusper Karamell',
			image: 'http://www.codecheck.info/img/48979576/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 5
		},
		{
			barcode: '2000422455356',
			name: 'Jeden Tag Bananen-Trunk (1,18 EUR/1 l)',
			image: 'http://prdimg.affili.net/img/size/180/src/d2jdyzt6tc17s.cloudfront.net/products/images/4503080045_4250780306755_01.jpg.jpg',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 6
		},
		{
			barcode: '4008230489103',
			name: 'Saliter Milchmischgetränk Erdbeer',
			image: 'http://www.codecheck.info/img/48811867/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 7
		},
		{
			barcode: '9003740086793',
			name: 'Chef Menü - Sandwich mit Thunfisch und Ei',
			image: 'http://www.codecheck.info/img/648482/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 8
		},
		{
			barcode: '4104420112360',
			name: 'ALNATURA - Pizza Salami',
			image: 'http://www.codecheck.info/img/106848/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 9
		},
		{
			barcode: '7611654693222',
			name: 'Pizza Pomodori e Pesto',
			image: 'http://www.codecheck.info/img/48776318/1',
			reviewed: false,
			review_date: '',
			review_state: '',
			review_state_filter: '',
			stack_position: 10
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
			barcode: '8003938005224',
			name: 'test - Bonta Divina Delizia Vanille (1,54 EUR/100 g)',
	        image: 'http://www.codecheck.info/img/28370/1',
	        laktose: true
		},
		{
			barcode: '20430313',
			name: 'Biotrend - Bio Paprika-Lyoner Spitzenqualität',
	        image: 'http://www.codecheck.info/img/48536022/1',
	        laktose: false
		},
		{
			barcode: '7616800816203',
			name: 'Schweizer Alpenkräuter',
	        image: 'http://www.codecheck.info/img/48871059/1',
	        laktose: false
		}
	])
	.value('siteProperties', {
		title: '',
		viewName: '',
		reviewCount: 0,
		scanditEnable: scanditEnable
	})
	.factory('Review', function(product_list) {
        return {
            count: function() {
	            var count = 0;
	            angular.forEach(product_list, function (value, key) {
			        if (!value.reviewed) {
				        count++;
		            }
		        });
                return count;
            },
            order: function(changeItem) {
	            var tempArray = product_list.map(function(product, key) {
					if (!product.reviewed && product !== changeItem) {
				 		return {'key' : key, 'position': product.stack_position};
				 	}
			    }).filter(function(value){
				    return value !== undefined;
			    });
			    
// 			    console.log('tempArray1', tempArray);
			    
			    tempArray.sort(function(a, b){return a.position-b.position});
			    
// 			    console.log('tempArray2', tempArray);
			    
			    var newPositions = 0;
				tempArray.forEach(function(value) {
					var itemPosition = 100000;
					angular.forEach(product_list, function (product, key) {
						if (value.key === key) {
						    itemPosition = newPositions++;
						    product.stack_position = itemPosition;
					    }
					});
					
				});
				
				return newPositions;
            },
            firstItem: function() {
	            var item = null;
	            angular.forEach(product_list, function (value, key) {
		            if (value.stack_position == 0) {
			            item = value;
		            }
	            });
	            return item;
            }
        };
    });





	        
	        
			
if (scanditEnable) {
    document.addEventListener('deviceready', function() {
		angular.bootstrap(document, ['laktofriApp']);
	}, false);
} else {
	angular.bootstrap(document, ['laktofriApp']);
}
