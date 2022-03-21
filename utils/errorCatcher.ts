export default function errorCatcher(originalFunction) {
  // Prevents the server from crashing when the function throws an error
  return (...args) => {
    try {
      originalFunction(...args);
    } catch (err) {
      console.log(err);
    }
  };
}
