const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const snapshot = 10 * 2;

// Train a simple model:
const model = tf.sequential();
model.add(
  tf.layers.dense({
    units: 512,
    activation: 'relu',
    inputShape: [snapshot],
  })
);

model.add(tf.layers.dense({ units: 2, activation: 'sigmoid' }));
const optimizer = tf.train.adam();
model.compile({
  optimizer,
  loss: 'meanSquaredError',
  shuffle: true,
});

const W = 1920;
const H = 1080;

const raw = fs.readFileSync(`mouse_data/mouse1619532364238.csv`, 'utf-8');
const rows = raw.split('\n');
const rawData = [];

let rowCount = 0;
for (let row of rows) {
  if (rowCount % 2 == 0) {
    const data = row.split(',');
    const x = Math.floor(parseInt(data[0])) / W;
    const y = Math.floor(parseInt(data[1])) / H;
    rawData.push(x);
    rawData.push(y);
  }
  rowCount++;
}

const xs_ = [];
const ys_ = [];
for (let i = 0; i < rawData.length - (snapshot + 2); i++) {
  let block = [];
  for (let j = 0; j < snapshot; j++) {
    block[j] = rawData[i];
  }
  xs_.push(block);
  ys_.push([rawData[i + snapshot], rawData[i + snapshot + 1]]);
}

const xs = tf.tensor(xs_);
const ys = tf.tensor(ys_);

start();

async function start() {
  await train();
}

async function train() {
  await model.fit(xs, ys, {
    epochs: 1,
    callbacks: {
      onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`),
    },
  });
}

async function predict(inputs_) {
  const inputs = tf.tensor([inputs_]);
  const outputs = model.predict(inputs);
  const next = await outputs.data();
  return next;
}
// Server
const express = require('express');

const app = express();
app.listen(3000, () => console.log('listening at 3000'));
app.use(express.json({ limit: '1mb' }));

let pInputs = [];
for (let i = 0; i < snapshot; i++) {
  pInputs[i] = Math.random();
}

app.get('/reset', async (request, response) => {
  for (let i = 0; i < snapshot; i++) {
    pInputs[i] = Math.random();
  }
  response.send('a-ok');
});

app.get('/mouse', async (request, response) => {
  const next = await predict(pInputs);
  console.log(next);
  pInputs.splice(0, 2);
  pInputs.push(next[0]);
  pInputs.push(next[1]);
  // response.json({ status: { mouseX: next[0], mouseY: next[1] } });
  response.send(`${next[0]},${next[1]}`);
});
