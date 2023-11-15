// GROUP MB3-B
// moving wall W2, 3, switch S2, color C3, display D2

// INIT
let PIN_SCL = DigitalPin.P19;
let PIN_SDA = DigitalPin.P20;
let PIN_SERVO = AnalogPin.P0;
let PIN_BUTTON = DigitalPin.P1;

radio.setGroup(8);
led.enable(false);
let displaySegment = TM1637.create(PIN_SCL, PIN_SDA, 10, 4);
pins.setPull(PIN_BUTTON, PinPullMode.PullUp);

// DEBOUNCING
let buttonState = 0;
let lastDebounceTime = 0;
let lastButtonState = 0;
let currentTime = 0;
let timeFromPress = 0;
let timeElapsed = 0;
let isMeasured = false;
let TIME_DEBOUNCE = 0;
let PIN_PRESSED = 0;
let PIN_RELEASED = 1;

// VARIABLES
let value = 0;
let servo = 0;

let TIME_TO_OPEN = 5000;
let SERVO_OPEN = 85;
let SERVO_CLOSE = 10;

let RADIO_RESET = 1;
let RADIO_CLOSE = 2;

// INTERRUPT
radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber === RADIO_RESET) {
        resetState();
    } else if (receivedNumber === RADIO_CLOSE) {
        resetState();
    }
})

// MAIN
basic.forever(function () {
    debounceButton();
    if (isMeasured) {
        if (input.runningTime() - timeFromPress > TIME_TO_OPEN) {
            servo = SERVO_OPEN;
            isMeasured = false;
        } else {
            servo = SERVO_CLOSE;
        }
    }
    pins.servoWritePin(PIN_SERVO, servo);
})

basic.forever(function () {
    if (isMeasured) {
        timeElapsed = Math.floor((input.runningTime() - timeFromPress) / 1000);
    }
    displaySegment.showNumber(timeElapsed);
})

// FUNCTIONS
function debounceButton () {
    currentTime = input.runningTime();
    let buttonRead = pins.digitalReadPin(PIN_BUTTON);
    if (buttonRead != lastButtonState) {
        lastDebounceTime = currentTime;
    }
    if (input.runningTime() - lastDebounceTime > TIME_DEBOUNCE) {
        if (buttonRead != buttonState) {
            buttonState = buttonRead;
            if (buttonState == PIN_PRESSED) {
                isMeasured = true;
            } else {
                isMeasured = false;
            }
            timeFromPress = input.runningTime();
        }
    }
    lastButtonState = buttonRead;
}

function resetState() {
    servo = SERVO_CLOSE;
    timeElapsed = 0;
}