zr.controller('NewProjectModalController', ['$scope', '$modalInstance', '$location', 'folder', 'gameResources', 'realtime', 'saveAsData', function($scope, $modalInstance, $location, folder, gameResources, realtime, saveAsData) {
	$scope.games = gameResources.data.rows;
	if(saveAsData) {
		$scope.data = {
			name: saveAsData.name,
			editorMode: (saveAsData.graphical ? 'graphical' : 'text'),
			game: $scope.games[2]
		};
		for(var i = $scope.games.length; i--; ) {
			if($scope.games[i].id === saveAsData.gameId) {
				$scope.data.game = $scope.games[i];
				break;
			}
		}
		$scope.modalTitle = 'Save As';
	}
	else {
		$scope.data = {
			name: '',
			editorMode: 'text',
			game: $scope.games[2]
		};
		$scope.modalTitle = 'New Project';
	}
	
	$scope.createProject = function() {
		realtime.createDocument($scope.data.name + ' - ' + $scope.data.game.displayName, folder).then(function (file) {
			realtime.ideGraphical = $scope.data.editorMode === 'graphical';
			realtime.gameId = $scope.data.game.id;
			$location.url('/ide/' + file.id + '/');
		});
		$modalInstance.close();
	};
	
	$scope.cancel = function() {
		$modalInstance.dismiss('cancel');
		if(folder) { //Redirected from Drive
			$location.path('/');
		}
	};
}]);
