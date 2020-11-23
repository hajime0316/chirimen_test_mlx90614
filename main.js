main();

async function main() {
  try {
    var i2cAccess = await navigator.requestI2CAccess();
    var port = i2cAccess.ports.get(1);
    var mlx = new MLX90614(port);
    await mlx.init();

    const gpioAccess = await navigator.requestGPIOAccess();
    const ledPort = gpioAccess.ports.get(26); // LED の GPIO ポート番号
    await ledPort.export("out");

    var blink_period_ms = 1000;
    blink_led();

    while (1) {
      var otemp = await mlx.get_obj_temp();
      var atemp = await mlx.get_amb_temp();
      document.getElementById("obj_temperature").innerHTML =
        otemp.toFixed(2) + "degree";
      document.getElementById("amb_temperature").innerHTML =
        atemp.toFixed(2) + "degree";

      // 点滅周期を変更する
      blink_period_ms = (otemp - atemp) * 100;
      await sleep(200);
    }

    async function blink_led() {
      while (1) {
        if (blink_period_ms > 0) {
          // LEDを点灯
          await ledPort.write(1);
          // 点滅周期の半分の時間止める
          await sleep(blink_period_ms / 2);
          // LEDを消灯
          await ledPort.write(0);
          // 点滅周期の半分の時間止める
          await sleep(blink_period_ms / 2);
        } else {
          await sleep(10);
        }
      }
    }
  } catch (error) {
    console.error("error", error);
  }
}
