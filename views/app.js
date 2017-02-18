var app = new Vue({
  el: '#app',
  data: {
    messages: [],
    new_message: "",
    senderId: ""
  }, 
  methods: {
  	submit: function(){
  		var vm = this;
  		console.log(vm.new_message);
  		socket.emit('new_message_from_consultant', {message: vm.new_message, senderId: vm.senderId});
  		vm.new_message = "";
  	}
  }
})


var socket = io.connect('https://fierce-garden-60722.herokuapp.com/');
// var socket = io.connect('http://localhost:5000');
socket.on('new_message_from_bot', function (data) {
	console.log(data);
	app.messages.push(data.message);
	app.senderId = data.event.sender.id;
});

socket.on('new_postback', function (data) {
	console.log(data);
	
});

socket.on('news', function (data) {
    console.log(data);
  });