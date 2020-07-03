
//create graphic space with given dimensions
var margin = {top: 40, right: 250, bottom: 150, left: 100},
    width = 1060 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;
//create svg objcet instance to draw
console.log(d3.select("body"));
var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//%Y is a year with the centuary in front ex: 1998
//Code used from MultiLineV4 code given
var parseTime = d3.timeParse("%Y");

//Code used from MultiLineV4 code given
//The x axis is scaled as a function of time whose domain/ranges take in a Date Object.
//The y axis is scaled linearlys, which means it uses a basic linear model for the input values. It it most common for line grpahs. 
//z is a special scale used for determining colors for a domain of data. 
//From the d3 documentaion, scale Ordinals domain must be strings or numbers and not objects.
//In this case, the domain will become the Country Names and the range will become the range of colors
//given by 'schemeCategory10' which returns an array of 10 colors
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);


var line = d3.line() //creates a line that follows some set of points
    .curve(d3.curveBasis) //defualt 'curve' simply connects the points using staight line segments
                          //curveBasis interpolates the data from one point to the next so that is creates a curve to the next point
    .x(function(d) { return x(d.Year); }) //the x values are the Year of data
    .y(function(d) { return y(d.Val); }); //the y values is the actual BTU per Millions values


//all grid related code taken from https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
//provided by professor
// gridlines in x axis function
//uses the bottom x axis with 5 ticks(the grid lines) to create vertical lines
function make_x_gridlines() {		
    return d3.axisBottom(x)
        .ticks(5)
}

// gridlines in y axis function
//uses y axis with 5 ticks(grid lines) to create horizontal lines
function make_y_gridlines() {		
    return d3.axisLeft(y)
        .ticks(5)
}

