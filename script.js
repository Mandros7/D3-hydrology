var width = 480,
    size = 80,
    padding = 10;
    barsize = size*2/40

var x = d3.scale.linear()
    .range([padding / 2, size - padding / 2]);

var y = d3.scale.linear()

var combos = {}

var xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .ticks(6);

var allTraits,data;
var domainByTrait = {}

var color = d3.scale.category10();

var allTraitsCode = ['SK','LI','BE','FR','BG','NL','GR','RS','EE','HR','TR','MK','SI','ES','CZ','CY','IS','CH','AT','DK','FI','SE','IE','ME','LT']
var desired_traits = ['FR','BE','IE','SK','LT']

d3.csv("2008_2012_monthlyValues_per.csv", function(error, datos) {

  if (error) throw error;
  data = datos;
  allTraits = d3.keys(data[0]).filter(function(d) { return d !== ""; });
  traits=allTraits.filter(function(d) {return desired_traits.indexOf(d.split("_")[0])!==-1 })
  orderTraits(desired_traits)
  n = traits.length/5;
  traits.forEach(function(trait) {
    max = 0;
    data.forEach(function(d) {
          new_max = parseFloat(d[trait]);
          if (new_max > max) max = new_max; 
    });
    domainByTrait[trait] = max;
  });

  console.log(domainByTrait)
  var svg = d3.select("body").append("svg")
      .attr("width", size * n + padding)
      .attr("height", size * n + padding)
      .append("g")
      .attr("transform", "translate(" + padding + "," + padding / 2 + ")");

  var cell = svg.selectAll(".cell")
      .data(cross(traits))
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
    cell.append("rect")
        .attr("class", "frame")
        .attr("x", padding / 2)
        .attr("y", padding / 2)
        .attr("width", size - padding)
        .attr("height", size - padding);


    if (p.i/5==0) {
      var cl = '.col'+p.j;
      combos[p.j] = d3.select(cl)
          .append('select')
          .on('change',function(d){
            var newCode = allTraitsCode[combos[p.j].property('selectedIndex')]
            if (desired_traits.indexOf(newCode) == -1){
              desired_traits[p.j]  = allTraitsCode[combos[p.j].property('selectedIndex')]
              updateTraits(desired_traits)
              updateMatrix(svg)
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

    y.domain([0,domainByTrait[p.x]]);
    y.range([size - padding, 3*padding]);
      
    cell.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d,i) {return 1.5*barsize + (i*3*barsize/2);})
      .attr("width", barsize)
      .attr("y", function(d) { return y(d[p.x]); })
      .attr("height", function(d) {return size - padding/2 - y(d[p.x]); });
  }

  d3.select(self.frameElement).style("height", size * n + padding + 20 + "px");

});

function updateTraits(newTraits) {
  traits=allTraits.filter(function(d) {return newTraits.indexOf(d.split("_")[0])!==-1 })
  orderTraits(desired_traits)
  n = traits.length/5;
  traits.forEach(function(trait) {
    max = 0;
    data.forEach(function(d) {
          new_max = parseFloat(d[trait]);
          if (new_max > max) max = new_max; 
    });
    domainByTrait[trait] = max;
  });
}

function updateMatrix (svg) {
  var cell = svg.selectAll(".cell")
      .data(cross(traits))
      .attr("class", "cell")
      .attr("transform", function(d) { return "translate(" + (n - d.i - 1) * size + "," + d.j * size + ")"; })
      .each(updatePlot);
  // Titles for the diagonal.
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
    var max = d3.max(d3.values(data[p.x]));
    y.domain([0,domainByTrait[p.x]]);
    y.range([size - padding, 3*padding]);
    
    cell.selectAll("text")
      .data(data)
      .transition()
      .duration(2000)
      .attr("x", padding)
      .attr("y", padding)
      .attr("dy", ".71em")
      .text(function(d) {return p.x; });  

    cell.selectAll(".bar")
      .data(data)
      .transition()
      .duration(1000)
      .attr("class", "bar")
      .attr("x", function(d,i) {return 1.5*barsize + (i*3*barsize/2);})
      .attr("width", barsize)
      .attr("y", function(d) { return y(d[p.x]); })
      .attr("height", function(d) {return size - padding/2 - y(d[p.x]); });
}

function orderTraits(desired_traits) {
  var tempTraits = [];
  desired_traits.forEach(function(dt) {
          subTrait=traits.filter(function(d) {return dt.indexOf(d.split("_")[0])!==-1 })
          tempTraits = tempTraits.concat(subTrait)
    });
  traits = tempTraits;
}
