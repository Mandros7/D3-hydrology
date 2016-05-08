
//Size de los elementos de la matriz 
var width = 430,
    size = 72,
    padding = 9;
    barsize = size*2/40

//Eje Y.
var y = d3.scale.linear()

//Variable que alamcena los selectores
var combos = {}


var allKeys,data;
var domainByKey = {}

var allTraitsCode = ['SK','LI','BE','FR','BG','NL','GR','RS','EE','HR','TR','MK','SI','ES','CZ','CY','IS','CH','AT','DK','FI','SE','IE','ME','LT']


var desired_traits = ['FR','BE','IE','SK','CH']

var dataMonth;

// ------------------- //

var marginM = {top: 30, right: 20, bottom: 30, left: 50},
    widthM = 650 - marginM.left - marginM.right,
    heightM = 375 - marginM.top - marginM.bottom;

var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, widthM], .1);

var x1 = d3.scale.ordinal();

var yMain = d3.scale.linear()
    .range([heightM, 0]);

var color = [];

var availableColors = ['#377eb8','#4daf4a','#ff7f00'];

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yMain)
    .orient("left")
    .tickFormat(d3.format(".2s"));

/* 
.
.
.
.
.
*/
 var svg = d3.select(".box").append("svg")
      .attr("padding", 15)
      .attr("width", size * 5 + padding)
      .attr("height", size * 5 + padding)
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");


d3.csv("2008_2012_monthlyValues_per.csv", function(error, data) {

  if (error) throw error;
  dataMonth = data;
  allKeys = d3.keys(data[0]).filter(function(d) { return d !== ""; });
  keys=allKeys.filter(function(d) {return desired_traits.indexOf(d.split("_")[0])!==-1 })
  orderKeys(desired_traits)
  n = keys.length/5;
  keys.forEach(function(trait) {
    max = 0;
    data.forEach(function(d) {
          new_max = parseFloat(d[trait]);
          if (new_max > max) max = new_max; 
    });
    domainByKey[trait] = max;
  });

  console.log(domainByKey)

  var cell = svg.selectAll(".cell")
      .data(cross(keys))
      .enter().append("g")
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(initialPlot);

  // Titles for the diagonal.
  cell.append("text")
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) { return d.x; });

  function initialPlot(p) {
    var cell = d3.select(this);
    var max = d3.max(d3.values(data[p.x]));
    cell.on("click",function (d) {addCountry(cell,p.x);});
    cell.append("rect")
        .attr("class", "frame")
        .attr("stroke","#aaa")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding)
        .style("fill", "#fff");

    if (p.i/5==0) {
      var cl = '.col'+p.j;
      combos[p.j] = d3.select(cl)
          .append('select')
          .on('change',function(d){
            var newCode = allTraitsCode[combos[p.j].property('selectedIndex')]
            if (desired_traits.indexOf(newCode) == -1){
              desired_traits[p.j]  = allTraitsCode[combos[p.j].property('selectedIndex')]
              updateKeys(desired_traits)
              updateMatrix(svg)
              barGraphVars.forEach(function (d) {
                if (keys.indexOf(d) == -1) {
                  resetData()
                }
              })

            }
            else {
              combos[p.j].property("selectedIndex",allTraitsCode.indexOf(desired_traits[p.j]))
            }
          });

    // añadimos las opciones (nombres de las variables) al comboX
      combo0opt = combos[p.j]     
          .selectAll('option').data(allTraitsCode)
          .enter()
          .append('option')
          .text(function(d){return d});
    
      combos[p.j].property("selectedIndex",allTraitsCode.indexOf(desired_traits[p.j])); 
    }

    y.domain([0,domainByKey[p.x]]);
    y.range([size - padding, 3*padding]);
      
    cell.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d,i) {return 1.3*barsize + (i*3*barsize/2);})
      .attr("width", barsize)
      .attr("y", function(d) { return y(d[p.x]); })
      .attr("height", function(d) {return size - padding/2 - y(d[p.x]); });
  }

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");

});



