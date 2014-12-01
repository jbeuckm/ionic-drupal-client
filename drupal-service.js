angular.module('drupal', ['ionic'])

.factory('DrupalService', function ($q, $ionicPopup, $rootScope) {

    var drupal = new Drupal();
    var user = null;

    function createAccount(user) {

        var def = $q.defer();

        drupal.createAccount(user,
            function (_user) {

                user = _user;

                def.resolve(user);

                $rootScope.$broadcast('drupal_register', user);
            },
            def.reject
        );

        return def.promise;
    }

    function login(username, password) {

        var def = $q.defer();

        drupal.login(username, password,
            function (_user) {

                user = _user;

                def.resolve(user);

                $rootScope.$broadcast('drupal_login', user);
            },
            def.reject
        );

        return def.promise;
    }

    function logout() {
        var def = $q.defer();
        drupal.logout(
            function (arg) {
                user = null;
                def.resolve(arg);
            },
            function (err) {
                def.reject(err);
            }
        );
        return def.promise;
    }

    function setRestPath(server, endpoint) {

        var def = $q.defer();

        drupal.setRestPath(server, endpoint);

        drupal.systemConnect(
            function (result) {
                console.log("drupal:systemconnect succeeded");
                user = result.user;
                if (user.uid != 0) {

                }
                def.resolve(user);
            },
            function (err) {
                console.log("ERROR connecting to drupal");
                console.log(err);
                def.reject(err);
            }
        );

        return def.promise;
    }


    function getView(viewId) {
        var def = $q.defer();
        console.log('will get view...' + viewId);
        drupal.getView(viewId, {},
            function (resp) {
                def.resolve(resp);
            },
            function (err) {
                def.reject(err);
                console.log(err);
            }
        );
        return def.promise;
    }
    
    function registerForm() {

        var def = $q.defer();

        $scope = $rootScope.$new();
        $scope.user = {
            username: '',
            email: '',
            password1: '',
            password2: ''
        };

            myPopup = $ionicPopup.show({
            templateUrl: 'js/drupal/templates/sign_up.html',
            title: 'Sign Up',
            subTitle: 'Enter your username and password.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        def.reject('cancelled');
                    }
              },
                {
                    text: '<b>Sign Up</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        createAccount({
                            name: $scope.user.username, 
                            mail: $scope.user.email, 
                            pass: $scope.user.password1,
                            status: 1 // try to enable account at creation if allowed
                        }).then(def.resolve, def.reject);
                    }
              },
            ]
        });

        return def.promise;
    }

    function loginForm() {

        var def = $q.defer();

        $scope = $rootScope.$new();
        $scope.login = {
            username: '',
            password: ''
        };

        var myPopup;

        $scope.createNewAccount = function () {
            myPopup.close();
            registerForm();
        };

        myPopup = $ionicPopup.show({
            templateUrl: 'js/drupal/templates/login.html',
            title: 'Login',
            subTitle: 'Enter your username and password.',
            scope: $scope,
            buttons: [
                {
                    text: 'Cancel',
                    onTap: function (e) {
                        def.reject('cancelled');
                    }
              },
                {
                    text: '<b>Login</b>',
                    type: 'button-positive',
                    onTap: function (e) {
                        login($scope.login.username, $scope.login.password).then(def.resolve, def.reject);
                    }
              },
            ]
        });

        return def.promise;
    }

    return {

        setRestPath: setRestPath,
        createAccount: createAccount,
        login: login,

        loginForm: loginForm,

        getUser: function () {
            return user;
        },
        getUid: function () {
            return user.uid;
        },

        isLoggedIn: function () {
            if (!user) return false;
            if (user.uid != 0) {
                return true;
            } else {
                return false;
            }
        },

        getView: getView,
        logout: logout,

        getDrupal: function () {
            return drupal;
        }

    };

});