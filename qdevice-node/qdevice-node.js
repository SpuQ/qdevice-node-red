/*
 *  Qdevice node for Node-RED
 *
 *  Talk to your Qcom-based Hardware modules from your Node-RED
 *  application.
 *  note:   This node requires the Qdevice package to be installed,
 *          this might cause some difficulties as the Qcom driver
 *          must be installed as root.
 * 
 *  by Sanne 'SpuQ' Santens, 2024
 */

module.exports = function(RED) {
	console.log("registering Qdevice");
	let Qdevice = require('qdevice');

	function Qdevice_node(config){
        RED.nodes.createNode(this,config);
		let node = this;

        // At first, set the indicator to
        // disconnected.
		status_indicator("disconnected");

        // Create a new Qdevice with the name
        // passed in the Node-RED configuration.
		let device = new Qdevice(config.module);

        // When the hardware module is connected
        // to the host, let everyone know.
        device.on('connected', () =>{
            console.log("Qdevice '"+config.module+"' connected.");
            status_indicator('connected');
            const msg = {
                topic: 'status',
                payload: 'connected'
            }
            node.send( msg );
        });

        // When the hardware module is disconnected
        // from the host, let everyone know.
        device.on('disconnected', () =>{
            console.log("Qdevice '"+config.module+"' disconnected.");
            status_indicator('disconnected');
            const msg = {
                topic: 'status',
                payload: 'disconnected'
            }
            node.send( msg );
        });

        // When data is received from the device,
        // pass it to the node output in msg format.
        device.on('data',(data)=>{
            const msg = {
                topic: data.signal,
                payload: data.argument
            }
            node.send( msg );
        });

        // When data is received from the node
        // input, send it to the device.
		this.on('input', function( msg ) {
			const signal = {
                signal: msg.topic,
                argument: msg.argument
            };
			device.send( signal );
		});

        // When Node-RED is closed, clean up
        // the device.
		this.on('close', (done) => {
			device.disconnect(()=>{
                console.log("Qdevice '"+config.module+"' closed.");
				done();
			});
		});

		// Status indicator beneath the node
		function status_indicator(status){
            switch(status){
                case 'connected':
                    node.status({fill:"green",shape:"dot",text:status});
                    break;
                case 'disconnected':
                    node.status({fill:"red",shape:"dot",text:status});
                    break;
                case 'error':
                    node.status({fill:"red",shape:"ring",text:status});
                    break;
                default:
                    node.status({fill:"blue",shape:"ring",text:status});
                    break;
            }
            return;
		}
	}

	RED.nodes.registerType("Qdevice", Qdevice_node);
	console.log("Qdevice registered");
}