/*
.
.
.
.
.
.*/

var svgBars = d3.select(".box").append("svg")
    .attr("width", widthM + marginM.left + marginM.right)
    .attr("height", heightM + marginM.top + marginM.bottom)
  .append("g")
    .attr("transform", "translate(" + marginM.left + "," + marginM.top + ")");

var barGraphVars = [];
var barData;
var countryNames

d3.csv("2008_2012_monthlyValues_VIS.csv", function(error, data) {
  if (error) throw error;
  barData = data;
  var keys = d3.keys(data[0]).filter(function(key) { return key; });
  countryNames = keys.filter(function (d) { return barGraphVars.indexOf(d)!==-1})

  months = data.map(function(d) { return d[""]; });

  data.forEach(function(d) {
    d.sflow = countryNames.map(function(name) { return {name: name, value: +d[name]}; });
  });

  x0.domain(months);
  x1.domain(countryNames).rangeRoundBands([0, x0.rangeBand()]);
  yMain.domain([0, d3.max(data, function(d) { return d3.max(d.sflow, function(d) { return d.value; }); })]);

  svgBars.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + heightM + ")")
      .call(xAxis);

  svgBars.append("g")
      .attr("class", "y axis")
      .call(yAxis)
      .append("text")
      //.attr("transform", "rotate(-90)")
      .attr("y", -20)
      .attr("x", 50)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Stream Flow (m³/s)");

  var state = svgBars.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "state")
      .attr("transform", function(d,i) { return "translate(" + x0(d[""]) + ",0)"; });

  state.selectAll("rect")
      .data(function(d) { return d.sflow; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return yMain(d.value); })
      .attr("height", function(d) { return heightM - yMain(d.value); })
      .style("fill", function(d) { return color(d.name); })

  var legend = svgBars.selectAll(".legend")
      .data(countryNames.slice().reverse())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  legend.append("rect")
      .attr("x", widthM - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", widthM - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d; });

});



/*
.
.
.
.
.
.
*/

function updateKeys(newTraits) {
  keys=allKeys.filter(function(d) {return newTraits.indexOf(d.split("_")[0])!==-1 })
  orderKeys(desired_traits)
  n = keys.length/5;
  keys.forEach(function(trait) {
    max = 0;
    dataMonth.forEach(function(d) {
          new_max = parseFloat(d[trait]);
          if (new_max > max) max = new_max; 
    });
    domainByKey[trait] = max;
  });
}

function updateMatrix (svg) {
  var cell = svg.selectAll(".cell")
      .data(cross(keys))
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(updatePlot);
}

function cross(a) {
  var c = [], n = a.length, i;
  for (i = -1; ++i < n;){ 
    k = i%5;
    var j = Math.floor(i/5);
    res = a[i].split("_");
    c.push({x: a[i], i: j, j: k});
  }
  return c
}

function updatePlot(p) {
    var cell = d3.select(this);
    var max = d3.max(d3.values(dataMonth[p.x]));
    y.domain([0,domainByKey[p.x]]);
    y.range([size - padding, 3*padding]);
    
    cell.on("click",function (d) {addCountry(cell,p.x);});
    cell.selectAll("text")
      .data(dataMonth)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) {return p.x; });  

    cell.selectAll(".bar")
      .data(dataMonth)
      .transition()
      .duration(1000)
      .attr("class", "bar")
      .attr("x", function(d,i) {return 1.5*barsize + (i*3*barsize/2);})
      .attr("width", barsize)
      .attr("y", function(d) { return y(d[p.x]); })
      .attr("height", function(d) {return size - padding/2 - y(d[p.x]); });
}

function orderKeys(desired_traits) {
  var tempKeys = [];
  desired_traits.forEach(function(dt) {
          subTrait=keys.filter(function(d) {return dt.indexOf(d.split("_")[0])!==-1 })
          tempKeys = tempKeys.concat(subTrait)
    });
  keys = tempKeys;
}

