var Scandit = {
	posTop: 0,
	height: 195,
	
	onSuccess: function() {},
/*
	
	success: function() {
		alert("Scanned " + resultArray[0] + " code: " + resultArray[1]);
	},
	
*/
	failure: function() {
		alert("Failed: " + error);
	},
	
	start: function() {
		console.log('start');
		
		cordova.exec(function(resultArray) {
			console.log(resultArray);	
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
					"portraitMargins" : "1000/"+this.posTop+"/-1000/"+(667-(this.posTop+this.height))
				}
			]
		);
		
		cordova.exec(null, null, "ScanditSDK", "pause", []);
	},
	
	stop: function() {
		console.log('stop');
		
		cordova.exec(null, null, "ScanditSDK", "stop", []);
	},
	
	cancel: function() {
		console.log('cancel');
		
		cordova.exec(null, null, "ScanditSDK", "cancel", []);
	},
	
	pause: function() {
		console.log('pause');
		
		cordova.exec(null, null, "ScanditSDK", "pause", []);
	},
	
	resume: function() {
		console.log('resume');
		
		cordova.exec(null, null, "ScanditSDK", "resume", []);
	},
	
	hide: function() {
		console.log('hide');
		
		cordova.exec(null, null, "ScanditSDK", "pause", []);
		cordova.exec(null, null, "ScanditSDK", "resize", [
			{
				"portraitMargins" : "1000/"+this.posTop+"/-1000/"+(667-(this.posTop+this.height)),
				"animationDuration": 0,
				"viewfinderSize" : "0.8/0.4/0.6/0.4"
			}
		]);
	},
	
	show: function() {
		console.log('show');
		cordova.exec(null, null, "ScanditSDK", "resume", []);
		cordova.exec(null, null, "ScanditSDK", "resize", [
			{
				"portraitMargins" : "0/"+this.posTop+"/0/"+(667-(this.posTop+this.height)),
				"animationDuration": 0,
				"viewfinderSize" : "0.8/0.4/0.6/0.4"
			}
		]);
	}
};

