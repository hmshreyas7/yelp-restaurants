function thirdView(business_id, name) {
    var w = 1120,
    h = 600,
    x = d3.scaleLinear().range([0, w]),
    y = d3.scaleLinear().range([0, h]);

    d3.selectAll("#partition")
    .remove();

    var info = d3.select("body").append("p")
        .attr("id", "partition")
        .attr("class", "info")
        .html(`The chart below depicts the top 10 most frequently used phrases in reviews by year for "${name}"
        <br>
        Segment size => Phrase frequency
        <br>
        Click on a year to zoom in and filter out the rest
        <br>
        Click anywhere outside the year segment to reset
        <br>
        Hover over any phrase to see its frequency for that year`);

    d3.selectAll(".partition-layout")
    .remove();

    var vis = d3.select("body").append("svg")
                .attr("class", "partition-layout")
                .attr("width", w)
                .attr("height", h);

    var partition = d3.partition()
            .size([width, height])
            .padding(0)
            .round(true);

    d3.json(`./data/phrases/${business_id}.json`).then(data => {

        data["children"].sort((a, b) => {
            return b["name"] - a["name"];
        });

        for(var i = 0; i < data["children"].length; i++) {
            for(var j = 0; j < data["children"][i]["children"].length; j++) {
                var temp = data["children"][i]["children"][j];
                var child = {
                    "name": temp[0],
                    "size": temp[1]
                }
                data["children"][i]["children"][j] = child;
            }
        }

        var root = d3.hierarchy(data)
        .sum(d => { return d.children ? 0 : d.size; });

        partition(root);

        x.domain([root.y0, w]);
        y.domain([root.x0, root.x1]);

        var g = vis.selectAll("g")
            .data(root.descendants())
            .enter()
            .append("g")
            .attr("transform", function(d) { return "translate(" + x(d.y0) + "," + y(d.x0) + ")"; })
            .on("click", click)
            .on("mouseover", mouseover);

        var kx = w / (w - root.x0),
            ky = h / (root.x1 - root.x0);

        g.append("rect")
        .attr("id", "node")
        .attr("width", (root.y1 - root.y0) * kx)
        .attr("height", function(d) { return (d.x1 - d.x0) * ky; })
        .attr("class", function(d) { return d.children ? "parent" : "child"; });

        g.append("text")
        .attr("id", "node-text")
        .attr("transform", transform)
        .attr("dy", ".35em")
        .style("opacity", function(d) { return (d.x1 - d.x0) * ky > 12 ? 1 : 0; })
        .text(function(d) { return d.data.name; })

        d3.select(window)
            .on("click", function() { click(root); })

        function mouseover(d) {
            if(!d.children) {
                d3.select(this)
                .append("title")
                .text(d => `${d.data.size} times`);
            }
        }

        function click(d) {
            if (!d.children) return;

            kx = (d.y0 ? w - 40 : w) / (w - d.y0);
            ky = h / (d.x1 - d.x0);
            x.domain([d.y0, w]).range([d.y0 ? 40 : 0, w]);
            y.domain([d.x0, d.x1]);

            var t = g.transition()
                .duration(d3.event.altKey ? 7500 : 750)
                .attr("transform", function(d) { return "translate(" + x(d.y0) + "," + y(d.x0) + ")"; });

            t.select("rect")
                .attr("width", (d.y1 - d.y0) * kx)
                .attr("height", function(d) { return (d.x1 - d.x0) * ky; });

            t.select("text")
                .attr("transform", transform)
                .style("opacity", function(d) { return (d.x1 - d.x0) * ky > 12 ? 1 : 0; });

            d3.event.stopPropagation();
        }

        function transform(d) {
            return "translate(8," + (d.x1 - d.x0) * ky / 2 + ")";
        }
    });
}