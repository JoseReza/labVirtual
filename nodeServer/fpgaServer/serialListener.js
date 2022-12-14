const { SerialPort } = require("serialport");

let readings = {};

async function start() {
  let portList = await SerialPort.list();
  try {
    let path = portList[0].path;
    const port = new SerialPort({ path: path, baudRate: 115200 });

    let data = "";
    let currentMessage = "";
    let lastMessage = "";
    let message = "";
    port.on("data", function (_data) {
      for (let char of _data.toString()) {
        if (char == "{") {
          data = "";
        }
        data += char;
        if (char == "}") {
          currentMessage = data;
        }
      }
      if (currentMessage != lastMessage) {
        lastMessage = currentMessage;
        message = currentMessage;
        let myJson = undefined;
        try {
          myJson = JSON.parse(message);
        } catch (error) {
          console.error(error);
        }
        for (let pin in myJson) {
          myJson[pin] = Number(myJson[pin]);
        }
        readings = myJson;
      }
    });

    // Open errors will be emitted as an error event
    port.on("error", function (err) {
      console.log("Error: ", err.data);
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = { start, readings };
