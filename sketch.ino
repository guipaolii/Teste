#include <DHT.h>

// Pinos
#define TRIG_PIN   26
#define ECHO_PIN   25
#define DHT_PIN    15
#define BUZZER_PIN 23
#define LED1_PIN   21
#define LED2_PIN   19
#define LED3_PIN   18

#define DHT_TYPE   DHT22
#define DISTANCIA_LIMITE 30  // cm

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED1_PIN, OUTPUT);
  pinMode(LED2_PIN, OUTPUT);
  pinMode(LED3_PIN, OUTPUT);

  // Cabeçalho CSV
  Serial.println("temp,umidade,distancia,estado");
}

float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracao = pulseIn(ECHO_PIN, HIGH);
  float distancia = duracao * 0.034 / 2.0;
  return distancia;
}

void acionarAtuadores(bool risco) {
  digitalWrite(BUZZER_PIN, risco ? HIGH : LOW);
  digitalWrite(LED1_PIN,   risco ? HIGH : LOW);
  digitalWrite(LED2_PIN,   risco ? HIGH : LOW);
  digitalWrite(LED3_PIN,   risco ? HIGH : LOW);
}

void loop() {
  float temperatura = dht.readTemperature();
  float umidade     = dht.readHumidity();
  float distancia   = medirDistancia();

  if (isnan(temperatura) || isnan(umidade)) {
    Serial.println("Erro na leitura do DHT22");
    delay(2000);
    return;
  }

  bool risco = (distancia < DISTANCIA_LIMITE);
  String estado = risco ? "RISCO" : "SEGURO";

  acionarAtuadores(risco);

  Serial.print(temperatura, 1);
  Serial.print(",");
  Serial.print(umidade, 1);
  Serial.print(",");
  Serial.print((int)distancia);
  Serial.print(",");
  Serial.println(estado);

  delay(1000);
}
