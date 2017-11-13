var countryChart = countryChart || {};

countryChart.interactive = function() {

  var cWidth = 1,
      cHeight = 1,
      padding = 50,
      cChartDivTag = '.countrychart',
      xScale,
      yScale,
      cAgeGroupId = '38',
      cCountry = "";

  var init = function(divTag, width, height, xAxis, yAxis) {
    cChartDivTag = divTag;
    cWidth = width;
    cHeight = height;

    var container = d3.select(cChartDivTag)
      .append('svg')
      .attr('id', 'countrySVG' )
      .attr('width', cWidth)
      .attr('height', cHeight);

    var viz = container.append('g')
      .attr('id', 'countryViz')

    // draw the x-axis
    viz.append('g')
      .attr('class', 'xaxis')
      .attr('transform', 'translate(' + padding + ',' + (height - padding) + ')')
      .call(xAxis)
      .selectAll('text')
      .attr('y', 6)
      .attr('x', 6)
      .attr('transform', 'rotate(45)')
      .style('text-anchor', 'start');

    //initialize y-axis
    viz.append('g')
      .attr('class', 'yaxis')
      .attr('transform', 'translate(' + padding + ',' + padding + ')')
      .call(yAxis);

    //set up some basic styles TODO move to css
    d3.selectAll("path.domain").style("fill", "none").style("stroke", "black");
    d3.selectAll("line").style("stroke", "black");



  } //close init function

  function plotCountry(data, xScale, yScale) {

    var countryData = data.filter(function(doc) {
      return (doc.location_name == gState.cCountry && doc.age_group_id == gState.cAgeGroupId && doc.metric === 'obese')
    });

    //remove existing chart elements
    d3.select('.countrychart').select('svg').selectAll('g.linegroup').remove();

    // Update the chart label
    d3.select('.countryinfo').select('p').html(gState.cCountry);

    // line generator for each country line
    var lineGenerator = d3.svg.line()
      .x(function(d) { return xScale(createDate(d.year)); })
      .y(function(d) { return yScale(d.mean)});

    var male = countryData.filter(function(doc) {
      return doc.sex_id === '1'
    });

    var female = countryData.filter(function(doc) {
      return doc.sex_id === '2'
    });

    var lineGroup = d3.select('.countrychart').select('svg').append('g').attr('class', 'linegroup');

    var points = lineGroup.selectAll('circle')
      .data(male)
      .enter()
      .append('circle')
      .attr({
        cx: function(d) { return xScale(createDate(d.year)) + padding;},
        cy: function(d) {return yScale(d.mean) + padding;},
        r: 2,
        fill: 'steelblue'
      });

      var line = lineGroup.selectAll('g.line')
        .data(male)
        .enter()
        .append('g')
        .attr('class', 'line');

      line.append('path')
        .datum(male)
        .attr('transform', 'translate(' + padding + ',' + padding + ')')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator)
        .attr('class', 'countryline-male');

        var text = lineGroup.append('text')
          .attr('x', (cWidth-padding*3))
          .attr('y', (yScale(male[male.length-1].mean)+padding-15))
          .attr('dy', '.35em')
          .attr('text-anchor', 'start')
          .attr('class', 'countryline-label')
          .style('fill', '#007bff')
          .text('Male');

        var bbox = text.node().getBBox();

        var rect = lineGroup.insert('rect', 'text')
          .attr("x", bbox.x)
          .attr("y", bbox.y)
          .attr("width", bbox.width)
          .attr("height", bbox.height)
          .attr('class', 'regionline-malelabel')
          .style("fill", "#EEE")
          .style("stroke", "#666")
          .style("stroke-width", "1.5px");

        var femaleLineGroup = d3.select('.countrychart').select('svg').append('g').attr('class', 'linegroup');

        var points = femaleLineGroup.selectAll('circle')
          .data(female)
          .enter()
          .append('circle')
          .attr({
            cx: function(d) { return xScale(createDate(d.year)) + padding;},
            cy: function(d) {return yScale(d.mean) + padding;},
            r: 2,
            fill: 'pink'
          });

        var line = femaleLineGroup.selectAll('g.line')
          .data(female)
          .enter()
          .append('g')
          .attr('class', 'line');

        line.append('path')
          .datum(female)
          .attr('transform', 'translate(' + padding + ',' + padding + ')')
          .attr('fill', 'none')
          .attr('stroke', 'pink')
          .attr('stroke-linejoin', 'round')
          .attr('stroke-linecap', 'round')
          .attr('stroke-width', 1.5)
          .attr('d', lineGenerator)
          .attr('class', 'countryline-female');

        var text = femaleLineGroup.append('text')
          .attr('x', (cWidth-padding*3))
          .attr('y', (yScale(female[female.length-1].mean)+padding-15))
          .attr('dy', '.35em')
          .attr('text-anchor', 'start')
          .attr('class', 'countryline-label')
          .style('fill', 'red')
          .text('Female');

        var bbox = text.node().getBBox();

        var rect = femaleLineGroup.insert('rect', 'text')
          .attr("x", bbox.x)
          .attr("y", bbox.y)
          .attr("width", bbox.width)
          .attr("height", bbox.height)
          .attr('class', 'regionline-femalelabel')
          .style("fill", "#EEE")
          .style("stroke", "#666")
          .style("stroke-width", "1.5px");

  } //close plotCountry

  return {
    cCountry: cCountry,
    cAgeGroupId: cAgeGroupId,

    init: init,
    plotCountry: plotCountry
  }

}(); // close interactive function
