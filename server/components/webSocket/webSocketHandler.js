'use strict';

var config = require('../../config/environment');
var WebSocketServer = require('ws').Server;
var Twitter = require('twitter-node-client').Twitter;

var clients=2;

function zfill(num, len) {
    var t = new Array(len);
    return (t.join("0") + num).slice(-len);
}

module.exports = function(server){
  var wss = new WebSocketServer({ server: server });
  var twitter = new Twitter(config);

  var connect = function(callback){
    wss.on('connection', function connection(ws) {
      callback(ws);
    });
  };

  var init = function(tweets){
    connect(function(ws){

      ws.on('message', function incoming(message) {
        console.log('server:', message);
        /*TODO:
         * - Discriminar el mensaje, que cosa nos llego? y que tenemos
         *   que hacer con esto?
         **/
        switch(message) {
            case 'case':
                // code
               console.log('mensaje recibido websocket abierto: %s', message);
               for(var i in clients){
                  // Send a message to the client with the message
                clients[i].sendUTF(JSON.stringify(server.config));
               }
                break;
            case 'get_tweets':
                ws.send(JSON.stringify(getTweets()));
                break;

            default:
                // code
                break;
        }
        /*send tweets*/
        //ws.send(JSON.stringify(tweets));
      });
       setTimeout(function timeout() {
          ws.send(Date.now().toString(), {mask: true});
        }, 500);
      /*
       * TODO: Instalar un interval para poder iterar x tiempo para
       * buscar los tweets
       * */
      //setInterval(collectTweetsFromTwitter, config.tiempo)
      //OJO que hay que poder cancelar este intervalo para que no se
      //quede pegado todo el tiempo.
    });
  };

  var collectTweetsFromTwitter = function(query, callback){

  };

  // Guardar los tweets en el disco en algun lado que nos diga config.store
  var saveTweetsToDisk = function(tweets, callback){
    var texto = [];
    texto.push('Tweets:\n');
    texto.push(tweets);

  };


  var sendTweets = function(ws, tweets){
  /* basicamente usar ws.send stringifiado */
  ws.send(JSON.stringify(tweets));
  };

  /*PV TODO: get the stored tweets */
  var getTweets = function(discriminator){
    var result = [];

    if (!discriminator){
      // return tweets from today
      //1. get todays date
      var today = new Date();
      var query = config.query || '@patovala';
      query += ' since: ' +
          today.getFullYear() + '-' +
          zfill(today.getMonth() + 1, 2) + '-' +
          zfill(today.getDate(), 2);

      twitter.getSearch({'q': query , 'count': 10, 'result\_type':'popular'},
        function error(err, response, body) {
          console.log('ERROR [%s]', err);
        },
        function success(data){
            result = data;
        }
      );
    }
    return result;
  };

  return {
    init: init,
    getConfig: function(){
      return config;
    }
  }

};
