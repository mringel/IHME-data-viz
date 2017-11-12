var mainChart = mainChart || {};

mainChart.interactive = function() {

  var cWidth = 1,
      cHeight = 1,
      padding = 50,
      cChartScaled = false,
      cChartDivTag = '.mainchart',
      allData = [],
      xScale,
      yScale;

  // helper function to format year into a date object
  var createDate = function(dateString) {
      var format = d3.time.format("%Y");
      // create a JavaScript data object based on the string
      return format.parse(dateString);
  };

  var init = function(divTag, width, height) {
    cChartDivTag = divTag;
    cWidth = width;
    cHeight = height;

    var container = d3.select(cChartDivTag)
      .append('svg')
      .attr('id', container)
      .attr('width', cWidth)
      .attr('height', cHeight);

    var viz = container.append('g')
      .attr('id', 'mainViz');

    d3.csv('./data/IHME_GBD_2013_joined.csv', function(error, data) {

      if (error) {
        console.error('Problem reading csv file.');
        return;
      }

      // put data in outer scope
      allData = data;

      // create linear scales
      yScale = d3.scale.linear().range([(height-padding*2), 0]);
      yScale.domain([0,0.6]);
      xScale = d3.time.scale().range([0, (width-padding*2)]);

      // create axes
      var xAxis = d3.svg.axis().scale(xScale).orient('bottom').tickFormat(d3.time.format('%Y'));
      var obesityAxis = d3.svg.axis().scale(yScale).orient('left').ticks(7);

      // time domain as integer year
      xScaleExtentInt = d3.extent(data, function(d) {
        return parseInt(d.year)
      });

      // scale the time domain for padding around data
      xScale.domain([createDate((xScaleExtentInt[0]-1).toString()), createDate((xScaleExtentInt[1]+1).toString())]);

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
        .call(obesityAxis);

      //set up some basic styles
      d3.selectAll("path.domain").style("fill", "none").style("stroke", "black");
      d3.selectAll("line").style("stroke", "black");

      plotSelectedRegion('Americas');

    }); // close load csv
  } // close init

  function plotSelectedRegion(region) {
    subset = allData.filter(function(doc) {
      return (doc.region === region && doc.age_group_id === '38' && doc.sex === 'both' && doc.metric === 'obese')
    });

    d3.select('.regionchart').select('svg').selectAll('circle').remove();
    d3.select('.regionchart').select('svg').selectAll('.regionline').remove();

    var points = d3.select('.regionchart').select('svg').selectAll('circle')
      .data(subset)
      .enter()
      .append('circle')
      .attr({
        cx: function(d) { return xScale(createDate(d.year)) + padding;},
        cy: function(d) {return yScale(d.mean) + padding;},
        r: 2,
        fill: 'steelblue'
      });

    // Update the chart label
    d3.select('.regioninfo').select('p').html(region);

    // draw lines

    var lineGenerator = d3.svg.line()
      .x(function(d) { return xScale(createDate(d.year)); })
      .y(function(d) { return yScale(d.mean)});

    var countries = new Set(subset.map(function(x) {return x.location_name;}));

    for (let country of countries) {

      var countryData = subset.filter(function(doc) {
        return doc.location_name === country;
      })

      d3.select('.regionchart').select('svg').append('path')
        .datum(countryData)
        .attr('transform', 'translate(' + padding + ',' + padding + ')')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator)
        .attr('class', 'regionline');
    }
  }

  return {
    cChartDivTag: cChartDivTag,

    init: init,
    plotSelectedRegion: plotSelectedRegion

  };


}(); // close interactive function