//read in data as it is so can i get that superbonus point
d3.csv("EPCSmallMillionBTU.csv").then(function(data) {

      //Array.filter takes in a function that can filter the array elements and return
      //a new filtered array
      //BRICS is an array containing only elements whose 'Country Name' fields are those below
      var BRICS = data.filter(function(d){
          return d["Country Name"] == "Bangladesh"  ||
                 d["Country Name"] == "Russia" ||
                 d["Country Name"] == "India" ||
                 d["Country Name"] == "China" ||
                 d["Country Name"] == "South Africa" ||
                 d["Country Name"] == "United States";
      });
    //Returns array of columns whose header is 2000 to 2014
    //.getFullYear() returns the year as an integer so i can make a easy comparison.
    var yearFilter = data.columns.slice(1).filter(function(d) {
        if(parseTime(d).getFullYear() > 1999 && parseTime(d).getFullYear() < 2015){
            return d;
        }
    });
    //Array of BRICS data from 2000 to 2014
    //parseTime is used to read the years as strings and convert them to Date objects
    //+d[id] looks up the corresponding data for that specific year, where id is the year
    //the + is necessary to convert the values from strings to actual numbers
    var Countries = BRICS.map(function(d) {
        return {
            Name: d["Country Name"], //store country name
            values: yearFilter.map(function (id) { //store the year and that years data for that country.
                return {Year: parseTime(id)  , Val: +d[id]}; //only looks at data for 2000 to 2014 from filter
            })
        
        };
        
    });
    console.log(Countries); //prints final array of data i use to plot on graph
    console.log(yearFilter); //prints array of headers of columns for 2000 to 2014
    console.log(BRICS); // prints array of all data associated with each BRICS country
    
    //this is more so a result of not being completely familiar with js syntax and i could not
    //figure out how to get an object of an object
    //i tried to use the method in multiLineV4 but here 'dom' returns 2 arrays,
    //here dom[0] contains the actual min/max i still have to figure out why this is
    var dom = d3.extent(Countries, function(c) {return d3.extent(c.values, function (d) {return d.Year;} ); });
    console.log(dom); // prints array of arrays.
    //x domain covers Years 2000 - 2014 which is scaled from out time scale function from earlier
    x.domain(dom[0]);
    //y domain cover all values for all years, so the min is the smallest value of any country for any year
    //and the max is the max value for any country of any year
    //.nice() lets the first and last tick end on rounded values. before my first and last ticks did not have any valeus assoicated with them
    y.domain([
        d3.min(Countries, function (d) { return d3.min(d.values, function (d2) { return d2.Val; });}),
        d3.max(Countries, function (d) { return d3.max(d.values, function (d2) { return d2.Val; });})
    ]).nice();
    //covers the number of 'Country Name' elements, since theres 6, the domain is 6
    z.domain(Countries.map(function(c) { return c.Name; }));
    
    //prints min/max values for y domain
    console.log(d3.min(Countries, function (d) { return d3.min(d.values, function (d2) { return d2.Val; });}));
    console.log(d3.max(Countries, function (d) { return d3.max(d.values, function (d2) { return d2.Val; });}));
    //domain for country names
    //console.log(Countries.map(function(c) { return c.Name; }));
    
  // add the X gridlines
  //starts the lines from the axis and up
  //tick size makes the ticks/grid lines long enough to cover the height of the graphic space
  svg.append("g")			
      .attr("class", "grid")
      .attr("transform", "translate(0," + height + ")")
      .call(make_x_gridlines()
          .tickSize(-height)
          .tickFormat("")
      )

  // add the Y gridlines
  //ticks/line size is set to cover the width of the graphic space
  svg.append("g")			
      .attr("class", "grid")
      .call(make_y_gridlines()
          .tickSize(-width)
          .tickFormat("")
      )
    
  //example code used from MultiLineV4.html
  //we grab our x axis style class from our css file
  //this is used to omit the x axis line but keep the tick marks
  //we then set it to be drawn at the bottom of the graphic space
  //then we call to draw it
  //then we add the label at the end of where the x axis line would be with the label "(Year)"
  svg.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
    .append("text")
      .attr("y", 15)
      .attr("x", width+40)
      .attr("fill", "#000")
      .style("font", "12px sans-serif")
      .text("(Year)");
  //since there is no css style class associated with the y-axis it will be default
  //also by default the y axis starts to the left so we can just call to draw it
  //then with create a new text object for the y-axis label where we rotate it to the side and 
  //move it to the left-center of the graphic space using the x and y attributes
  svg.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y))
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left/2)
      .attr("x", 0 - (height - margin.top - margin.bottom)/2)
      /*.attr("dy", "0.71em")*/
      .attr("fill", "#000")
      .style("font", "16px sans-serif")
      .text("Million BTUs Per Person");
  //My methods here were referenced by the MultilineV4.html file as well
  //here i create a new country svg object
  //the data assigned to this object comes from my Countries array
  //the data is assigned to all Country svg objects
 
  var Country = svg.selectAll(".country")
    .data(Countries)
    .enter().append("g");
  //I created an svg object for the lines/curves to be drawn using the 'path' field of the Country svg object
  //"d" defines the successive coordinates of the points through which the path has to go
  //in this case those points are given by our line function from earlier whose input is Countries.values
  //Countries.values contain the Year and Value fields which are used in the actual line function
  //the style is changed so that the color is given by our color scale from earlier, so each countries line
  //gets their own color
  var path = Country.append("path")
      .attr("class", "line")
      .attr("id", function(d) {
          console.log(d.Name);
          if(d.Name == "United States"){
              return "United_States";
          }
          else if(d.Name == "South Africa"){
              return "South_Africa";
          }
          else{
                return d.Name;   
          }
          
      })
      .attr("d", function(d) { return line(d.values); })
      .style("stroke", function(d) { return z(d.Name); });
  
  //code taken from http://bl.ocks.org/methodofaction/4063326, animating d3 path
  //first get the relative length of the line drawn
  var totalLength = path.node().getTotalLength();
    //console.log(path.node());
  //from what i read dash array is drawing small segments/dashes to form a line,
    //in this case we want the dash to be the whole line
    //dash offset is where the dash would start being drawn from
    //duration is simply how long the animition takes
    //.ease allows you to determine the emphasis of the which parts of the line are animitated
    //more slowly/faster based on the point of the line at a specific time and the ease function
    //in this case the easeQuad function applies a quadratic function where the smaller x values
    //are slower in the animation and it gets faster as x grows
    path
      .attr("stroke-dasharray", totalLength+4 + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
        .duration(3000)
        .ease(d3.easeQuad)
        .attr("stroke-dashoffset", 0);
    
    var russia = d3.select("#Russia");
    var cNames = ["United_States", "Russia", "South_Africa", "China", "India", "Bangladesh"];
    var buttons = ["btn1", "btn2", "btn3", "btn4", "btn5", "btn6"];
    var bools = [0,0,0, 0,0,0]
    console.log(buttons);
    svg.append("text")
        .attr("x", width+100)
        .attr("y", 0)
        .text("On/Off Buttons");
    
    var Btn1 = svg.append('rect')
        .attr("id", "btn1")
        .attr("width", 60)
        .attr("height", 30)
        .attr("x", width + 100)
        .attr("y", 30)
        .attr("stroke-width", 2)
        .attr("stroke", "#000")
        .attr("fill", z("United States"))
        .on("click", clicked);
    
    var Btn2 = svg.append('rect')
        .attr("id", "btn2")
        .attr("width", 60)
        .attr("height", 30)
        .attr("x", width + 100)
        .attr("y", 70)
        .attr("stroke-width", 2)
        .attr("stroke", "#000")
        .attr("fill", z("Russia"))
        .on("click", clicked);
    
    var Btn3 = svg.append('rect')
        .attr("id", "btn3")
        .attr("width", 60)
        .attr("height", 30)
        .attr("x", width + 100)
        .attr("y", 110)
        .attr("stroke-width", 2)
        .attr("stroke", "#000")
        .attr("fill", z("South Africa"))
        .on("click", clicked);
    
    var Btn4 = svg.append('rect')
        .attr("id", "btn4")
        .attr("width", 60)
        .attr("height", 30)
        .attr("x", width + 100)
        .attr("y", 150)
        .attr("stroke-width", 2)
        .attr("stroke", "#000")
        .attr("fill", z("China"))
        .on("click", clicked);
    
    var Btn5 = svg.append('rect')
        .attr("id", "btn5")
        .attr("width", 60)
        .attr("height", 30)
        .attr("x", width + 100)
        .attr("y", 190)
        .attr("stroke-width", 2)
        .attr("stroke", "#000")
        .attr("fill", z("India"))
        .on("click", clicked);
    
    var Btn6 = svg.append('rect')
        .attr("id", "btn6")
        .attr("width", 60)
        .attr("height", 30)
        .attr("x", width + 100)
        .attr("y", 230)
        .attr("stroke-width", 2)
        .attr("stroke", "#000")
        .attr("fill", z("Bangladesh"))
        .on("click", clicked);
    
    function clicked(){
        var id = this.id;
        var index = buttons.indexOf(id);
        
        if(bools[index] == 0){
        //console.log(this.id.toString());
        var cName = cNames[index];
        d3.select('#'+cName+'TXT').transition()
            .duration(3000)
            .ease(d3.easeQuad)
        .style("opacity", 0);
        d3.select('#'+id).attr("stroke-opacity", 0);
        
        var country = d3.select("#"+cName)
        country.transition()
            .duration(3000)
            .ease(d3.easeQuad)
            .attr("stroke-dashoffset", totalLength);
        console.log(cName)
        console.log(country);
        console.log(country.selectAll("text"));
        bools[index] = 1;
        }
        else if(bools[index] == 1){
            d3.select('#'+id).attr("stroke-opacity", 1);
            var cName = cNames[index];
            var country = d3.select("#"+cName)
            d3.select('#'+cName+'TXT').transition()
                .duration(6000)
                .ease(d3.easeQuad)
            .style("opacity", 1);
            country.attr("stroke-dasharray", totalLength+4 + " " + totalLength)
                .attr("stroke-dashoffset", totalLength)
                .transition()
                    .duration(3000)
                    .ease(d3.easeQuad)
                    .attr("stroke-dashoffset", 0);
            bools[index] = 0;
            console.log("clicked on")
        }
    }
    
//    svg.on("click", func);
//    function func(){
//        russia.transition()
//        .duration(3000)
//        .ease(d3.easeQuad)
//        .attr("stroke-dashoffset", totalLength);
//        console.log(russia.node().getTotalLength());
//    }
    
    console.log(russia);
      //.style("stroke", function(d) { return z(d.id); });
    //shows country name next to respective line
    //uses Countries data. from what i read .datum and .data do the same thing but have different syntax
    //creates a new temporary array of objects with fields 'id' and 'value' where value stores
    //all Years/ values for that year
    //we move the text position to the x scaled value of that year
    //and the y value of the y scaled value for that years data
    //we move the label 3 units to the right since it is touching the line and looks bad
    //finally we write the text
   Country.append("text")
      .datum(function(d) { return {id: d.Name, value: d.values[d.values.length - 1]}; })
      .attr("id", function(d) {
        if(d.id == "United States"){
            return "United_States"+"TXT";
        }
        else if(d.id == "South Africa"){
            return "South_Africa"+"TXT";
        }
        return d.id+"TXT"; 
   
        })
      .attr("transform", function(d) { return "translate(" + x(d.value.Year) + "," + y(d.value.Val) + ")"; })
      .attr("x", 3)
      .attr("dy", "0.35em")
      .style("font", "10px sans-serif")
      .style("opacity", 0) //at the start of the line being drawn you cant see country label
      .transition()
        .duration(6000)
        .ease(d3.easeQuad)
      .style("opacity", 1)//as the line is drawn the label becomes more visible until it is fully visible
      
      .text(function(d) { console.log(d.id); return d.id; }); //text shown to the right of line is logged on console
//    svg.selectAll('.countrytxt')
//        .data(cNames)
//        .enter().append("text")
//        .attr("x", 20)
//        .text(function(d){ return d.Name });
    console.log(Country);
    //Country.selectAll("text").text("kk");
    var b = document.getElementById("RussiaTXT");
    
    //b.innerHTML = "kk";
    console.log(b);
    //Country.select("#RussiaTXT").inner = "kk";
    console.log(d3.select("#RussiaTXT"));
    /////////
   
    
    
});
