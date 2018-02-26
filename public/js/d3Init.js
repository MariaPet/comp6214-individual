function wrap(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1, //ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")) || 0,
            // dx = parseFloat(text.attr("dx")),
            tspan = text.text(null).append('tspan').attr("x", x).attr("y", y).attr("dy", dy + "em");
        while(word = words.pop()) {
            line.push(word);
            tspan.text(line.join(""));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}

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

        var width = 0.8 * window.innerWidth;
        var height = 0.8 * window.innerHeight;
        var margin = {
            top: 30,
            right: 30,
            bottom: 30,
            left: 30
        }
        var colour = d3.scaleLinear().domain([0, 50, 100]).range([d3.rgb("#eeccff"), d3.rgb("#c44dff"), d3.rgb("#8800cc")]);
        var borderColour = d3.scaleLinear().domain([0, 50, 100]).range([d3.rgb("#e6b3ff"), d3.rgb("#bb33ff"), d3.rgb("#7700b3")]);
        
        //Tooltip div
        var tooltip = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

        var svg = d3.select('body').append('svg').attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom).append("g")
        .attr('transform', 'translate('+margin.left+','+margin.top+')');

        var x = d3.scaleLinear().domain([-58, 6]).range([0, width]);
        var y = d3.scaleLinear().domain([-50, 15]).range([height, 0]);
        var point = svg.selectAll(".point").data(dataset).enter();
        
        //Circles
        point.append("circle").attr("class", "point")
        .attr("cy", function(d) {
            return y(d["Avg. Cost Variance(%)"]);
        }).attr("cx", function(d) {
            return x(d["Avg. Scedule Variance(%)"]);
        }).attr("r", function(d) {
            return Math.sqrt(d["Projects Number"]/Math.PI) * 5;
        }).attr("stroke", function(d) {
            return borderColour(d["Projects Number"]);
        })
        .attr("stroke-width", 5)
        .attr("fill", function(d) {
            return colour(d["Projects Number"]);
        }).attr("opacity", 0.7)
        .on('mouseover', function(d) {
            d3.select(this).attr('r', function(d) {
                return Math.sqrt(d["Projects Number"]/Math.PI) * 5 * 1.2;
            }).attr("opacity", 1);
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html("Agency Name: " + d["Agency Name"] + "<br/>Number of Projects: " + d["Projects Number"])
                .style("left", (d3.select(this).attr("cx")) + "px")
                .style("top", (d3.select(this).attr("cy")) + "px");
        })
        // })
        .on("mouseout", function(d) {
            d3.select(this).attr('r', function(d) {
                return Math.sqrt(d["Projects Number"]/Math.PI) * 5;
            }).attr("opacity", 0.7);
            tooltip.transition()
                .duration(200)
                .style("opacity", 0);
        });
        
        //Circle labels
        point.append("text").text(function(d) {
            switch(d["Agency Name"]) {
                case "Department of Transportation":
                return "DOT";
                case "Department of Labor":
                return "DOL";
                case "Department of Agriculture":
                return "USDA";
                case "Department of Veterans Affairs":
                return "VA";
                case "Department of Housing and Urban Development":
                return "HUD";
                case "Department of Commerce":
                return "DOC";
                case "Department of the Interior":
                return "DOI";
                case "Department of Homeland Security":
                return "DHS";
                case "Department of Health and Human Services":
                return "HHS";
                case "Department of the Treasury":
                return "TRE";
                case "Department of Defense":
                return "DOD";
                case "Department of Justice":
                return "DOJ";
                case "Department of State":
                return "DOS";
                case "Department of Education":
                return "ED";
                case "Department of Energy":
                return "DOE";
                default:
                return d["Agency Name"];
            }
        }).attr("x", function(d) {
            return x(d["Avg. Scedule Variance(%)"]);
        }).attr("y", function(d) {
            return y(d["Avg. Cost Variance(%)"]);
        })
        .attr("dominant-baseline", "central")
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .attr("class", "point-label")
        
        svg.selectAll(".circle-label").call(wrap, 50)
        
        //Axis and labels
        svg.append("g").attr("transform", "translate(0, "+ y(0) +")")
        .call(d3.axisBottom(x));
        
        svg.append("text")             
        .attr("transform", "translate(" + x(0) + " ," + -10 + ")")
        .style("text-anchor", "middle")
        .text("Avg. Scedule Variance(%)");

        svg.append("g").attr("transform", "translate("+ x(0) +", 0)").call(d3.axisLeft(y));

        svg.append("text")             
        .attr("transform", "translate("+ (width + margin.left/2) + "," + y(0) + ")rotate(90)")
        .style("text-anchor", "middle")
        .text("Avg. Cost Variance(%)");
    });    
 
});

