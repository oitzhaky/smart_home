/// This code demonstrates how to subscribe to the MQTT topic and execute
// commands sent via MQTT messages.

// Load Mongoose OS API
load('api_mqtt.js');
load('api_gpio.js');
load('api_sys.js');

let led = ffi('int get_led_gpio_pin()')();  // Get built-in LED GPIO pin
GPIO.set_mode(led, GPIO.MODE_OUTPUT);
GPIO.write(led, 1);//turn LED OFF when initialized


let pin = 0;   // GPIO 0 is the 'Flash' button
GPIO.set_button_handler(pin, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 200, function(x) {
  let topic = 'proj/led/status';
  let message = JSON.stringify({
    led_status: GPIO.read(led) === 1 ? 'OFF': 'ON'
  });
  let ok = MQTT.pub(topic, message, 1);
  print('Published:', ok ? 'yes' : 'no', 'topic:', topic, 'message:', message);
}, true);


let topic = 'proj/led/request';
MQTT.sub(topic, function(conn, topic, msg) {
  //let message = JSON.parse(msg);
  print('Topic: ', topic, 'message:',JSON.parse(msg).led_status);
  if(JSON.parse(msg).led_status === 'ON'){
    GPIO.write(led, 0);
  }else{ //led_status === 'OFF'
    GPIO.write(led, 1);
  }
}, null);

print('Subscribed to ', topic);
