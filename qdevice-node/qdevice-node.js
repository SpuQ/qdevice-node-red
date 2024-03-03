module.exports = function(RED) {
	console.log("registering Qdevice");
	const Qdevice = require('qdevice');

	function Qdevice_node(config, handler){
        RED.nodes.createNode(this,config);
		var node = this;

		status_indicator("disconnected");

		var device = new Qdevice(config.module, (signal) => {
			var msg = {}
			msg.topic = signal.signal;
			msg.payload = signal.argument;
			node.send( msg );

			if (signal.signal == "device") {
				status_indicator(signal.argument);
			}
		});

		this.on('input', function( msg ) {
			var signal = {};
			signal.signal = msg.topic;
			signal.argument = msg.payload;

			device.send( signal );
		});

		this.on('close', function(done) {
			device.disconnect( function(){
				done();
			});
		});

		// Status indicator beneath the node
		function status_indicator(status){
			if (status == "connected"){
				node.status({fill:"green",shape:"dot",text:"connected"});
			}
			else if(status == "disconnected"){
				node.status({fill:"red",shape:"dot",text:"disconnected"});
			}
			else if(status == "error"){
				node.status({fill:"red",shape:"ring",text:"error"});
			}
		}
	}

	RED.nodes.registerType("Qdevice", Qdevice_node);
	console.log("Qdevice registered");
}
