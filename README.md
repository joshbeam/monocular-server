# monocular-server

The server component for <a href="http://github.com/joshbeam/monocular">Monocular</a>.

## Installation

```
git clone https://github.com/joshbeam/monocular-server
cd monocular-server
npm install
```

## Run it

```
npm start
```

## API

See `api.paw`.

1. `landmarks` - returns all landmarks, containing photos and today's weather at that landmark
2. `landmarks/:name<forecast>` - returns weather and photo data for a given landmark (optional querystring param `forecast` will return a 5-day forecast of weather)

<hr>

&copy; 2015 Josh Beam - MIT License | talk@joshbe.am | www.joshbe.am
