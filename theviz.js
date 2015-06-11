//wrapping function - dsd
function runViz() {
//window.onload=function(){
$(document).ready(function(){ //jquery ~equivalent for window.onload//

var width = 350;
var height = 350;
var radius = Math.min(width, height) / 3.3;
var outerradius = Math.min(width, height) / 2;
var minimumradiusadjustment = 50;
var innerradius = 25;
var numTicks = 5;
var sdat = new Array();
var main = d3.select('#maincontainer');
var countryselection = [{name:"China", id: "CHN"},{name: "India", id: "IND"}, {name: "United States of America", id: "USA"}]; 
var url = "";

var issue = {id: "EH_HealthImpacts", name: "Health Impacts", color: "#ff9600"};
var indicator = {name: "Child Mortality", id: "CHMORT", units: "Probability", shortunits: ""};

var roseCharts = [];

var lineChart;

var sparkChart;
var sparkCountry ="CHN";

var map;
var max_val = 1;

runCharts();

// JSON for select Boxes 
d3.json("/country_list.json", function(error, json) { 
    var selecthtml = "";
    var active = 0;
    $.each(json, function(name, iso) {
        selecthtml +="<option value=\"" + iso + "\">" + name + "</option>";
    }); 

    $("#clist").append("<select class='clist' multiple id='edit-select-countries'>"+selecthtml+"</select>");

    $("#edit-select-countries").select2( {
    	maximumSelectionLength: 3,
    	placeholder: "Start Typing..."
    });
    
    // Event for checkbox change
    $("#submit_button").click(function() {
    	var countryselection_id = $('#edit-select-countries').select2("val");
    	var countryselection_name = $('#edit-select-countries').select2("data");
    	console.log(countryselection_name);
    	var new_countryselection = [];
    	$.each(countryselection_id, function(index, element) {
    		new_countryselection[index] = {"name": countryselection_name[index], "id": countryselection_id[index]};
    	})
    	console.log(new_countryselection);
    	countryselection = (new_countryselection == null) ? countryselection : new_countryselection;
    	runCharts();
	});

});


d3.json("/indicator_list.json", function(error, json) {
	var indicators = json;
	indicator = indicators[0];

	$("#submit_button").click(function() {
		var selected_val = $("#select_ind").val();
		var new_indicator = indicators[selected_val];
		console.log(new_indicator);
		indicator = (new_indicator == null) ? indicator : new_indicator;
		runCharts();
	});
});

d3.json("/issue_list.json", function(error, json) {
	var issues = json;
	issue = issues[0];

	$("#submit_button").click(function() {
		//var selected_id = $('#ind')[0].id;
		var selected_id = "#" + indicator.id;
		console.log(selected_id);
		//window.alert(selected_id);
		var group_num = $(selected_id).parent().attr("value"); //not working yet
		var new_issue = issues[group_num];
		issue = (new_issue == null) ? issue : new_issue;
		runCharts();
	});
});

// Issue list setup
$.each(issueColors, function(key, d) {
    d3.select("#leg")
    .append("div").attr("id", key).attr("class", "leg").style("background", issueColors[key])
    .append("div").attr("class", "list").html(cat[key].title);    
});

// General arcs and setup
arc = d3.svg.arc()
    .outerRadius(function (d) {
        if(d.data.value*1<0) d.data.value = 0;
        return radius * (+d.data.value/100) + minimumradiusadjustment;
    })
    .innerRadius(innerradius);

pie = d3.layout.pie()
    .sort(null)
    .value(function (d) {
    return 1;
});

function clearTable() {
	var header_html = "<tr><th>Rose Chart</th><th>Country</th><th>2014 EPI Score</th><th>2014 EPI Ranking</th><th>2014 " + indicator.name + " Score</th><th>2014 " + issue.name + " Score</th></tr>";
	$("#chartTable").html(header_html);
}
function addTable(i, country) {
	var table_html = "<tr><td><div class='rose-charts' id='table" + i + "'</div></td><td>" + country + "</td><td id ='epi_score" + i + "'>EPI Score</td><td id ='epi_rank" + i + "'>EPI Rank</td><td id ='ind" + i + "'>Indicator Score</td><td>Policy Issue Score</td></tr>";
	$("#chartTable").append(table_html);
}

function runCharts() {
	clearTable();
	//drawRichMap();
	//testMap();
	//drawMap();
	//drawSpark(sparkCountry);
	initLine();
	$.each(countryselection, function(i, d) {
    	drawLine(i, d.id);
    	addTable(i, d.name);
    	//drawGauge(i, d);
    	drawRose(i, d.name);
    });
}

/*function drawGauge(key, country) {
	//window.alert(key);
	//window.alert(country);
	html_id = "#table" + key;
	d3.json("http://epi.yale.edu/api/raw_data.json?country=" + country + "&indicator=" + subindicator.id, function(error, json) {
		var data = json.indicator_trend;
		var dat = [data[22].value];
		//window.alert(dat);

		$(html_id).highcharts({
			chart: {
				type: 'gauge',
				plotBackgroundColor: null,
				plotBackgroundImage: null,
				plotBorderWidth: 0,
				plotShadow: false,
				backgroundColor: null,
				margin: [0,0,0,0],
				width: 300
			},
			title: {
				text: null //subindicator.name + ', 2012'
			},
			pane: {
				/*size:[30],
        		startAngle: -90,
        		center: ['50%', '90%'],
        		endAngle: 90, //
				startAngle: -150,
				endAngle: 150,
				center: ['50%', '50%'],
				background: [{
					backgroundColor: {
						linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						stops: [
						[0, '#FFF'],
						[1, '#333']
						]
					},
					borderWidth: 0,
					outerRadius: '109%'
				}, {
					backgroundColor: {
						linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
						stops: [
						[0, '#333'],
						[1, '#FFF']
						]
					},
					borderWidth: 1,
					outerRadius: '107%'
				}, {
                // default background
            }, {
            	backgroundColor: '#DDD',
            	borderWidth: 0,
            	outerRadius: '105%',
            	innerRadius: '103%'
            	}]	
        	},
        	// the value axis
        	yAxis: {
        		min: 0,
        		max: max_val,

        		minorTickInterval: 'auto',
        		minorTickWidth: 1,
        		minorTickLength: 10,
        		minorTickPosition: 'inside',
        		minorTickColor: '#666',

        		tickPixelInterval: 30,
        		tickWidth: 2,
        		tickPosition: 'inside',
        		tickLength: 10,
        		tickColor: '#666',
        		labels: {
        			step: 2,
        			rotation: 'auto'
        		},
        		title: {
        			text: subindicator.shortunits
        		},
        		plotBands: [{
        			from: 0,
        			to: (max_val / 2),
               	 color: '#55BF3B' // green
            	}, {
            		from: (max_val / 2),
            		to: (max_val / 6) * 5,
               	 	color: '#DDDF0D' // yellow
            	}, {
            		from: (max_val / 6) * 5,
            		to: max_val,
                	color: '#DF5353' // red
            	}]
        	},

        	series: [{
        		name: indicator.name,
        		data: dat,
        		tooltip: {
        			valueSuffix: indicator.shortunits
        		}
        	}]
    	});
	});
}

/*function newGauge(data){
	var empty = {
		title : {
            text: indicator.name
        },
        mapNavigation: {
            enabled: true,
        },
		chart: {
            renderTo: 'maincontainer',
            events: {
                load: function () {
                    if (this.options.chart.forExport) {
 						this.renderer.image('/logo.png', 0, 0, 100, 100).add();
                    	this.redraw();
                    }
                }
            }
        },
    };
    return empty;
}*/

/*function drawRichMap() {

    // For each country, use the latest value for current population
    var data = [];

    // Add lower case codes to the data set for inclusion in the tooltip.pointFormat
    var mapData = Highcharts.geojson(Highcharts.maps['countries/co/co-all']);
    $.each(mapData, function () {
        this.id = this.properties['hc-key']; // for Chart.get()
    });

    // Wrap point.select to get to the total selected points
    Highcharts.wrap(Highcharts.Point.prototype, 'select', function (proceed) {

    	proceed.apply(this, Array.prototype.slice.call(arguments, 1));

    	var points = mapChart.getSelectedPoints();

    /*	if (points.length) {
    		if (points.length === 1) {
    			$('#info h2').html(points[0].name);
    		} else {
    			$('#info h2').html('Comparing countries');

    		}
    		$('#info .subheader').html('<h4>Historical population</h4><small><em>Shift + Click on map to compare countries</em></small>')

    		if (!countryChart) {
    			countryChart = $('#country-chart').highcharts({
    				chart: {
    					height: 250,
    					spacingLeft: 0
    				},
    				credits: {
    					enabled: false
    				},
    				title: {
    					text: null
    				},
    				subtitle: {
    					text: null
    				},
    				xAxis: {
    					tickPixelInterval: 50,
    					crosshair: true
    				},
    				yAxis: {
    					title: null,
    					opposite: true
    				},
    				tooltip: {
    					shared: true
    				},
    				plotOptions: {
    					series: {
    						animation: {
    							duration: 500
    						},
    						marker: {
    							enabled: false
    						},
    						threshold: 0,
    						pointStart: parseInt(categories[0]),
    					}
    				}
    			}).highcharts();
    		}

    		$.each(points, function (i) {
                // Update
                console.log(countries[this.code3].data);
                if (countryChart.series[i]) {
                    /*$.each(countries[this.code3].data, function (pointI, value) {
                            countryChart.series[i].points[pointI].update(value, false);
                        });
    				countryChart.series[i].update({
    					name: this.name,
    					data: countries[this.code3].data,
    					type: points.length > 1 ? 'line' : 'area'
    				}, false);
    			} else {
    				countryChart.addSeries({
    					name: this.name,
    					data: countries[this.code3].data,
    					type: points.length > 1 ? 'line' : 'area'
    				}, false);
    			}
    		}); 
    		while (countryChart.series.length > points.length) {
    			countryChart.series[countryChart.series.length - 1].remove(false);
    		}
    		countryChart.redraw();

    	} else {
    		$('#info h2').html('');
    		$('#info .subheader').html('');
    		if (countryChart) {
    			countryChart = countryChart.destroy();
    		}
    	} //
    }); 
    // Initiate the map chart
    console.log(data, mapData);
    mapChart = $('#map').highcharts('Map', {

    	title: {
    		text: null
    	},

    	subtitle: {
    		text: null //'Source: <a href="http://data.worldbank.org/indicator/SP.POP.TOTL/countries/1W?display=default">The World Bank</a>'
    	},

    	mapNavigation: {
    		enabled: true,
    		buttonOptions: {
    			verticalAlign: 'bottom'
    		}
    	},

    	colorAxis: {
    		type: 'logarithmic',
    		endOnTick: false,
    		startOnTick: false,
    		min: 1000
    	},

    	tooltip: {
    		footerFormat: '<span style="font-size: 10px">(Click for details)</span>'
    	},

    	series: [{
    		data: data,
    		mapData: mapData,
    		joinBy: ['id', 'code3'],
    		name: 'EPI ranking',
    		allowPointSelect: true,
    		cursor: 'pointer',
    		states: {
    			select: {
    				color: '#a4edba',
    				borderColor: 'black',
    				dashStyle: 'shortdot'
    			}
    		}
    	}]
    }).highcharts();
} */

/*function testMap() {
	$.getJSON('//www.highcharts.com/samples/data/jsonp.php?filename=world-population-history.csv&callback=?', function (csv) {

        // Parse the CSV Data
        /*Highcharts.data({
            csv: data,
            switchRowsAndColumns: true,
            parsed: function () {
                console.log(this.columns);
            }
        });//

        // Very simple and case-specific CSV string splitting
        function CSVtoArray(text) {
            return text.replace(/^"/, '')
                .replace(/",$/, '')
                .split('","');
        };

        csv = csv.split(/\n/);

        var countries = {},
            mapChart,
            countryChart,
            numRegex = /^[0-9\.]+$/,
            quoteRegex = /\"/g,
            categories = CSVtoArray(csv[1]).slice(4);

        // Parse the CSV into arrays, one array each country
        $.each(csv.slice(2), function (j, line) {
            var row = CSVtoArray(line),
                data = row.slice(4);

            $.each(data, function (i, val) {
                
                val = val.replace(quoteRegex, '');
                if (numRegex.test(val)) {
                    val = parseInt(val);
                } else if (!val) {
                    val = null;
                }
                data[i] = val;
            });
            countries[row[1]] = {
                name: row[0],
                code3: row[1],
                data: data
            };
        });

        // For each country, use the latest value for current population
        var data = [];
        for (var code3 in countries) {
            var value = null,
                year,
                itemData = countries[code3].data,
                i = itemData.length;

            while (i--) {
                if (typeof itemData[i] === 'number') {
                    value = itemData[i];
                    year = categories[i];
                    break;
                }
            }
            data.push({
                name: countries[code3].name,
                code3: code3,
                value: value,
                year: year
            });
        }
        
        // Add lower case codes to the data set for inclusion in the tooltip.pointFormat
        var mapData = Highcharts.geojson(Highcharts.maps['custom/world']);
        $.each(mapData, function () {
            this.id = this.properties['hc-key']; // for Chart.get()
            this.flag = this.id.replace('UK', 'GB').toLowerCase();
        });

        // Wrap point.select to get to the total selected points
        Highcharts.wrap(Highcharts.Point.prototype, 'select', function (proceed) {

            proceed.apply(this, Array.prototype.slice.call(arguments, 1));

            var points = mapChart.getSelectedPoints();

         /*   if (points.length) {
                if (points.length === 1) {
                    $('#info #flag').attr('class', 'flag ' + points[0].flag);
                    $('#info h2').html(points[0].name);
                } else {
                    $('#info #flag').attr('class', 'flag');
                    $('#info h2').html('Comparing countries');

                }
                $('#info .subheader').html('<h4>Historical population</h4><small><em>Shift + Click on map to compare countries</em></small>')

                if (!countryChart) {
                    countryChart = $('#country-chart').highcharts({
                        chart: {
                            height: 250,
                            spacingLeft: 0
                        },
                        credits: {
                            enabled: false
                        },
                        title: {
                            text: null
                        },
                        subtitle: {
                            text: null
                        },
                        xAxis: {
                            tickPixelInterval: 50,
                            crosshair: true
                        },
                        yAxis: {
                            title: null,
                            opposite: true
                        },
                        tooltip: {
                            shared: true
                        },
                        plotOptions: {
                            series: {
                                animation: {
                                    duration: 500
                                },
                                marker: {
                                    enabled: false
                                },
                                threshold: 0,
                                pointStart: parseInt(categories[0]),
                            }
                        }
                    }).highcharts();
                }

                $.each(points, function (i) {
                    // Update
                    if (countryChart.series[i]) {
                        /*$.each(countries[this.code3].data, function (pointI, value) {
                            countryChart.series[i].points[pointI].update(value, false);
                        });
                        countryChart.series[i].update({
                            name: this.name,
                            data: countries[this.code3].data,
                            type: points.length > 1 ? 'line' : 'area'
                        }, false);
                    } else {
                        countryChart.addSeries({
                            name: this.name,
                            data: countries[this.code3].data,
                            type: points.length > 1 ? 'line' : 'area'
                        }, false);
                    }
                });
                while (countryChart.series.length > points.length) {
                    countryChart.series[countryChart.series.length - 1].remove(false);
                }
                countryChart.redraw();

            } else {
                $('#info #flag').attr('class', '');
                $('#info h2').html('');
                $('#info .subheader').html('');
                if (countryChart) {
                    countryChart = countryChart.destroy();
                }
            }//

            

        }); 
        
        // Initiate the map chart
        mapChart = $('#map').highcharts('Map', {
            
            chart: {
            	plotShadow: true
            }
            title : {
                text : 'Population history by country'
            },

            subtitle: {
                text: 'Source: <a href="http://data.worldbank.org/indicator/SP.POP.TOTL/countries/1W?display=default">The World Bank</a>'
            },

            mapNavigation: {
                enabled: true,
                buttonOptions: {
                    verticalAlign: 'bottom'
                }
            },

            colorAxis: {
                type: 'logarithmic',
                endOnTick: false,
                startOnTick: false,
                min: 50000
            },

            tooltip: {
                footerFormat: '<span style="font-size: 10px">(Click for details)</span>'
            },

            series : [{
                data : data,
                mapData: mapData,
              //  joinBy: ['iso-a3', 'code3'],
                name: 'Current population',
                allowPointSelect: true,
                cursor: 'pointer',
                states: {
                    select: {
                        color: '#a4edba',
                        borderColor: 'black',
                        dashStyle: 'shortdot'
                    }
                }
            }]
        }).highcharts();

        // Pre-select a country
        mapChart.get('us').select();
    });
}*/

function drawMap(){
	var data = [];
	d3.json("/default_map.json", function(error, json) {
		vals = json[0];
		
		var hash = new Object();
		$.each(vals, function (i, obj){
			hash[obj.data.id] = obj.data.indicators[0].value
		});
		
		$.each(Highcharts.maps['custom/world'].features, function (index, feature){
			var iso3 = feature.properties['iso-a3'];
			var val = hash[iso3];
			if (val == "-911" || val == NaN || val == undefined || val == null) val = "0";
			data.push({
				key: feature.properties['hc-key'],
				value: val,
			});
		});
		
		var map = newMap(data);
		//$('#map').highcharts('Map', map);


            // Instantiate chart
            $("#map").highcharts('Map', map);

            //showDataLabels = $("#chkDataLabels").attr('checked');

	  
	});
}

function newMap(data){
	var empty = {
		title : {
            text: issue.name
        },
        mapNavigation: {
            enabled: true,
            buttonOptions: {
                verticalAlign: 'bottom'
            }
        },
        colorAxis: {
			min: 0,
			startOnTick: false,
			stops: [
				//~ [-1, '#FF0000'], // For NAs
				[0, '#FFFFFF'],
				[1, issue.color]
			]
		},
		chart: {
            renderTo: 'map',
            events: {
                load: function () {
                    if (this.options.chart.forExport) {
 						this.renderer.image('/logo.png', 0, 0, 100, 100).add();
                    	this.redraw();
                    }
                }
            }
        },
        series : [{
            data : data,
            mapData: Highcharts.maps['custom/world'],
            joinBy: ['hc-key', 'key'],
            name: issue,
        }]
    };
    return empty;
}

function drawRose(key, country) {

	//url = "iso_codes[]="+country+"&";
	//var div = d3.select("#country" + key);
	
	var chart = roseCharts[key];
	
	//d3.json("/radar_chart.json?years[]=2012&"+url, function(error, json) {
	/*d3.json("/indicator_scores.json", function(error, json) {

		var ind_scores = json[country];
		var selected_ind_score = ind_scores[indicator.name];
		console.log(selected_ind_score);
		var dat = [];

		$("#ind" + key).html(selected_ind_score);

		$.each(ind_scores, function (name, iso) {*/

	d3.json("/epi_data.json", function(error, json) {

		var scores = json[country];
		var epi_score = scores["EPI Score"];
		console.log(epi_score);
		var epi_rank = scores["Rank"];
		console.log(epi_rank);
		var selected_ind_score = scores[indicator.name];
		console.log(selected_ind_score);

		var dat = [];
		//var selected_iss_score = scores[issue.name]; need to fix format of key

		$("#ind" + key).html(selected_ind_score);
		$("#epi_score" + key).html(epi_score);
		$("#epi_rank" + key).html(epi_rank);

		$.each(scores, function (name, iso) {
			var value = parseFloat(iso)
			var y = value;
			
			if (value < 0 || value == "NA")
				return;
			else if (value < 10)
				y = 10;
			
			var col = "#FF0000";
			var idx = 0;
			var ind = "";
			
			// Note that we set index manually, to force
			// the desired order. We can ignore the highcharts error.
			if (name == "Child Mortality"){
				col = "#F5C717";
				idx = 0;
				ind = "Child Mortality";
			}
			else if (name == "Household Air Quality"){
				col = "#F8951D";
				idx = 1;
				ind = "Household Air Quality";
			}
			else if (name == "Air Pollution - Average Exposure to PM2.5"){
				col = "#F8951D";
				idx = 2;
				ind = "Air Pollution";
			}
			else if (name == "Air Pollution - PM2.5 Exceedance"){
				col = "#F8951D";
				idx = 3;
				ind = "Air Pollution";
			}
			else if (name == "Access to Drinking Water"){
				col = "#F36E2B";
				idx = 4;
				ind = "Access to Drinking Water";
			}
			else if (name == "Access to Sanitation"){
				col = "#F36E2B";
				idx = 5;
				ind = "Access to Sanitation";
			}
			else if (name == "Wastewater Treatment"){
				col = "#3175B9";
				idx = 6;
				ind = "Wastewater Treatment";
			}
			else if (name == "Agricultural Subsidies"){
				col = "#008C8C";
				idx = 7;
				ind = "Agricultural Subsidies";
			}
			else if (name == "Change in Forest Cover"){
				col = "#2DB45D";
				idx = 8;
				ind = "Change in Forest Cover";
			}
			else if (name == "Coastal Shelf Fishing Pressure"){
				col = "#3CBCA3";
				idx = 9;
				ind = "Coastal Shelf Fishing Pressure";
			}
			else if (name == "Fish Stocks"){
				col = "#3CBCA3";
				idx = 10;
				ind = "Fish Stocks";
			}
			else if (name == "Terrestrial Protected Areas (National Biome Weights)"){
				col = "#0B9BCC";
				idx = 11;
				ind = "Terrestrial Protected Areas";
			}
			else if (name == "Terrestrial Protected Areas (Global Biome Weights)"){
				col = "#0B9BCC";
				idx = 12;
				ind = "Terrestrial Protected Areas";
			}
			else if (name == "Marine Protected Areas"){
				col = "#0B9BCC";
				idx = 13;
				ind = "Marine Protected Areas";
			}
			else if (name == "Critical Habitat Protection"){
				col = "#0B9BCC";
				idx = 13;
				ind = "Critical Habitat Protection";
			}
			else if (name == "Trend in Carbon Intensity"){
				col = "#7D8FC8";
				idx = 14;
				ind = "Trend in Carbon Intensity";
			}
			else if (name == "Change of Trend in Carbon Intensity"){
				col = "#7D8FC8";
				idx = 15;
				ind = "Change of Trend in Carbon Intensity";
			}
			else if (name == "Access to Electricity"){
				col = "#7D8FC8";
				idx = 16;
				ind = "Access to Electricity";
			}
			else if (name == "Trend in CO2 Emissions per kWh"){
				col = "#7D8FC8";
				idx = 17;
				ind = "Trend in CO2 Emissions";
			}
			else {
				return;
			}
			//options.series[0].data.push({name: obj.name, y: y, color: col, realY: value});
			dat.push({name: name, y: y, color: col, realY: value, indic: ind});
		});
		
		var options = emptyRose(key);
		if (chart == undefined){
			chart = new Highcharts.Chart(options);
			roseCharts[key] = chart;
		}
		else if (chart.series[0].data.length != dat.length){
			chart.destroy();
			chart = new Highcharts.Chart(options);
			roseCharts[key] = chart;
		}

		//chart.setTitle({text: country});
		chart.series[0].setData(dat, false);
		chart.redraw();
	});
}

function emptyRose(key){
	var options = {
			chart: {
				polar: true,
				type: 'column',
				renderTo: 'table' + key,
				plotBackgroundColor: null,
				plotBackgroundImage: null,
				backgroundColor: null,
				plotBorderWidth: 1
			},
			series: [{
				type: 'column',
				borderWidth: 2,
				data: []
			}],
			title: {
				text: ''
			},
			pane: {
				startAngle: 0,
				endAngle: 360,
				background: {
					backgroundColor: '#eeeeee'
				}
			},
			legend: {
				reversed: true,
				align: 'right',
				verticalAlign: 'top',
				y: 100,
				layout: 'vertical',
				enabled: false // Disable
			},
			xAxis: {
				categories: [],
				lineWidth: 0,
				tickWidth: 0,
				title: {
					text: ''
				},
				labels: {
					enabled: false
				},
				gridLineWidth: 0,
				minPadding:0,
				maxPadding:0
			},
			yAxis: {
				endOnTick: false,
				lineWidth: 0,
				tickWidth: 0,
				title: {
					text: ''
				},
				labels: {
					enabled: false
				},
				gridLineWidth: 0,
				min: 0,
				max: 100,
			},
			tooltip: {
				formatter: function() {
					// Make indicator format pretty
					return '<b>' + this.point.indic + ':</b> '+ (this.point.realY).toFixed(1);
				}
			},
			credits: {
				enabled: false
			},
			plotOptions: {
				column: {
					pointPadding: 0,
					groupPadding: 0,
				},
				series: {
					pointStart: 0,
				},
			},
			exporting: {
         		enabled: false
			}
		};
	
	return options;
}

function initRoses(){
	for (var x = 0; x<3; x++){
		drawRose(x, countryselection[x]);
	}
}

function initLine(){
	var options = {
		/*chart: {
			type: 'line',
			renderTo: 'lineChart'
		},*/
		chart: {
			type: 'line',
            renderTo: 'lineChart',
            plotShadow: true,
            spacingLeft: 30,
            spacingRight: 50,
            spacingTop: 20,
            spacingBottom: 20,
            events: {
                load: function () {
                	//this.renderer.image('/logo.png', 0, 0, 96, 40).add();
                    if (this.options.chart.forExport) {
                        Highcharts.each(this.series, function (series) {
                           	series.update({
                                dataLabels: {
                                    enabled: true
                                }
                            }, false);
                        });
                       // this.renderer.image('/logo.png', 0, 0, 96, 40).add();
                    	this.redraw();
                    }
                }
            }
        },
		yAxis: {
			min: 0,
			max: 101,
			endOnTick: false,
		},
		series: [],
		title: {
			text: ''
		},
		credits: {
			enabled: false
		},
		tooltip: {
			formatter: function() {
				return this.series.name + '<br> <b>' + this.x + ':</b> ' + this.point.y;
			}
		},
		plotOptions: {
			column: {
				pointPadding: 0,
				groupPadding: 0,
			},
			series: {
				pointStart: 0,
			},
		}
	};
	lineChart = new Highcharts.Chart(options, function(chart) {
		//chart.renderer.image('/logo.png', 0, 0, 96, 40).add();
	});

	
	
	for(var x=0; x<countryselection.length; x++){
		var empty = [];
		for(var year = 2002; year<2013; year++)
			empty.push({x: year, y: 0});
		lineChart.addSeries({name: "empty", data: empty});
		drawLine(x, countryselection[x]);
	}
	
}

function drawLine(key, country){
	console.log(country);
	var indicatorid = (indicator.id == "CO2GDPd2") ? "CO2GDPd1" : indicator.id;
	var x = 0;
    // JSON for line graph
    //"/line_graph.json?indicator=" + indicator.id + "&iso_codes[]=" + country
    d3.json("http://epi.yale.edu/api/raw_data.json?country=" + country + "&indicator=" + indicatorid, function(error, json) {
		//var dat = [];
		
		if (json === undefined){
			window.alert("json undefined");
			for(var year = 2002; year<2013; year++)
				dat.push({x: year, y: -1});
		}
		/*else{
			indicatorData = json.data[0].values; 
			$.map(indicatorData, function(obj, i) {
				dat.push({x: parseInt(obj.year), y: parseInt(obj.value)});
			});
		}
		lineChart.series[key].setData(dat, true);*/

		//copied from spark chart
		/*if (! (sparkChart === undefined))
			sparkChart.destroy();*/
		var data = json.indicator_trend;	
		//sparkCountry = country;
		
		// Trim trailing NA's
		var x = 0;
		while(data[x] != null && data[x].value == "NA") x++;
		data.splice(0, x);
		
		// Trim ending NA's
		x = data.length-1;
		while(x > 0 && data[x].value == "NA") x--;
		data.splice(x+1, data.length);
		
		var dat = [];
		var min = 0.0;
		var max = 0.0;
		$.map(data, function(obj, i) {
			var mark = false;
			if (i == 0 || i == data.length-1) mark = true;
			var val = parseFloat(obj.value);
			if (isNaN(val)) val = null;
			else {
				if (val < min) min = val;
				if (val > max) max = val;
			}
			dat.push({x: parseInt(obj.year), y: val, marker: {enabled: mark}});
		});
	
		var col = "";
		if (key == 0)
			col = "#26CBDA";
		else if (key == 1)
			col = "#FF9600";
		else if (key == 2)
			col = "#12E25C";

		var extremes = lineChart.yAxis[0].getExtremes();
		if (min > extremes.dataMin) min = extremes.dataMin;
		if (max < extremes.dataMax) max = extremes.dataMax;
		max_val = max;

		var range = max - min;

		lineChart.yAxis[0].setExtremes(min, max + range/5);
		//lineChart.options.yAxis[0].title.text = subindicator.name; //saves into exported options??
		//lineChart.yAxis[0].setTitle(subindicator.name);
		lineChart.yAxis[0].update({
                title:{
                    text: indicator.name.toUpperCase()
                }
            });
		lineChart.series[key].setData(dat, true);
		lineChart.series[key].update({name: country, color: col}, true);


	});
}

function drawSpark(country){
	var subindicatorid = (subindicator.id == "CO2GDPd2") ? "CO2GDPd1" : subindicator.id;
	//http://epi.yale.edu/api/raw_data.json?country=MEX&indicator=CHMORT
	d3.json("http://epi.yale.edu/api/raw_data.json?country=" + country + "&indicator=" + subindicator.id, function(error,json) { //http
	//indicator_trend.json?iso_codes[]=" + country + "&indicators[]=" + subindicatorid, function(error, json) {
		if (! (sparkChart === undefined))
			sparkChart.destroy();
		//var data = json[0][0].indicator_trend;
		var data = json.indicator_trend;
		
		sparkCountry = country;
		
		// Trim trailing NA's
		var x = 0;
		while(data[x] != null && data[x].value == "NA") x++;
		data.splice(0, x);
		
		// Trim ending NA's
		x = data.length-1;
		while(x > 0 && data[x].value == "NA") x--;
		data.splice(x+1, data.length);
		
		var ser = [];
		$.map(data, function(obj, i) {
			var mark = false;
			if (i == 0 || i == data.length-1) mark = true;
			var val = parseFloat(obj.value);
			if (isNaN(val)) val = null;
			ser.push({x: parseInt(obj.year), y: val, marker: {enabled: mark}});
		});
		
		col = "#FF0000";
		if (subindicator.id == "CHMORT")
			col = "#ff9600";
		else if (subindicator.id == "HAP" || subindicator.id == "PM25" || subindicator.id == "PM25EXBL")
			col = "#f7c80b";
		else if (subindicator.id == "WATSUP" || subindicator.id == "ACSAT")
			col = "#ff6d24";
		else if (subindicator.id == "WASTECXN")
			col = "#7993f2";
		else if (subindicator.id == "AGSUB" || subindicator.id == "POPS")
			col = "#2e74ba";
		else if (subindicator.id == "FORCH")
			col = "#009bcc";
		else if (subindicator.id == "TCEEZ" || subindicator.id == "FSOC")
			col = "#008c8c";
		else if (subindicator.id == "PACOVD" || subindicator.id == "PACOVW" || subindicator.id == "MPAEEZ" || subindicator.id == "AZE")
			col = "#00ccaa";
		else if (subindicator.id == "CO2GDPd1" || subindicator.id == "CO2GDPd2" || subindicator.id == "CO2KWH")
			col = "#444444";
		else if ("ACCESS")
			col = "#1cb85d";
		
		var spark = emptySpark();
		
		// Set colors of data labels and axis ticks
		spark.plotOptions.line.dataLabels.style.color = col;
		spark.xAxis.labels.style.color = col;
		
		// Labels only on first and last, except for CO2GDPd2
		if (subindicator.id == "CO2GDPd2")
			spark.xAxis.labels.step = 10;
		else if (ser.length != 0)
			spark.xAxis.labels.step = ser[ser.length - 1].x - ser[0].x;
			
		spark.subtitle.text = subindicator.units;
		
		// Space is limited for subtitle
		if (subindicator.units.length > 13) 
			spark.subtitle.text = subindicator.shortunits;
		
		sparkChart = new Highcharts.Chart(spark);
		
		// Add the main data series
		if (ser.length == 0){
			var span = '<p id="pieChartInfoText" style="z-index: 5"> No data available. </p>';

			$("#sparkChart").append(span);
			span = $('#pieChartInfoText');
			span.css('left', 80);
			span.css('top', -50);
			span.css('position', 'relative');
			return;
		}
		sparkChart.addSeries({name: country, data: ser, marker: {enabled: false}, color: col}, true);
		
		// Add trends to indicators that need them
		if (subindicator.id == "CO2GDPd2") {
			var lm1 = linearReg(ser.slice(0,11));
			var lm2 = linearReg(ser.slice(11, 21));
			
			var firstPt1 = (lm1.m * ser[0].x) + lm1.b;
			var secondPt1 = (lm1.m * ser[10].x) + lm1.b;
			
			var firstPt2 = (lm2.m * ser[0].x) + lm2.b;
			var secondPt2 = (lm2.m * ser[9].x) + lm2.b;
			
			var dat1 = [{x: ser[0].x, y: firstPt1}, {x: ser[10].x, y: secondPt1}];
			var dat2 = [{x: ser[10].x, y: firstPt2}, {x: ser[20].x, y: secondPt2}];
			
			sparkChart.addSeries({ 
				data: dat1, marker: {enabled: false}, 
				dataLabels: {enabled: false}, 
				color: '#1cb85d',
				enableMouseTracking: false,
			}, true);
			sparkChart.addSeries({ 
				data: dat2, marker: {enabled: false}, 
				dataLabels: {enabled: false}, 
				color: '#1cb85d',
				enableMouseTracking: false,
			}, true);
		}
		else if (subindicator.id == "CO2GDPd1" || subindicator.id == "CO2KWH"){
			var lm = linearReg(ser);
			var firstPt = (lm.m * ser[0].x) + lm.b;
			var secondPt = (lm.m * ser[ser.length - 1].x) + lm.b;
			var dat = [{x: ser[0].x, y: firstPt}, {x: ser[ser.length - 1].x, y: secondPt}];
			sparkChart.addSeries({
				data: dat, marker: {enabled: false}, 
				dataLabels: {enabled: false}, 
				color: '#1cb85d',
				enableMouseTracking: false,
			}, true);
		}
		
		sparkChart.redraw();
	});
}

function emptySpark(){
	var options = {
		exporting: {
			buttons: {
				contextButton: {
					enabled: false,
					align: 'left',
					menuItems: [{
                    text: 'Print',
						onclick: function() {
							this.print();
						}
					},{
						text: 'Save as PNG',
						onclick: function() {
							var svg = this.getSVG(),
								width = parseInt(svg.match(/width="([0-9]+)"/)[1]),
								height = parseInt(svg.match(/height="([0-9]+)"/)[1]),
								canvas = document.createElement('canvas');
								
							canvas.setAttribute('width', width);
							canvas.setAttribute('height', height);
							
							if (canvas.getContext && canvas.getContext('2d')) {
								canvg(canvas, svg);
								var image = canvas.toDataURL("image/png");
								window.open(image);
							}
							else {
								alert ("Your browser doesn't support this feature, please use a modern browser");
							}
						},
						separator: false
					}]
				}
			}
		},
		chart: {
			type: 'line',
			renderTo: 'sparkChart',
			marginTop: 60,
			marginRight: 20,
			marginBottom: 20,
			marginLeft: 20,
			style:{
				// This is supposed to be global but it is not. Doesn't
				// work on title, for example, but does on the export
				// button.
				fontFamily: 'Centro',
			}
		},
		title:{
			align: 'right',
			verticalAlign: 'top',
			y: 7,
			text: 'RAW DATA TREND',
			useHTML: false,
			style: {
				fontSize: '14px',
				fontWeight: 'normal',
				fontFamily: 'CentroBold',
				color: '#808080'
			},
		},
		subtitle:{
			align: 'right',
			y: 20,
			useHTML: false,
			style: {
				fontSize: '14px',
				fontWeight: 'normal',
				fontFamily: 'CentroIT',
				color: '#808080',
			},
		},
		xAxis: {
			lineWidth: 0,
			minorTickLength: 0,
			tickLength: 0,
			gridLineWidth: 0,
			tickInterval: 1,
			labels:{
				staggerLines: 1,
				style: {
					fontWeight: 'bold',
					fontFamily: 'Centro',
				}
			}
		},
		yAxis: {
			allowDecimals: true,
			gridLineWidth: 0,
			labels: {
				enabled: false
			},
			title: {
				enabled: false
			}
		},
		series: [],
		credits: {
			enabled: false
		},
		legend: {
			enabled: false
		},
		tooltip: {
            useHTML: false,
			formatter: function() {
				var y = this.point.y;
				if (subindicator.id == "CHMORT")
					y = parseFloat(parseFloat(y).toPrecision(2));
				else
					y = parseFloat(Math.round(y * 100) / 100).toFixed(2);
							
				units = subindicator.shortunits;
				return this.series.name + '<br> <b>' + this.x + ':</b> ' + y + " " + units;
			},
			style:{
				'fontFamily': 'Centro',
			}
		},
		plotOptions: {
			line: {
				//~ connectNulls: true,
				dataLabels: {
					enabled: true,
					align: 'center',
					crop: false,
					overflow: 'none',
					verticalAlign: 'bottom',
					y: -5,
					formatter: function() {
						var y = this.point.y;
						if (subindicator.id == "CHMORT")
							y = parseFloat(parseFloat(y).toPrecision(2));
						else
							y = parseFloat(Math.round(y * 100) / 100).toFixed(2);
							
						var data = sparkChart.series[0].data;
						// Only label first and last 
						if(this.point.x == data[0].x || this.point.x == data[data.length-1].x)
							return y;
						return ''
					},
					style: {
						fontWeight: 'bold',
						fontFamily: 'Centro',
					}
				}
			}
		}
	};
	return options;
}

function mouseover() {
    //console.log(d3.select(this).select("path"));
    //d3.select(this).select(".piearc").attr("transform", "scale(0.5)")
    
    d3.select(this).select(".piearc").transition()
        .duration(100)
        .attr("transform", "scale(1.1)");
        //.style("fill", function (d) {
        //return colordark(d.data.values[1].values[0].value);
    //});
    d3.select(this).select(".label").transition()
        .duration(200)
        .style("opacity", 0);
}

function mouseout() {
    d3.select(this).select(".piearc").transition()
        .duration(300)
        .attr("transform", "scale(1)");
    //    .style("fill", function (d) {
    //    return color(d.data.values[1].values[0].value);
    //});
    d3.select(this).select(".label").transition()
        .duration(300)
        .style("opacity", 1);
}

function indLength(issues){
	var count = 0;
	for (var x = 0; x < issues.length; x++){
		if (issues[x].value != "NA" && issues[x].value >= 0)
			count++;
	}
	return count;
}

} //ends mega meta wrapper function
)};

// Regression result is y = mx + b.
function linearReg(data){
	var len = data.length;
	var dataX = [];
	var dataY = [];
	
	for(i = 0; i < len; i++){
		dataX.push(data[i].x);
		dataY.push(data[i].y);
	}
	
	var dataXY = [];
	var dataXX = [];
	for(i = 0; i < len; i++){
		dataXY.push(dataX[i]*dataY[i])
		dataXX.push(dataX[i]*dataX[i])
	}
		
	var sumX = dataX.reduce(function(a, b) { return a + b });
	var sumY = dataY.reduce(function(a, b) { return a + b });
	var sumXY = dataXY.reduce(function(a, b) { return a + b });
	var sumXX = dataXX.reduce(function(a, b) { return a + b });
	
	var avgX = sumX / len;
	var avgY = sumY / len;
	var avgXY = sumXY / len;
	var avgXX = sumXX / len;
	
	var m = (avgXY - (avgX * avgY)) / (avgXX - Math.pow(avgX, 2));
	var b = (avgY - (m * avgX));
	
	return {m:m, b:b};
}
