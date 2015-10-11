var Scandit = {
	disabled: false,
	posTop: 0,
	height: 260,
	initialized: false,
	
	onSuccess: function() {},

	failure: function() {
		alert("Failed: " + error);
	},
	
	init: function() {
		if (!this.disabled) {
			console.log('scandit init');
			
			cordova.exec(function(resultArray) {
				Scandit.onSuccess(resultArray);
			}, function(error) {
				Scandit.failure(error);
			}, "ScanditSDK", "scan", [
				"SdNY66tq78Jcyef5rx8Ff7AvxC4xa+W5/0ipsqx4O2I",
					{
						"beep": true,
						"code128" : false,
						"dataMatrix" : false,
						"codeDuplicateFilter" : 1000,
						"continuousMode" : true,
						"torch" : false,
						"searchBar" : false,
						"vibrate" : false,
						"portraitMargins" : "1000/"+this.posTop+"/-1000/"+(667-(this.posTop+this.height))
					}
				]
			);
			
			cordova.exec(null, null, "ScanditSDK", "pause", []);
			
			this.initialized = true;
		}
	},
	
	start: function() {
		console.log('scandit start', this.initialized);
		if (!this.initialized) {
			this.init();
		}
		cordova.exec(null, null, "ScanditSDK", "start", []);
	},
	
	stop: function() {
		console.log('stop');
		if (!this.initialized) {
			this.init();
		}
		cordova.exec(null, null, "ScanditSDK", "stop", []);
	},
	
	cancel: function() {
		console.log('cancel');
		if (!this.initialized) {
			this.init();
		}
		cordova.exec(null, null, "ScanditSDK", "cancel", []);
	},
	
	pause: function() {
		console.log('pause');
		if (!this.initialized) {
			this.init();
		}
		cordova.exec(null, null, "ScanditSDK", "pause", []);
	},
	
	resume: function() {
		console.log('resume');
		if (!this.initialized) {
			this.init();
		}
		cordova.exec(null, null, "ScanditSDK", "resume", []);
	},
	
	vibrate: function(vibrate) {
		if (!this.disabled) {
			console.log('vibrate');
			cordova.exec(null, null, "ScanditSDK", "resize", [
				{
					"portraitMargins" : "0/"+this.posTop+"/0/"+(667-(this.posTop+this.height)),
					"animationDuration": 0,
					"viewfinderSize" : "0.85/0.7/0.85/0.8",
					"vibrate": vibrate
				}
			]);
		}
	},
	
	hide: function() {
		if (!this.initialized) {
			this.init();
		}
		if (!this.disabled) {
			console.log('hide');
			
			cordova.exec(null, null, "ScanditSDK", "pause", []);
			cordova.exec(null, null, "ScanditSDK", "resize", [
				{
					"portraitMargins" : "1000/"+this.posTop+"/-1000/"+(667-(this.posTop+this.height)),
					"animationDuration": 0,
					"viewfinderSize" : "0.85/0.7/0.85/0.8"
				}
			]);
		}
	},
	
	show: function() {
		if (!this.initialized) {
			this.init();
		}
		if (!this.disabled) {
			console.log('show');
			cordova.exec(null, null, "ScanditSDK", "resume", []);
			cordova.exec(null, null, "ScanditSDK", "resize", [
				{
					"portraitMargins" : "0/"+this.posTop+"/0/"+(667-(this.posTop+this.height)),
					"animationDuration": 0,
					"viewfinderSize" : "0.85/0.7/0.85/0.8"
				}
			]);
		}
	}
};

