function secondaryView(business_id, name) {
    var margin = {top: 30, right: 10, bottom: 10, left: 10},
    width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

    var x = d3.scaleBand().rangeRound([0, width]).padding(1),
        y = {},
        dragging = {};

    var line = d3.line(),
        background,
        foreground,
        extents;

    d3.selectAll("#parallel")
    .remove();

    var info = d3.select("body").append("p")
        .attr("id", "parallel")
        .attr("class", "info")
        .html(`The chart below depicts the top 250 useful reviews for "${name}"
        <br>
        Line => Review
        <br>
        Line color => How positive or negative a review is (refer color legend below chart)
        <br>
        Brush (click and drag up or down when cursor becomes "+" while hovering) over an axis to filter lines
        <br>
        Click outside the brushing area on the same axis to reset
        <br>
        Tip: It is possible to move and resize the brushing area after setting it
        <br>
        Tip 2: You can also reorder the axes by clicking (when cursor shows the "move" symbol) and dragging over the other ones
        <br>
        Scroll down to look at the other restaurant-specific visualization`);

    d3.selectAll(".parallel-coordinates")
    .remove();

    var svg = d3.select("body").append("svg")
        .attr("class", "parallel-coordinates")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom + 50)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + (margin.top + 50) + ")");

    d3.selectAll(".legend")
    .remove();

    var legend = d3.select("body")
                .append("svg")
                .attr("width", window.innerWidth)
                .attr("height", 150)
                .attr("class", "legend");

    // Smooth scrolling to secondary view
    window.scrollBy({
        top: 1650 - scrollY,
        left: 0,
        behavior: "smooth"
    });

    var color = d3.scaleLinear()
                .domain([-1, -0.5, 0, 0.5, 1])
                .range(["#FF0000", "#FF9A21", "#FFFF2D", "#44FF44", "#006400"]);

    d3.csv(`./data/restaurants/${business_id}.csv`).then(reviews => {
        // Extract the list of dimensions and create a scale for each
        x.domain(dimensions = d3.keys(reviews[0]).filter(function(d) {
            if(d == "review_id" || d == "sentiment_polarity") {
                return false;
            } 
            return y[d] = d3.scaleLinear()
                .domain(d3.extent(reviews, function(p) { 
                    return +p[d]; }))
                .range([height, 0]);
        }));

        extents = dimensions.map(function() { return [0, 0]; });

        // Add background lines for context
        background = svg.append("g")
            .attr("class", "background")
            .selectAll("path")
            .data(reviews)
            .enter()
            .append("path")
            .attr("d", path);

        // Add foreground lines for focus
        foreground = svg.append("g")
            .attr("class", "foreground")
            .selectAll("path")
            .data(reviews)
            .enter()
            .append("path")
            .attr("d", path)
            .style("stroke", function(d) {
                var polarity = d["sentiment_polarity"];
                return color(polarity);
            });

        // Add a group element for each dimension
        var g = svg.selectAll(".dimension")
            .data(dimensions)
            .enter()
            .append("g")
            .attr("class", "dimension")
            .attr("transform", function(d) {  return "translate(" + x(d) + ")"; })
            .call(d3.drag()
                .subject(function(d) { return {x: x(d)}; })
                .on("start", function(d) {
                    dragging[d] = x(d);
                    background.attr("visibility", "hidden");
                })
                .on("drag", function(d) {
                    dragging[d] = Math.min(width, Math.max(0, d3.event.x));
                    foreground.attr("d", path);
                    dimensions.sort(function(a, b) { return position(a) - position(b); });
                    x.domain(dimensions);
                    g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                })
                .on("end", function(d) {
                    delete dragging[d];
                    transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
                    transition(foreground).attr("d", path);
                    background
                        .attr("d", path)
                        .transition()
                        .delay(500)
                        .duration(0)
                        .attr("visibility", null);
                }));

        // Add an axis and title
        g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(d3.axisLeft(y[d]));})
        .append("text")
        .attr("y", -9) 
        .text(function(d) { return d; });

        // Remove decimal value ticks
        d3.selectAll(".tick")
        .each(function() {
            var value = d3.select(this)
                        .select("text")
                        .text();
            value = parseFloat(value.replace(",", ""));
            temp = Math.floor(value);
            if(value != temp) {
                d3.select(this)
                .remove();
            } else {
                d3.select(this)
                .select("text")
                .text(temp.toString())
            }
        });

        // Add and store a brush for each axis
        g.append("g")
        .attr("class", "brush")
        .each(function(d) {
            d3.select(this).call(y[d].brush = d3.brushY().extent([[-8, 0], [8, height]])
            .on("start", brushstart)
            .on("brush", brush)
            );
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);

        // Create continuous diverging color legend
        var value = -1;
        for(var i = 0; i <= 100; i++) {
            legend.append("rect")
            .attr("x", (window.innerWidth / 2) - 253 + (5 * i))
            .attr("y", 30)
            .attr("width", 5)
            .attr("height", 10)
            .attr("fill", color(value));

            value += 0.02;
        }

        legend.append("text")
        .attr("x", (window.innerWidth / 2) - 253)
        .attr("y", 30)
        .attr("dy", "2em")
        .attr("text-anchor", "middle")
        .style("font-family", "sans-serif")
        .style("font-size", 11 + "px")
        .text("Very Negative")

        var legend_ticks = ["Negative", "Neutral", "Positive", "Very Positive"];
        for(var i = 0; i < 4; i++) {
            legend.append("text")
            .attr("x", (window.innerWidth / 2) - 123 + (125 * i))
            .attr("y", 30)
            .attr("dy", "2em")
            .attr("text-anchor", "middle")
            .style("font-family", "sans-serif")
            .style("font-size", 11 + "px")
            .text(legend_ticks[i])
        }
    });

    function position(d) {
        var v = dragging[d];
        return v == null ? x(d) : v;
    }

    function transition(g) {
        return g.transition().duration(500);
    }

    // Returns the path for a given data point.
    function path(d) {
        return line(dimensions.map(function(p) { return [position(p), y[p](d[p])]; }));
    }

    function brushstart(d) {
        var cursor = d3.select(this.children[0])
            .attr("cursor");

        if(cursor === "crosshair") {
            foreground.style("display", "none");
        
            var dimensionsIndex = dimensions.indexOf(d);
            extents[dimensionsIndex] = [0, 0];

            foreground.style("display", function(d) {
                return dimensions.every(function(p, i) {
                    if(extents[i][0]==0 && extents[i][0]==0) {
                        return true;
                    }
                    return extents[i][1] <= d[p] && d[p] <= extents[i][0];
                }) ? null : "none";
            });
        }
    }
    
    // Handles a brush event, toggling the display of foreground lines.
    function brush() {
        d3.event.sourceEvent.stopPropagation();
        
        for(var i = 0; i < dimensions.length; i++) {
            if(d3.event.target == y[dimensions[i]].brush) {
                extents[i] = d3.event.selection.map(y[dimensions[i]].invert, y[dimensions[i]]);
            }
        }

        foreground.style("display", function(d) {
            return dimensions.every(function(p, i) {
                if(extents[i][0] == 0 && extents[i][0] == 0) {
                    return true;
                }
                return extents[i][1] <= d[p] && d[p] <= extents[i][0];
            }) ? null : "none";
        });
    }
}