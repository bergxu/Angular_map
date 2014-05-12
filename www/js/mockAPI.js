'use strict';
window.getData = function(error, success){
	$.getJSON('data/accountData.json', function(data) {
		success(data);
	});
};