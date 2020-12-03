// margins 
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// create svg
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Create x and y axis
var chosenXAxis = "poverty";
var chosenYAxis = "smokes";



// update x-scale var when selecting axis label
function xScale(newsData, chosenXAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(newsData, d => d[chosenXAxis]) * 0.8,
      d3.max(newsData, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]); // x scale needs width

  return xLinearScale;

}

// (2) update y-scale var when selecting axis label
function yScale(newsData, chosenYAxis) {
  // create scales
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(newsData, d => d[chosenYAxis]) * 0.8,
      d3.max(newsData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]); // y scale needs height

  return xLinearScale;

}

// update xAxis var when selecting axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// update xAxis var when selecting axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// update X circles group with a transition 
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

// update Y circles group with a transition 
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// update state names
function renderAbbr(abbrGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  abbrGroup.transition()
  .duration(1000)
  .attr("x", d => newXScale(d[chosenXAxis]))
  .attr("y", d => newYScale(d[chosenYAxis]) + 2)
  .attr("text-anchor", "middle");
}

// update circles with new tooltip 
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  var xLabel;

  if (chosenXAxis === "poverty") {
    xLabel = "Poverty (%):";
  }
  else if (chosenXAxis === "age") {
    xLabel = "Age (Median):";
  }
  else {
    xLabel = "Income (Median):";
  }

  var yLabel;

  if (chosenYAxis === "smokes") {
    yLabel = "Smokers (%):";
  }
  if (chosenYAxis === "obesity") {
    yLabel = "Obesity (%):";
  }
  else {
    yLabel = "Healthcare (%):";
  }

  var toolTip = d3.tip()
    .attr("class", "d3-tip")
    .offset([-20, -20])
    .html(function(d) {
      return (`${yLabel} ${d[chosenYAxis]}<br>${xLabel} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup
  .on("mouseover", function(data) {
    toolTip.show(data, this);
  })

  .on("mouseout", function(data, index) {
    toolTip.hide(data);
  });

  // Log labels
  console.log('--- Chosen Labels ---') // <--- rm
  console.log(xLabel);
  console.log(yLabel);

  return circlesGroup;
}

// CSV data 
(async function(){
  var newsData = await d3.csv("assets/data/data.csv").catch(function(error) {
    console.log(error);
  });
  // Print data
  console.log(newsData);

  // Parse data and cast elements
  newsData.forEach(function(d) {
      // x axis data
      d.smokes = +d.smokes;
      d.obesity = +d.obesity;
      d.healthcare = +d.healthcare;
      // y axist data
      d.age = +d.age;
      d.poverty = +d.poverty;
      d.income = +d.income;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(newsData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(newsData, chosenYAxis);
  
  // Create initial axis functions 
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis 
  var xAxis = chartGroup.append("g")
  .classed("x-axis", true)
  .attr("transform", `translate(0, ${height})`)
  .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
  .call(leftAxis);

  // append first circles
  var circlesGroup = chartGroup.selectAll("circle")
  .data(newsData)
  .enter()
  .append("circle")
  .attr("class", "stateCircle")
  .attr("cx", d => xLinearScale(d[chosenXAxis])) // - (r.here)
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 10)
  .attr("opacity", ".9");

  // append first states
  var abbrGroup = chartGroup.selectAll("circles")
    .data(newsData)
    .enter()
    .append("text")
    .attr("class", "stateText")
    .text(d => d.abbr)
    .attr("font-size", "8px")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]) + 2)
    .attr("text-anchor", "middle");

  
  // Grouping 
  var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // Poverty 
  var xLabelPoverty = xLabelsGroup.append("text")
  .attr("x", 0) // x stays put for x axis
  .attr("y", 20) // y positive is moving down 20 pixels
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  .text("% Poverty");

  // Age is an x-label
  var xLabelAge = xLabelsGroup.append("text")
  .attr("x", 0) // x stays put for x axis
  .attr("y", 40) // y positive is moving down 20 pixels
  .attr("value", "age") // value to grab for event listener
  .classed("inactive", true)
  .text("Age (Median)");

  // Income
  var xLabelIncome = xLabelsGroup.append("text")
  .attr("x", 0) // x stays put for x axis
  .attr("y", 60) // y positive is moving down 20 pixels
  .attr("value", "income") // value to grab for event listener
  .classed("inactive", true)
  .text("Household Income (Median)");

  
  // append y axis labels 
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", "rotate(-90)"); // rotation for y-axis

  // Smoking
  var yLabelSmokes = yLabelsGroup.append("text")
  .attr("y", 0 - margin.left) // - (r.here)
  .attr("x", 0 - (height / 2))
  .attr("value", "smokes") // value to grab for event listener
  .attr("dy", "1em")
  .classed("active", true)
  .text("Smokes (%)");

   // Healthcare 
   var yLabelHealthcare = yLabelsGroup.append("text")
   .attr("y", 40 - margin.left) // - (r.here)
   .attr("x", 0 - (height / 2))
   .attr("value", "healthcare") // value to grab for event listener
   .attr("dy", "1em")
   .classed("inactive", true)
   .text("Healthcare (%)");

  // Obesity
  var yLabelObesity = yLabelsGroup.append("text")
  .attr("y", 20 - margin.left) // - (r.here)
  .attr("x", 0 - (height / 2))
  .attr("value", "obesity") // value to grab for event listener
  .attr("dy", "1em")
  .classed("inactive", true)
  .text("Obesity (%)");

  // updateToolTip 
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // x axis labels event listener
  xLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    
    console.log(`CLicked value is: ${value}`); // <--- rm

    if (value !== chosenXAxis) {

      // replaces chosenXAxis with value
      chosenXAxis = value;

      // console.log(chosenXAxis)

      // updates x scale
      xLinearScale = xScale(newsData, chosenXAxis);

      // updates x axis 
      xAxis = renderXAxes(xLinearScale, xAxis);

      // updates circles 
      circlesGroup = renderXCircles(circlesGroup, xLinearScale, chosenXAxis);

      // updates tooltips
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // update abbr
      renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      // changes xAxis classes to change bold text
      if (chosenXAxis === "poverty") {
        xLabelPoverty // active
          .classed("active", true)
          .classed("inactive", false);
        xLabelAge
          .classed("active", false)
          .classed("inactive", true);
        xLabelIncome
        .classed("active", false)
        .classed("inactive", true);
      }
      else if (chosenXAxis === "age") {
        xLabelPoverty
          .classed("active", false)
          .classed("inactive", true);
        xLabelAge // active
          .classed("active", true)
          .classed("inactive", false);
        xLabelIncome
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        xLabelPoverty
          .classed("active", false)
          .classed("inactive", true);
        xLabelAge
          .classed("active", false)
          .classed("inactive", true);
        xLabelIncome // active
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
  // y axis labels event listener 
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");

    console.log(`CLicked value is: ${value}`); // <--- rm

    if (value !== chosenYAxis) {

      // replaces chosenYAxis with value declared during yLabel declarations in classed
      chosenYAxis = value; // <-- (r.here)

      // updates x scale for new data
      yLinearScale = yScale(newsData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderYAxes(yLinearScale, yAxis);

      // updates circles 
      circlesGroup = renderYCircles(circlesGroup, yLinearScale, chosenYAxis);

      // updates tooltips 
      circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

      // update Abbr
      renderAbbr(abbrGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

      // changes yAxis classes to change bold text
      if (chosenYAxis === "smokes") {
        yLabelSmokes // active
          .classed("active", true)
          .classed("inactive", false);
        yLabelObesity
          .classed("active", false)
          .classed("inactive", true);
        yLabelHealthcare
        .classed("active", false)
        .classed("inactive", true);
      }
      else if (chosenYAxis === "obesity") {
        yLabelSmokes
          .classed("active", false)
          .classed("inactive", true);
        yLabelObesity // active
          .classed("active", true)
          .classed("inactive", false);
        yLabelHealthcare
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
        yLabelSmokes
          .classed("active", false)
          .classed("inactive", true);
        yLabelObesity
          .classed("active", false)
          .classed("inactive", true);
        yLabelHealthcare // active
          .classed("active", true)
          .classed("inactive", false);
      }
    }
  });
})()