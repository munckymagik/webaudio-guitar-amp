# WebAudio Guitar-Amp

A virtual guitar amp in the browser. Originally written at the [ScotlandJS](http://scotlandjs.com/) Web Audio Hack Day 2015, but since developed onwards and now converted to TypeScript.

The original Hack Day sources are in the [archive](archive/).

# Prerequisites

The project depends upon:

  * [NodeJS](https://nodejs.org/)

# Setting up locally

Run

```
npm install
```

# Running Locally

Run

```
npm start
```

Then open http://localhost:8080/ in your browser.

# Updating the bundle ready to deploy to gh-pages

Run

```
npm run build
git add assets/bundle*
git commit -m 'Saving new build of the bundle'
```

# Lint the sources

Run

```
npm run lint
```
