var app = new Vue({
  el: '#app',
  data: {
    messages: [],
    new_message: ""
  }, 
  methods: {
  	submit: function(){
  		var vm = this;
  		socket.emit('new_message', {message: vm.new_message});
  	}
  }
})


var socket = io.connect('https://fierce-garden-60722.herokuapp.com/');
// var socket = io.connect('http://localhost:5000');
socket.on('new_message', function (data) {
	console.log(data);
	app.messages.push(data.message);
});

socket.on('new_postback', function (data) {
	console.log(data);
	
});

socket.on('news', function (data) {
    console.log(data);
  });