import express from 'express';
import helmet from 'helmet';

const app = express();
app.use(helmet());

const port = 8000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});
