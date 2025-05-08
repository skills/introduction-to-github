#include <Servo.h>


// Definición de pines para los servomotores
#define PIN_LEFT_LEG  8
#define PIN_RIGHT_LEG 7
#define PIN_LEFT_FOOT 6
#define PIN_RIGHT_FOOT 5

// Velocidades para los motores (90 = detenido)
#define SPEED_STOP 90
#define SPEED_SLOW 80  // o 100 dependiendo de la dirección
#define SPEED_FAST 70  // o 110 dependiendo de la dirección

// Crear objetos Servo para cada motor
Servo leftLeg;
Servo rightLeg;
Servo leftFoot;
Servo rightFoot;

void setup() {
  // Adjuntar servos a los pines correspondientes
  leftLeg.attach(PIN_LEFT_LEG);
  rightLeg.attach(PIN_RIGHT_LEG);
  leftFoot.attach(PIN_LEFT_FOOT);
  rightFoot.attach(PIN_RIGHT_FOOT);
 
  // Iniciar todos los motores detenidos
  //stopAll();
 
  // Pequeña pausa para inicialización
  delay(1000);
}

void loop() {
  // Ejemplo de secuencia de movimientos
 /* walkForward(2000);  // Caminar hacia adelante por 2 segundos
  turnRight(1000);    // Girar a la derecha por 1 segundo
  walkBackward(2000); // Caminar hacia atrás por 2 segundos
  turnLeft(1000);     // Girar a la izquierda por 1 segundo
  stopAll();
  delay(2000);        // Esperar 2 segundos

  */
   stopAll();
   delay(5000);
}

// Función para detener todos los motores
void stopAll() {
  //leftLeg.write(90);
 //rightLeg.write(45);
 // leftFoot.write(90);
  // rightFoot.write(90);
}

// Función para caminar hacia adelante
void walkForward(int tiempo) {
  // Piernas: una adelante, otra atrás
  leftLeg.write(5);
  rightLeg.write(6);
  // Pies: compensar movimiento
  leftFoot.write(7);
  rightFoot.write(8);
 
  delay(tiempo);
  stopAll();
}

// Función para caminar hacia atrás
void walkBackward(int tiempo) {
  // Invertir direcciones de walkForward
  leftLeg.write(5);
  rightLeg.write(6);
  leftFoot.write(7);
  rightFoot.write(8);
 
  delay(tiempo);
  stopAll();
}

// Función para girar a la derecha
void turnRight(int duration) {
  // Todos los motores en la misma dirección
  leftLeg.write(5);
  rightLeg.write(6);
  leftFoot.write(7);
  rightFoot.write(8);
 
  delay(duration);
  stopAll();
}

// Función para girar a la izquierda
void turnLeft(int duration) {
  // Todos los motores en dirección opuesta
  leftLeg.write(5);
  rightLeg.write(6);
  leftFoot.write(7);
  rightFoot.write(8);
 
  delay(duration);
  stopAll();
}
