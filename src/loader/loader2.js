function loader(source) {
  console.log(source);
  console.log('loader2');
  return source;
}

module.exports = loader;