function addCountry(cell,name) {
    var index = barGraphVars.indexOf(name);
    if (index != -1){
      barGraphVars.splice(index, 1);
      unBindColor(name);
      cell.selectAll(".frame")
        .attr("stroke","#aaa")
        .attr("stroke-width",1)
    }
    else {
      if (barGraphVars.length < 3) {
        bindColor(name);
        barGraphVars.push(name)
        cell.selectAll(".frame")
        .attr("stroke",getColorByName(name))
        .attr("stroke-width",5)
      }
    }
    reloadBarChart()
}

function bindColor(name){
  var newColor;
  availableColors.forEach(function (possibleColor) {
    fil = d3.values(color).filter(function(d) {return d.color==possibleColor})
    if (fil.length == 0)
      newColor = possibleColor;
  });
  color.push({name: name, color:newColor});
}

function unBindColor(name){
  color = color.filter(function (d) {return d.name !== name});
}

function getColorByName(name) {
  find = color.filter(function(d) {return d.name == name})
  return find[0].color
}

function reloadBarChart() {
    countryNames = keys.filter(function (d) { return barGraphVars.indexOf(d)!==-1})
    var max = {};
    barData.forEach(function(d) {
         d.sflow = countryNames.map(function(name) { return {name: name, value: +d[name]}; });
         max = countryNames.map(function(name) { return {name: name, value: +d[name]}; });
      });
    x0.domain(months);
    x1.domain(countryNames).rangeRoundBands([0, x0.rangeBand()]);
    yMain.domain([0, d3.max(barData, function(d) { return d3.max(d.sflow, function(d) { return d.value; }); })]);

    console.log(d3.max(barData, function(d) { return d3.max(d.sflow, function(d) { return d.value; }); }))
    //console.log(d3.max(max, function(d) { return d.value; }))
      var legend = svgBars.selectAll(".legend")
      .data(countryNames.slice().reverse())
        //.enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    d3.select(".y.axis")
      .transition()
      .duration(1000)
      .call(yAxis)

      var state = svgBars.selectAll(".state")

      state.selectAll("rect")
        .data(function(d) { return d.sflow; })
        .enter().append("rect")
        .transition()
        .duration(1000)
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return yMain(d.value); })
        .attr("height", function(d) { return heightM - yMain(d.value); })
      
      state.selectAll("rect")
        .data(function(d) { return d.sflow; })
        .style("fill", function(d) { return getColorByName(d.name); })

      state.selectAll("rect")
        .data(function(d) { return d.sflow; })
        .transition()
        .duration(1000)
        .attr("width", x1.rangeBand())
        .attr("x", function(d) { return x1(d.name); })
        .attr("y", function(d) { return yMain(d.value); })
        .attr("height", function(d) { return heightM - yMain(d.value); })

      state.selectAll("rect")
        .data(function(d) { return d.sflow; })
        .exit().remove()




    svgBars.selectAll(".legend")
        .data(countryNames)
        .exit().remove()

    var legend = svgBars.selectAll(".legend")
        .data(countryNames)
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) {return "translate(0," + (i * 20) + ")"; });

    legend.append("rect")
        .attr("x", widthM - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", getColorByName);

    legend.append("text")
        .attr("x", widthM - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });

    var updateLegends = svgBars.selectAll(".legend")
        .data(countryNames)

    updateLegends.select("rect")
        .attr("x", widthM - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", getColorByName);

    updateLegends.select("text")
        .attr("x", widthM - 24)
        .attr("y", 9)
        .attr("dy", ".35em")
        .style("text-anchor", "end")
        .text(function(d) { return d; });
}

function resetData(){
  barGraphVars = [];
  color = [];
  cell = d3.selectAll(".cell");
  cell.selectAll(".frame")
        .attr("stroke","#aaa")
        .attr("stroke-width",1)
  reloadBarChart()     
}
