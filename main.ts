// GROUP MB-B
// moving wall W2, switch S2, display D2
// radio from RESET
// radio from MB-C

// INIT
let PIN_SCL = DigitalPin.P19;
let PIN_SDA = DigitalPin.P20;
let PIN_SERVO = AnalogPin.P0;
let PIN_BUTTON = DigitalPin.P1;
let PIN_SWITCH_OPEN = DigitalPin.P8;
let PIN_SWITCH_CLOSE = DigitalPin.P9;

radio.setGroup(8);
led.enable(false);
let displaySegment = TM1637.create(PIN_SCL, PIN_SDA, 10, 4);
pins.setPull(PIN_BUTTON, PinPullMode.PullUp);
pins.setPull(PIN_SWITCH_CLOSE, PinPullMode.PullUp);
pins.setPull(PIN_SWITCH_OPEN, PinPullMode.PullUp);

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

// CONSTANTS
let TIME_TO_OPEN = 5000;
let SERVO_STOP = 90
let SERVO_SPEED = 70;
let SERVO_OPEN = SERVO_STOP + SERVO_SPEED;
let SERVO_CLOSE = SERVO_STOP - SERVO_SPEED;
let RADIO_RESET = 1;
let RADIO_CLOSE = 2;

// VARIABLES
let servoSpeed = SERVO_STOP;
let requestFromColor = 0;
let requestFromTimer = 0;

// INTERRUPT
radio.onReceivedNumber(function (receivedNumber) {
    if (receivedNumber === RADIO_RESET) {
        resetState();
    } else if (receivedNumber === RADIO_CLOSE) {
        resetState();
    }
})

radio.onReceivedValue(function(name: string, value: number) {
    if (name === "C3"){
        requestFromColor = value;
    }
    if (name === "TIMER"){
        resetState();
    }
})

// MAIN
gateOpen();
basic.forever(function () {
    debounceButton();
    if (isMeasured) {
        if (input.runningTime() - timeFromPress > TIME_TO_OPEN) {
            requestFromTimer = 1;
            isMeasured = false;
        } else {
            requestFromTimer = 0;
        }
    } else {
        
    }
    pins.servoWritePin(PIN_SERVO, servoSpeed);
})

basic.forever(function() {
    if (requestFromColor){
        if (requestFromTimer){
            gateClose();
        } else {
            gateOpen();
        }
    } else {
        gateClose();
    }
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
                timeFromPress = input.runningTime();
            } else {

                isMeasured = false;
            }
        }
    }
    lastButtonState = buttonRead;
}

function resetState() {
    timeElapsed = 0;
    requestFromColor = 0;
    requestFromTimer = 0;
}

function gateClose() {
    if (pins.digitalReadPin(PIN_SWITCH_OPEN)) {
        servoSpeed = SERVO_CLOSE;
    } else {
        servoSpeed = SERVO_STOP;
    }
}

function gateOpen() {
    if (pins.digitalReadPin(PIN_SWITCH_CLOSE)) {
        servoSpeed = SERVO_OPEN;
    } else {
        servoSpeed = SERVO_STOP;
    }
}