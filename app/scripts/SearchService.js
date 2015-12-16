
angular.module('hhStat')
	.service('search', ['$http', '$rootScope', function($http, $rootScope) {
	
	var result = {
		search: search,
		subscribe: subscribe
	};
	
	return result;
	
	/**
	 * Subscribe to event
	 * @param  {string}   name     Event name
	 * @param  {object}   scope    Angular scope object
	 * @param  {Function} callback Function to call
	 */
	function subscribe (name, scope, callback) {
        var handler = $rootScope.$on(name, callback);
        scope.$on('$destroy', handler);
    }

    /**
     * Fire an event
     * @param  {string} name Event name
     * @param  {object} args Event args
     */
    function notify(name, args) {
        $rootScope.$emit(name, args);
    }    

    /**
     * Main exposed search function
     * @param  {string} phrase Phrase to search
     */
	function search (phrase) {
		var tokenArray = tokenise (phrase, /[,;]/);
		var tokenAliases = tokenArray.map(findAliases);

		var requests = [];
		tokenAliases.forEach(function (token) {
			var requestArray = [0,1,2,3].map(function (x) {
				return {
					page: x,
					token: token.token,
					aliases: token.aliases
				};
			});

			 requests = requests.concat(requestArray);
		});

		notify('SEARCH_START', requests);
		requests.forEach(perfomRequest);
	}

	/**
	 * Split search phrase into array of tokens
	 * @param  {string} phrase Search phrase
	 * @sep    {RegExp} sep    Separator regular expression 
	 * @return {string[]}      Array of tokens
	 */
	function tokenise (phrase, sep) {
		var rawArray = phrase.split(sep);
		return rawArray
		.map(function (x) {
			return x.trim();
		})
		// remove empty items
		.filter(function (x) {
			return x;
		})
		// distinct
		.reduce(function(a,b) {
			if (a.indexOf(b) < 0 ) a.push(b);
			return a;
		},[]);
	}

	/**
	 * Produce array of aliases for token
	 * @param  {string} token Search token
	 * @return {string[]}     Array of aliases
	 */
	function findAliases (token) {
		return { token: token, aliases: [token]};
	}

	/**
	 * Query external api with concrete search token 
	 * @param  {string} aliases Search aliases
	 */
	function perfomRequest (request) {
		console.log("Search for " + request.token);
		var textSubquery = encodeURIComponent(request.aliases.join(' OR '));
		$http.get('https://api.hh.ru/vacancies?per_page=500&page='+request.page+'&text=' + textSubquery, {})
			.then(function (response) {
				onSearchSuccess(request, response);
			}, function (response) {
				onSearchFailed(request, response);
			});
	}

	function onSearchSuccess (request, response) {
		notify('SEARCH_SUCCESS', { request: request, response: response.data} );
	}

	function onSearchFailed (request, response) {
		notify('SEARCH_FAILED', { request: request, response: response})
	}	

	/**
	 * Aggregate vacancies info and calculate stats
	 * @param  {json} response Raw response from service
	 * @return {[type]}          [description]
	 */
	function calculateStats (response) {
		// body...
	}

}]);




