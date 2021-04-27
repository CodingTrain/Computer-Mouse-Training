const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

const snapshot = 10 * 2;

// Train a simple model:
const model = tf.sequential();
model.add(
  tf.layers.dense({
    units: 16,
    activation: 'relu',
    inputShape: [snapshot],
  })
);

model.add(tf.layers.dense({ units: 2, activation: 'sigmoid' }));
model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });

const W = 1920;
const H = 1080;

const raw = fs.readFileSync(`mouse_small.csv`, 'utf-8');
const rows = raw.split('\n');
const rawData = [];
for (let row of rows) {
  const data = row.split(',');
  const x = Math.floor(parseInt(data[0])) / W;
  const y = Math.floor(parseInt(data[1])) / H;
  rawData.push(x);
  rawData.push(y);
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

model.fit(xs, ys, {
  epochs: 50,
  callbacks: {
    onEpochEnd: (epoch, log) => console.log(`Epoch ${epoch}: loss = ${log.loss}`),
  },
});
