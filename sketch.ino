#include <DHT.h>

// Pinos
#define TRIG_PIN    25
#define ECHO_PIN    26
#define DHT_PIN     23
#define BUZZER_PIN  19
#define PIN_LED1    18
#define PIN_LED2    5
#define PIN_LED3    17

// Configurações do sensor DHT
#define DHT_TYPE        DHT22
#define RISC_LIMITE_CM  42

DHT dht22(DHT_PIN, DHT_TYPE);

// ─── Funções auxiliares ───────────────────────────────────────────────────────

float medirDistancia() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duracao = pulseIn(ECHO_PIN, HIGH);
  return duracao * 0.034 / 2.0;
}

void acionarAtuadores(bool risco) {
  int estado = risco ? HIGH : LOW;
  digitalWrite(BUZZER_PIN, estado);
  digitalWrite(PIN_LED1,   estado);
  digitalWrite(PIN_LED2,   estado);
  digitalWrite(PIN_LED3,   estado);
}

void imprimirCSV(float temp, float umid, float distancia, const char* estado) {
  Serial.print(temp, 1);
  Serial.print(",");
  Serial.print(umid, 1);
  Serial.print(",");
  Serial.print(distancia, 1);
  Serial.print(",");
  Serial.println(estado);
}

// ─── Setup ───────────────────────────────────────────────────────────────────

void setup() {
  Serial.begin(115200);
  dht22.begin();

  pinMode(TRIG_PIN,   OUTPUT);
  pinMode(ECHO_PIN,   INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(PIN_LED1,   OUTPUT);
  pinMode(PIN_LED2,   OUTPUT);
  pinMode(PIN_LED3,   OUTPUT);

  Serial.println("temp,umid,distancia,estado");
}

// ─── Loop ────────────────────────────────────────────────────────────────────

void loop() {
  float temp = dht22.readTemperature();
  float umid = dht22.readHumidity();

  if (isnan(temp) || isnan(umid)) {
    Serial.println("Erro: falha na leitura do DHT22");
    delay(2000);
    return;
  }

  float distancia = medirDistancia();
  bool  risco     = distancia < RISC_LIMITE_CM;

  acionarAtuadores(risco);
  imprimirCSV(temp, umid, distancia, risco ? "RISCO" : "SEGURO");

  delay(1500);
}
