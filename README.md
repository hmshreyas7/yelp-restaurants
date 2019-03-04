# Yelp Restaurants

This project visualizes reviews associated with open restaurants in 3 metros (Las Vegas, Phoenix, and Charlotte) from the [Yelp academic dataset](https://yelp.com/dataset) using [D3](http://d3js.org) v5. The techniques used to implement this system are: a [zoomable sunburst](https://observablehq.com/@d3/zoomable-sunburst), a [parallel coordinates](https://mbostock.github.io/d3/talk/20111116/iris-parallel.html) system, and a [zoomable partition layout](https://observablehq.com/@d3/zoomable-icicle).

## Folders and Files

### /data

This directory contains a `cities.json` file which is used to render the sunburst overview. It holds information about the top 50 restaurants in each of the 3 cities based on the `number of reviews`. The `business ID`, `name`, and `categories` for each restaurant are also available in this file. Furthermore, there are 2 other folders within `/data`:

#### /phrases

This folder contains 150 JSON files where each file corresponds to a restaurant. The file names are of the format `<business ID>.json` and each of them consists of the top 10 most frequently used phrases in reviews by year. This data is used to generate the partition layout.

#### /restaurants

Here, you will find 150 CSV files just like how they are in `/phrases`. Each file contains information about the top 250 reviews for that restaurant based on usefulness. Attributes for each review are: `review ID`, `sentiment polarity`, `review year`, `number of useful votes`, and `number of user fans`. The parallel coordinates system is represented using these.

### /scripts

The `d3.min.js` file need for using D3 is included here. It can, however, be loaded directly using:
```
<script src="https://d3js.org/d3.v5.min.js"></script>
```
`main.js`, `secondary.js`, and `third.js` contain the implementations of the sunburst, parallel coordinates, and partition layout respectively.

The 3 Python scripts in this folder are used to extract specific information from the original dataset. `extract_restaurants.py` is used to obtain the top 50 open restaurants in the aforementioned cities. `sentiment_analysis.py` and `extract_phrases.py` utilize the functions of [TextBlob](https://textblob.readthedocs.io/en/dev/) for identifying the polarity of the top 250 reviews and extracting the phrases most frequently used in them.

### /styles

This folder contains the CSS file for styling the views. Two blank lines are used to separate the styles associated with each. For example, there are extra blank lines before `.parallel-coordinates` and `.partition-layout`.

### index.html

Necessary JS and CSS files are included here. Parts of the overview are also created.

## Running the system

Open the `index.html` file (Mozilla Firefox or Microsoft Edge recommended) and follow the instructions above each view to know how to interact with the system.
