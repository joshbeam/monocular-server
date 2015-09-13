export default function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
}
