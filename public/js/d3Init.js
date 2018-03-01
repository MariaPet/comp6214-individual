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

function redrawSVG(dataset) {
    //Data Headers
    //agency: data["Agency Name"],
    //avgCostVar: data["Avg. Cost Variance(%)"],
    //avgScheduleVar: data["Avg. Scedule Variance(%)"],
    //avgCost: data["Avg. Project Cost ($ M)"],
    //totalProjects: data["Projects Number"],
    //avgLifecycleCost: data["Avg. Lifecycle Cost ($ M)"]

    d3.selectAll("svg").remove();
    d3.select(".tooltip").remove();

    var colour = d3.scaleLinear().domain([0, 10, 20]).range([d3.rgb("#dd99ff"), d3.rgb("#b31aff"), d3.rgb("#660099")]);
    var borderColour = d3.scaleLinear().domain([0, 10, 20]).range([d3.rgb("#d580ff"), d3.rgb("#aa00ff"), d3.rgb("#550080")]);
    

    var tooltipScaleWidth = 120;
    var tooltipScaleHeight = 20;
    var tooltipPadding = 5;
    var maxCost = d3.max(dataset, function(d) { return d["Avg. Project Cost ($ M)"]; } );
    var minCost = d3.min(dataset, function(d) { return d["Avg. Project Cost ($ M)"]; } );
    // var costScale = d3.scaleLinear().domain([minCost, maxCost]).range([0, tooltipWidth]);
    //Tooltip div
    var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
    
    tooltip.append("h3").attr("class", "tooltip-title")
    var tooltipScale = tooltip.append("div").attr("class", "tooltip-scale")
    tooltipScale.append('span').attr('id', 'min-cost').html(parseFloat(minCost).toFixed(2));
    
    var tooltipSvg = tooltipScale.append('svg').attr('class', 'tooltip-metrics')
    .attr('width', (tooltipScaleWidth)).attr('height', (tooltipScaleHeight + 2*tooltipPadding))

    var svgDefs = tooltipSvg.append('defs');
    var mainGradient = svgDefs.append('linearGradient')
                .attr('id', 'mainGradient');

    // Create the stops of the main gradient. Each stop will be assigned
    // a class to style the stop using CSS.
    mainGradient.append('stop')
        .attr('offset', '0')
        .attr('stop-color', "#dd99ff");
    mainGradient.append('stop')
        .attr('offset', '0.5')
        .attr('stop-color', "#b31aff");
    mainGradient.append('stop')
        .attr('offset', '1')
        .attr('stop-color', "#660099");
    
    // Use the gradient to set the shape fill, via CSS.
    tooltipSvg.append('rect')
        .classed('filled', true)
        .attr('x', 0)
        .attr('y', tooltipPadding)
        .attr('width', tooltipScaleWidth)
        .attr('height', tooltipScaleHeight);

    tooltipSvg.append('rect')
        .attr('id', 'cost-index')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', 5)
        .attr('height', (tooltipScaleHeight + 2*tooltipPadding))
        .attr('fill', 'black')

    tooltipScale.append('span').attr('id', 'max-cost').html(parseFloat(maxCost).toFixed(2));;
    
    var width = 0.8 * window.innerWidth;
    var height = 0.8 * window.innerHeight;
    var margin = {
        top: 30,
        right: 30,
        bottom: 30,
        left: 30
    }

    var svg = d3.select('body').append('svg').attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom).append("g")
    .attr('transform', 'translate('+margin.left+','+margin.top+')');

    var x = d3.scaleLinear().domain([-58, 10]).range([0, width]);
    var y = d3.scaleLinear().domain([-50, 15]).range([height, 0]);
    var point = svg.selectAll(".point").data(dataset).enter().append("g");
    
    //Group events
    d3.selection.prototype.moveToFront = function() {
        return this.each(function() {
            this.parentNode.appendChild(this);
        })
    }
    point.on('mouseover', function(d) {
        d3.select(this).moveToFront();
    })

    //Circles
    point.append("circle").attr("class", "point")
    .attr("cy", function(d) {
        return y(d["Avg. Cost Variance(%)"]);
    }).attr("cx", function(d) {
        return x(d["Avg. Scedule Variance(%)"]);
    }).attr("r", function(d) {
        return Math.sqrt(d["Projects Number"]/Math.PI) * 5;
    }).attr("stroke", function(d) {
        return borderColour(d["Avg. Project Cost ($ M)"]);
    })
    .attr("stroke-width", 5)
    .attr("fill", function(d) {
        console.log(d["Avg. Project Cost ($ M)"]);
        return colour(d["Avg. Project Cost ($ M)"]);
    }).attr("opacity", 0.8)
    .on('mouseover', function(d) {
        // dS3.select(this.parentNode)
        d3.select(this).attr('r', function(d) {
            return Math.sqrt(d["Projects Number"]/Math.PI) * 5 * 1.2;
        }).attr("opacity", 1);
        tooltip.transition()
            .duration(200)
            .style("opacity", 1);
        var pointRect = d3.select(this).node().getBoundingClientRect();
        tooltip.style("left", (pointRect.right) + "px")
            .style("top", (pointRect.top) + "px")

        //transform project cost index
        var dCost = ((maxCost - minCost) - (maxCost - d["Avg. Project Cost ($ M)"])) / (maxCost - minCost);
        var indexTransform = tooltipScaleWidth * dCost;
        d3.select("#cost-index").attr('transform', 'translate('+indexTransform+',0)');

        d3.select(".tooltip-title").html(d["Agency Name"]);
            // .html(d["Agency Name"] + "<br/>Number of Projects: " + d["Projects Number"]);
    })
    .on("mouseout", function(d) {
        d3.select(this).attr('r', function(d) {
            return Math.sqrt(d["Projects Number"]/Math.PI) * 5;
        }).attr("opacity", 0.8);
        tooltip.transition()
            .duration(200)
            .style("opacity", 0);
    });

    //Add circle labels
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
    .attr("font-size", "12")
    .attr("class", "point-label");
    
    
    // svg.selectAll(".circle-label").call(wrap, 50)
    
    //Axis and labels
    svg.append("g").attr("class", "x-axis").attr("transform", "translate(0, "+ y(0) +")")
    .call(d3.axisBottom(x));
    
    svg.append("text")
    .attr('class', 'x-axis-label')            
    .attr("transform", "translate(" + x(0) + " ," + -10 + ")")
    .style("text-anchor", "middle")
    .text("Avg. Scedule Variance(%)");

    svg.append("g").attr("class", "y-axis").attr("transform", "translate("+ x(0) +", 0)").call(d3.axisLeft(y));

    svg.append("text")
    .attr('class', 'y-axis-label')             
    .attr("transform", "translate("+ (width + margin.left/2) + "," + y(0) + ")rotate(90)")
    .style("text-anchor", "middle")
    .text("Avg. Cost Variance(%)");
}

$(document).ready(function() {

    var q = d3.queue();
    var render = q.defer(d3.json, "http://localhost:5000/api/aggregated")
    .await(function(error, dataset) {
        if(error) {
            console.log(error);
        }

        redrawSVG(dataset);
        
        $(window).resize( function() {
            redrawSVG(dataset);
        });
    }); 
});

