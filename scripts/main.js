var width = window.innerWidth - 30;
var height = 1500;
var radius = width / 6;
var arc = d3.arc()
    .startAngle(d => d.x0)
    .endAngle(d => d.x1)
    .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
    .padRadius(radius * 1.5)
    .innerRadius(d => d.y0 * radius)
    .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))

var svg = d3.select("body").append("svg")
    .attr("class", "sunburst")
    .attr("width", width)
    .attr("height", height);

var g = svg.append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

d3.json("./data/cities.json").then(data => {
  var partition = data => {
    var root = d3.hierarchy(data)
        .sum(d => d.review_count)
        .sort((a, b) => b.review_count - a.review_count);
    return d3.partition()
            .size([2 * Math.PI, root.height + 1])
            (root);
  }

  var root = partition(data);
  root.each(d => d.current = d);

  var color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));

  var path = g.append("g")
      .selectAll("path")
      .data(root.descendants().slice(1))
      .enter()
      .append("path")
        .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
        .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
        .attr("d", d => arc(d.current));

  path
      .style("cursor", "pointer")
      .on("click", clicked);

  path.append("title")
      .text(d => d.children ? `${d.data.name}` : `${d.data.name} (${d.data.review_count} reviews)\n\nCategories: ${d.data.categories}`);

  var label = g.append("g")
      .attr("pointer-events", "none")
      .attr("text-anchor", "middle")
      .style("user-select", "none")
      .selectAll("text")
      .data(root.descendants().slice(1))
      .enter()
      .append("text")
        .attr("dy", "0.35em")
        .attr("fill-opacity", d => +labelVisible(d.current))
        .attr("transform", d => labelTransform(d.current))
        .text(d => d.data.name);

  var parent = g.append("circle")
      .datum(root)
      .attr("r", radius)
      .attr("fill", "none")
      .attr("pointer-events", "all")
      .on("click", clicked);
    
  function clicked(p) {
    if(p.children === undefined) {
      secondaryView(p.data["business_id"], p.data["name"]);
      thirdView(p.data["business_id"], p.data["name"]);
    }
    else {
      parent.datum(p.parent || root);

      root.each(d => d.target = {
        x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
        y0: Math.max(0, d.y0 - p.depth),
        y1: Math.max(0, d.y1 - p.depth)
      });

      var t = g.transition()
                .duration(750);

      // Transition the data on all arcs, even the ones that aren’t visible,
      // so that if this transition is interrupted, entering arcs will start
      // the next transition from the desired position.
      path.transition(t)
          .tween("data", d => {
            var i = d3.interpolate(d.current, d.target);
            return t => d.current = i(t);
          })
          .filter(function(d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
          })
          .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
          .attrTween("d", d => () => arc(d.current));

      label.filter(function(d) {
              return +this.getAttribute("fill-opacity") || labelVisible(d.target);
            })
            .transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
    }
  }

  function arcVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
  }

  function labelVisible(d) {
    return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
  }

  function labelTransform(d) {
    var x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
    var y = (d.y0 + d.y1) / 2 * radius;
    return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
  }
})