function getPort(app) {
  console.log(process.env.PORT);
  const PORT = 3111;
  app.listen(PORT, () => {
    console.log(`Connected to port : ${PORT}`);
  });
}

module.exports = { getPort };
