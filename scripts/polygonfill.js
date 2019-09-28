var view;
var ctx;
var polygons = {
    convex: {
        color: '#0000ff', // choose color here!
        vertices: [[300,100],[500,400],[300,600],[100,400]
            // fill in vertices here!
        ]
    },
    concave: {
        color: '#ff0000', // choose color here!
        vertices: [[300,100],[400,400],[350,450],[300,400] ,[250,450],[200,400]
            // fill in vertices here!
        ]
    },
    self_intersect: {
        color: '#1289AF', // choose color here!
        vertices: [[300,300],[400,400],[350,450],[300,300] ,[250,450],[200,400]
            // fill in vertices here!
        ]
    },
    interior_hole: {
        color: '#1B99AF', // choose color here!
        vertices: [[200,50],[300,600],[50,400],[100,200],[300,200],[300,300],[200,300]
            // fill in vertices here!
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    SelectNewPolygon();
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();


    // Step 1: populate ET with edges of polygon
	var endPoint=polygon.vertices[0][1];
	for (var i = 0; i<polygon.vertices.length;i++){
		if (endPoint<polygon.vertices[i][1]){
			endPoint = polygon.vertices[i][1];
		}
	}

	for(var i =0; i<polygon.vertices.length-1;i++){

		var ymax;
		var xymin;
		var deltay;
		var deltax;
		var ymin;
		if(polygon.vertices[i][1]>polygon.vertices[i+1][1]){
			ymax = polygon.vertices[i][1];
			xymin = polygon.vertices[i+1][0];
			deltay = polygon.vertices[i][1]-polygon.vertices[i+1][1];
			deltax = polygon.vertices[i][0]-polygon.vertices[i+1][0];
			ymin = polygon.vertices[i+1][1];
			edge = new EdgeEntry(ymax,xymin,deltax,deltay);
			edge_table[ymin].InsertEdge(edge);
		}else{
			ymax = polygon.vertices[i+1][1];
			xymin = polygon.vertices[i][0];
			deltay = polygon.vertices[i+1][1]-polygon.vertices[i][1];
			deltax = polygon.vertices[i+1][0]-polygon.vertices[i][0];
			ymin = polygon.vertices[i][1];
			edge = new EdgeEntry(ymax,xymin,deltax,deltay);
			edge_table[ymin].InsertEdge(edge);
		}
		if(i === polygon.vertices.length-2){
			if(polygon.vertices[polygon.vertices.length-1][1]>polygon.vertices[0][1]){
				ymax = polygon.vertices[polygon.vertices.length-1][1];
				xymin = polygon.vertices[0][0];
				deltay = polygon.vertices[polygon.vertices.length-1][1]-polygon.vertices[0][1];
				deltax = polygon.vertices[polygon.vertices.length-1][0]-polygon.vertices[0][0];
				ymin = polygon.vertices[0][1];
				edge = new EdgeEntry(ymax,xymin,deltax,deltay);
				edge_table[ymin].InsertEdge(edge);
			}else{
				ymax = polygon.vertices[0][1];
				xymin = polygon.vertices[polygon.vertices.length-1][0];
				deltay = polygon.vertices[0][1]-polygon.vertices[polygon.vertices.length-1][1];
				deltax = polygon.vertices[0][0]-polygon.vertices[polygon.vertices.length-1][0];
				ymin = polygon.vertices[i][1];
				edge = new EdgeEntry(ymax,xymin,deltax,deltay);
				edge_table[ymin].InsertEdge(edge);	
			}
		}
			
	}



    // Step 2: set y to first scan line with an entry in ET
	var scan_y = polygon.vertices[0][1];
	//console.log(edge_table);
    // Step 3: Repeat until ET[y] is NULL and AL is NULL
    //   a) Move all entries at ET[y] into AL
    //   b) Sort AL to maintain ascending x-value order
    //   c) Remove entries from AL whose ymax equals y
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    //   e) Increment y by 1
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)
	
	
	while(scan_y < endPoint+1|| active_list.first_entry !== null){
		//active_list.InsertEdge(edge_table[scan_y].first_entry);
		var insert = edge_table[scan_y].first_entry;
		while(insert !== null ){
			active_list.InsertEdge(insert);
			insert = insert.next_entry;

		}
		active_list.SortList();
		active_list.RemoveCompleteEdges(scan_y);
		
		var edge = active_list.first_entry;
		while(edge!== null && edge.next_entry !== null){
			var draw_x1 = Math.ceil(edge.x);
			var draw_x2 = Math.ceil(edge.next_entry.x)-1;
			if(draw_x1<=draw_x2){
				DrawLine(draw_x1,scan_y,draw_x2,scan_y);
			}
			edge = edge.next_entry.next_entry;

		}
		
		scan_y = scan_y +1;

		var temp = active_list.first_entry;
		while(temp !== null ){

			temp.x = temp.x + temp.inv_slope;
			temp = temp.next_entry;
			
		}
		
	}
	
	
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

function DrawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
