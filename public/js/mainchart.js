var mainChart = mainChart || {};

mainChart.interactive = function() {

  var cWidth = 1,
      cHeight = 1,
      padding = 50,
      cChartDivTag = '.mainchart',
      allData = [],
      countries = [],
      subset = [],
      xScale,
      yScale;

  // getters for passing state between charts
  var getCountries = function() {
    return countries;
  };

  var getAllData = function() {
    return allData;
  }

  // initializer for region chart
  var init = function(divTag, width, height) {
    cChartDivTag = divTag;
    cWidth = width;
    cHeight = height;

    var container = d3.select(cChartDivTag)
      .append('svg')
      .attr('id', 'regionSVG')
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
      var yAxis = d3.svg.axis().scale(yScale).orient('left').ticks(7);

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
        .call(yAxis);

      //set up some basic styles TODO move to css
      d3.selectAll("path.domain").style("fill", "none").style("stroke", "black");
      d3.selectAll("line").style("stroke", "black");

      plotSelectedRegion('Americas');

      var bodyWidth = document.getElementById('page-content').offsetWidth;
      countryChart.init('.countrychart', bodyWidth/3, bodyWidth/3, xAxis, yAxis);

    }); // close load csv
  } // close init

  function plotSelectedRegion(region) {
    subset = allData.filter(function(doc) {
      return (doc.region === region && doc.age_group_id === '38' && doc.sex === 'both' && doc.metric === 'obese')
    });

    //remove existing chart elements
    d3.select('.regionchart').select('svg').selectAll('g.linegroup').remove();
    // remove exisiting dropdown options
    d3.selectAll('#country-dropdown-menu a').remove();

    // Update the chart label
    d3.select('.regioninfo').select('p').html(region);

    // line generator for each country line
    var lineGenerator = d3.svg.line()
      .x(function(d) { return xScale(createDate(d.year)); })
      .y(function(d) { return yScale(d.mean)});

    countries = new Set(subset.map(function(x) {return x.location_name;}));

    var list = document.getElementById("country-dropdown-menu");

    //iterate through all countries and draw a line and label for each
    for (let country of countries) {

      // get the data for an individual chart line
      var countryData = subset.filter(function(doc) {
        return doc.location_name === country;
      });

      var lineGroup = d3.select('.regionchart').select('svg').append('g').attr('class', 'linegroup');

      var points = lineGroup.selectAll('circle')
        .data(countryData)
        .enter()
        .append('circle')
        .attr({
          cx: function(d) { return xScale(createDate(d.year)) + padding;},
          cy: function(d) {return yScale(d.mean) + padding;},
          r: 2,
          fill: 'steelblue'
        });

      var line = lineGroup.selectAll('g.line')
        .data(countryData)
        .enter()
        .append('g')
        .attr('class', 'line');

      line.append('path')
        .datum(countryData)
        .attr('transform', 'translate(' + padding + ',' + padding + ')')
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1.5)
        .attr('d', lineGenerator)
        .attr('class', 'regionline');

      var text = lineGroup.append('text')
        .attr('x', (cWidth-padding*3))
        .attr('y', (yScale(countryData[countryData.length-1].mean)+padding-15))
        .attr('dy', '.35em')
        .attr('text-anchor', 'start')
        .attr('class', 'regionline-label')
        .style('fill', '#007bff')
        .text(countryData[0].location_name);

        var bbox = text.node().getBBox();

        var rect = lineGroup.insert('rect', 'text')
        .attr("x", bbox.x)
        .attr("y", bbox.y)
        .attr("width", bbox.width)
        .attr("height", bbox.height)
        .attr('class', 'regionline-label')
        .style("fill", "#EEE")
        .style('display', 'none')
        // .style("fill-opacity", ".3")
        .style("stroke", "#666")
        .style("stroke-width", "1.5px");

        // need to set to none AFTER BBox has been called
        text.style('display', 'none');

        //update country dropdown
        var link = document.createElement("a");
        link.className = 'dropdown-item';
        var text = document.createTextNode(country);
        link.appendChild(text);
        link.href = "#";
        list.appendChild(link);

    } // end of for each iterating each country

    d3.select('.regionchart').select('svg').selectAll('path').on('click', function(d, i) {
	      var line = d3.select(this);
	      console.dir(line[0][0].__data__[0].location_name);
    })

    d3.selectAll('g.linegroup').on("mouseenter", function(d, i) {
      line = d3.select(this);
      line.moveToFront();
      line.selectAll('path')
        .attr('stroke', '#007bff')
        .attr('stroke-width', 3);
      line.selectAll('.regionline-label')
         .style('display', 'block');
      line.selectAll('rect')
        .style('display', 'block');
    });

    d3.selectAll('g.linegroup').on("mouseleave", function(d, i) {
      var line = d3.select(this);
      line.selectAll('text')
         .style('display', 'none');
      line.selectAll('rect')
        .style('display', 'none');
      line.selectAll('path')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 1.5);
    });

    $('.dropdown-item').click(function(e) {
        e.preventDefault();
        var name = e.currentTarget;
        console.dir(name.innerText);
        gState.cCountry = name.innerText;
        countryChart.plotCountry(allData, xScale, yScale);
    });


  } // close plot selected region

  return {
    cChartDivTag: cChartDivTag,
    xScale: xScale,
    yScale: yScale,

    init: init,
    plotSelectedRegion: plotSelectedRegion,
    getCountries: getCountries,
    getAllData: getAllData

  };


}(); // close interactive function
