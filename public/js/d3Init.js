$(document).ready(function() {

    var q = d3.queue();
    q.defer(d3.json, "http://localhost:5000/api/aggregated")
    .await(function(error, dataset) {
        //Data Headers
        //agency: data["Agency Name"],
        //avgCostVar: data["Avg. Cost Variance(%)"],
        //avgScheduleVar: data["Avg. Scedule Variance(%)"],
        //avgCost: data["Avg. Project Cost ($ M)"],
        //totalProjects: data["Projects Number"],
        //avgLifecycleCost: data["Avg. Lifecycle Cost ($ M)"]
        
        if(error) {
            console.log(error);
        }

        var width = 1600;
        var height = 600;
        var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
        }
        var colour = d3.scaleLinear().domain([0, 50, 100]).range([d3.rgb("#F5B7B1"), d3.rgb("#EC7063"), d3.rgb("#CB4335")])
        var svg = d3.select('article').append('svg').attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom).append("g")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

        var x = d3.scaleLinear().domain([-55, 10]).range([0, width]);
        var y = d3.scaleLinear().domain([-50, 15]).range([height, 0]);
        var point = svg.selectAll(".point").data(dataset).enter();
        point.append("circle").attr("class", "point")
        .attr("cy", function(d) {
            return y(d["Avg. Cost Variance(%)"]);
        }).attr("cx", function(d) {
            return x(d["Avg. Scedule Variance(%)"]);
        }).attr("r", function(d) {
            return Math.sqrt(d["Avg. Project Cost ($ M)"]/Math.PI)*10;
        }).attr("stroke", function(d) {
            return colour(d["Projects Number"]);
        }).attr("fill", function(d) {
            return colour(d["Projects Number"]);
        }).attr("opacity", 0.7)
        // point.append("text").text(function(d) {
        //     return d["Agency Name"];
        // }).attr("dx", function(d) {
        //     return x(d["Avg. Scedule Variance(%)"]);
        // }).attr("dy", function(d) {
        //     return y(d["Avg. Cost Variance(%)"]);
        // })
        // .attr("text-anchor", "middle")
        // .attr('transform', function(d) {
        //     return 'translate('+ (-d["Avg. Project Cost ($ M)"]/2) +', 0)'
        // });
        svg.append("g").attr("transform", "translate(0, "+ y(0) +")")
        .call(d3.axisBottom(x));

        svg.append("g").attr("transform", "translate("+ x(0) +", 0)").call(d3.axisLeft(y));//.attr("transform", "translate("+ (width)/2 +", 0)")

    });    
 
});

