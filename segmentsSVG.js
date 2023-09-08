
let { makeFinalPoints, drawDeCasteljau } = require("./bezier.js");
let { fgetch } = require("./svgparser.js");

let currentDrawCONST = null;
let drawType = null;
let showVertices = null;



function render(ctx, draws){

    ctx.clearRect(0,0,canvas.width, canvas.height);

	if( currentDrawCONST && currentDrawCONST.drawType == "SELECT-DRAW"){
		
		render_select_draw(ctx,currentDrawCONST);
		
	}

    for(let draw of draws){
		
		
		if(drawType == "SELECT" && draw == currentDrawCONST){
			ctx.strokeStyle = "yellow";
		}
		else{
			ctx.strokeStyle = "black";
		}
		
		if(draw.drawType == "LINE"){
			
			render_line(ctx, draw);
			
		}
		
		if(draw.drawType == "BEZIER-PREVIEW"){
			
			ctx.strokeStyle = "red";
			
			render_line(ctx, draw);
			
		}
		
        if(draw.drawType == "RECT"){

            ctx.beginPath();
            ctx.strokeRect(draw.x, draw.y, draw.width, draw.height)

        }
		
		if(draw.drawType=="PATH"){
			
			for(let segment of draw.segments){
				
				if(segment.drawType == "BEZIER"){
					render_bezier(ctx, segment);
				}
				if(segment.drawType == "LINE"){
					render_line(ctx, segment);
				}
				
			}
			
		}

        if(draw.drawType=="BEZIER"){
			
			render_bezier(ctx, draw);
			
        }

    }
	
	for(let draw of draws){
		
		if(showVertices != null && currentDrawCONST == draw && draw.drawType == "LINE"){
			
			vertice2d(ctx, draw.ptbeg, (draw.currentNode && draw.currentNode.beg)?true:false);
			vertice2d(ctx, draw.ptend, (draw.currentNode && draw.currentNode.end)?true:false);
			
		}
		
        if(showVertices != null && currentDrawCONST == draw && draw.drawType=="BEZIER"){
			
			vertice2d(ctx, draw.ptbeg, (draw.currentNode && draw.currentNode.beg)?true:false);
			vertice2d(ctx, draw.ptend, (draw.currentNode && draw.currentNode.end)?true:false);
			
        }
		
        if(showVertices != null && currentDrawCONST == draw && draw.drawType == "RECT"){
			
			render_nodes_rect(ctx, draw);

        }
		
		if(showVertices == "twoends" && currentDrawCONST == draw && draw.drawType=="PATH"){
			
			let segment_first = draw.segments[0];
			let segment_last = draw.segments[draw.segments.length-1];
			
			vertice2d(ctx, segment_first.ptbeg, (draw.currentNode && draw.currentNode.segmentref == segment_first && draw.currentNode.beg) ? true:false  );
			vertice2d(ctx, segment_last.ptend, (draw.currentNode && draw.currentNode.segmentref == segment_last && draw.currentNode.end) ? true:false  );
			
		}
		
		if(showVertices == "all" && currentDrawCONST == draw && draw.drawType=="PATH"){
			
			let segment_ = draw.segments[0];
			
			vertice2d(ctx, segment_.ptbeg, (draw.currentNode && draw.currentNode.segmentref == segment_ && draw.currentNode.beg) ? true:false  );
			vertice2d(ctx, segment_.ptend, (draw.currentNode && draw.currentNode.segmentref == segment_ && draw.currentNode.end) ? true:false  );
			
			for(let i = 1; i<draw.segments.length; i++){
				
				let segment = draw.segments[i];
				
				vertice2d(ctx, segment.ptend, (draw.currentNode && draw.currentNode.segmentref == segment && draw.currentNode.end) ? true:false  );
				
			}
			
		}
		
	}

}

function render_select_draw(ctx, draw){
	
	console.log("ok");
	
	let len_space = 3;
	let len_len = 5;
	
	let cnt = parseInt((draw.width+len_space)/(len_len+len_space));
	let margin = (draw.width - (len_len+len_space)*cnt + len_space)/2;
	
	console.log(margin);
	
	ctx.strokeStyle = "blue";
	
	ctx.beginPath();
	
	if(cnt>0){
	
		ctx.moveTo(draw.x+margin, draw.y);
		ctx.lineTo(draw.x+margin+len_len, draw.y);
		
		for(let i = 1;i<=cnt-1; i++){
			
			ctx.moveTo( draw.x + margin + (len_len+len_space)*i, draw.y );
			ctx.lineTo(  draw.x + margin + (len_len+len_space)*i + len_len, draw.y  );
			
		}
		
		ctx.moveTo(draw.x+margin, draw.y+draw.height);
		ctx.lineTo(draw.x+margin+len_len, draw.y+draw.height);
		
		for(let i = 1;i<=cnt-1; i++){
			
			ctx.moveTo( draw.x + margin + (len_len+len_space)*i, draw.y+draw.height );
			ctx.lineTo(  draw.x + margin + (len_len+len_space)*i + len_len, draw.y+draw.height  );
			
		}
		
	}
	
	cnt = parseInt((draw.height+len_space)/(len_len+len_space));
	margin = (draw.height - (len_len+len_space)*cnt + len_space)/2;
	
	if(cnt>0){
		
		ctx.moveTo(draw.x, draw.y + margin);
		ctx.lineTo(draw.x, draw.y + margin + len_len);
		
		for(let i = 1;i<=cnt-1; i++){
			
			ctx.moveTo(draw.x, draw.y + margin + (len_len + len_space)*i);
			ctx.lineTo(draw.x, draw.y + margin + (len_len + len_space)*i + len_len);
			
		}
		
		ctx.moveTo(draw.x+draw.width, draw.y + margin);
		ctx.lineTo(draw.x+draw.width, draw.y + margin + len_len);
		
		for(let i = 1;i<=cnt-1; i++){
			
			ctx.moveTo(draw.x+draw.width, draw.y + margin + (len_len + len_space)*i);
			ctx.lineTo(draw.x+draw.width, draw.y + margin + (len_len + len_space)*i + len_len);
			
		}
		
		
		
	}
	
	ctx.stroke();
}

function drawRaw(){
	this.ptbeg = {};
	this.ptend = {};
}

function getSelectedNode(draw, {x,y}, twoends = false){
	
	if(draw.drawType == "LINE"){
		return getSelectedNode_line(draw, {x,y});
	}
	if(draw.drawType == "BEZIER"){
		return getSelectedNode_line(draw, {x,y});
	}
	
	if(draw.drawType=="PATH" && twoends){
		
		console.log("twoends");
		
		let nx;
		
		nx = getSelectedNode_line(draw.segments[0], {x,y}, true,false);
		
		if(nx){
			//?draw.segment_idx_selected = 0;
			return nx;
		}
		
		nx = getSelectedNode_line(draw.segments[draw.segments.length-1], {x,y}, false,true);
		
		if(nx){
			//?draw.segment_idx_selected = draw.segments.length-1;
			return nx;
		}
		
		return null;
		
		console.log(draw);
		
	}
	
	if(draw.drawType=="PATH" && !twoends){
		
		for(let i = 0; i<draw.segments.length; i++){
			
			let segment = draw.segments[i];
			let nx;
			
			if(segment.drawType == "LINE"){
				nx = getSelectedNode_line(segment, {x,y});
			}
			
			if(segment.drawType == "BEZIER"){
				nx = getSelectedNode_line(segment, {x,y});
			}
			
			if(nx==null){
				continue;
			}
			
			nx.segment_idx = i;
			
			return nx;
			
		}
		
		return null;
	}
	
}

function getSelectedNode_line(draw, {x,y}, begin = true, end = true){
	
	let n1 = true;
	let n2 = true;
	
	if(begin){
	
		let len_x = x - draw.ptbeg.x;
		let Y_ = draw.ptbeg.y - 6 + len_x;
		
		if(Y_>y){
			n1 = false;
		}
		
		len_x = x - (draw.ptbeg.x-6);
		Y_ = draw.ptbeg.y + len_x;
		
		if(Y_<y){
			n1 = false;
		}
		
		len_x = x - draw.ptbeg.x;
		Y_ = (draw.ptbeg.y - 6) - len_x;
		
		if(Y_>y){
			n1 = false;
		}
		
		len_x = x - (draw.ptbeg.x+6);
		Y_ = draw.ptbeg.y - len_x;
		
		if(Y_<y){
			n1 = false;
		}
		
		if(n1==true){
			return {
				pt: draw.ptbeg,
				segmentref: draw,
				beg: true
			};
		}
		
	}
	
	if(end){
	
		len_x = x - draw.ptend.x;
		Y_ = draw.ptend.y - 6 + len_x;
		
		if(Y_>y){
			n2 = false;
		}
		
		len_x = x - (draw.ptend.x-6);
		Y_ = draw.ptend.y + len_x;
		
		if(Y_<y){
			n2 = false;
		}
		
		len_x = x - draw.ptend.x;
		Y_ = (draw.ptend.y - 6) - len_x;
		
		if(Y_>y){
			n2 = false;
		}
		
		len_x = x - (draw.ptend.x+6);
		Y_ = draw.ptend.y - len_x;
		
		if(Y_<y){
			n2 = false;
		}
		
		if(n2==true){
			return {
				pt: draw.ptend,
				segmentref: draw,
				end: true
			}
		}
	}
	
	return null;
	
}

function getSelected(draws, {x,y}){
	
	for(let draw of draws){
		
		if(draw.drawType == "PATH"){
			
			let ishovered = false;
			
			for(let segment of draw.segments){
				
				if(segment.drawType == "LINE"){
					
					let hovered = is_selected_line({x,y}, segment);
					if(hovered){
						ishovered = true;
						break;
					}
					
				}
				if(segment.drawType == "BEZIER"){
					
					let hovered = is_selected_bezier({x,y}, segment);
					if(hovered){
						ishovered = true;
						break;
					}
				}
				
			}
			
			if(ishovered==true){
				return draw;
			}
			
		}
		
		if(draw.drawType == "LINE"){					
			
			let hovered = is_selected_line({x,y}, draw);
			if(hovered){
				return draw;
			}
			
		}
		
		if(draw.drawType=="RECT"){
			
			let hovered = is_selected_rect({x,y}, draw);
			if(hovered){
				return draw;
			}
			
		}
		
		if(draw.drawType == "BEZIER"){
			
			let hovered = is_selected_bezier({x,y}, draw);
			if(hovered){
				return draw;
			}
			
		}
		
		
	}
	
	return null;
	
}

function vertice2d(ctx, {x,y} , selected = false){
	
	if(selected==true){
		ctx.fillStyle = "blue";
	}
	else{
		ctx.fillStyle = "gray";
	}
	
	ctx.beginPath();
	ctx.moveTo(x, y+6);
	ctx.lineTo(x+6, y);
	ctx.lineTo(x, y-6);
	ctx.lineTo(x-6, y);
	ctx.closePath();
	
	ctx.fill();
	
	ctx.beginPath();
	ctx.moveTo(x, y+6);
	ctx.lineTo(x+6, y);
	ctx.lineTo(x, y-6);
	ctx.lineTo(x-6, y);
	ctx.closePath();
	
	ctx.stroke();
}

function render_bezier(ctx, draw){
	
	let controlPoints = [
		{
			x: draw.ptbeg.x,
			y: draw.ptbeg.y
		},
		...draw.ctrls,
		{
			x: draw.ptend.x,
			y: draw.ptend.y
		}
	];

	let pts = drawDeCasteljau(controlPoints, 0.001);
	pts = makeFinalPoints(controlPoints,pts, 0.001, 1, 0.05 );

	ctx.beginPath();

	ctx.moveTo(pts[0].x, pts[0].y);

	for(let i = 1; i<pts.length; i++){

		ctx.lineTo(pts[i].x,pts[i].y);

	}

	ctx.stroke();
	
}

function render_line(ctx, draw){
	
	ctx.beginPath();
	ctx.moveTo(draw.ptbeg.x, draw.ptbeg.y);
	ctx.lineTo(draw.ptend.x, draw.ptend.y);
	ctx.stroke();
	
}

function render_nodes_rect(ctx, draw){
	
	//
	
}

function is_selected_rect(pt_,draw){
	
	let {x,y} = pt_;
	
	if( ( (x>=draw.x-5 && x<=draw.x+5) && (y>=draw.y && y<=draw.y+draw.height) ) || ( (x>=draw.x+draw.width-5 && x<=draw.x+draw.width+5) && (y>=draw.y && y<=draw.y+draw.height) ) ||
		((y>=draw.y-5 && y<=draw.y+5) && (x>=draw.x && x<=draw.x+draw.width) ) || ((y>=draw.y+draw.height-5 && y<=draw.y+draw.height+5) && (x>=draw.x && x<=draw.x+draw.width) ))
	{
		return true;
	}
	
	return false;

}

function is_selected_line(pt_, draw){
	
	let {x,y} = pt_;
	
	let len = ptDist( {x: draw.ptbeg.x, y: draw.ptbeg.y}, { x: draw.ptend.x, y: draw.ptend.y } );
	len = Math.floor(len);
	
	let len_x = draw.ptend.x - draw.ptbeg.x;
	let len_y = draw.ptend.y - draw.ptbeg.y;
	
	let stepx = len_x/len;
	let stepy = len_y/len;
	
	let ishovered = false;
	
	for(let i = 0; i<=len; i++){
		
		let pt = {
			x: draw.ptbeg.x + i*stepx,
			y: draw.ptbeg.y + i*stepy
		}
		
		if(ptDist(pt, {x: x, y: y})<3){
			ishovered = true;
			break;
		}
		
	}
	
	return ishovered;
}

function is_selected_bezier(pt_, draw){
	
	let {x,y} = pt_;
	
	let controlPoints = [
		{
			x: draw.ptbeg.x,
			y: draw.ptbeg.y
		},
		...draw.ctrls,
		{
			x: draw.ptend.x,
			y: draw.ptend.y
		}
	];
	
	let pts = drawDeCasteljau(controlPoints, 0.001);
	pts = makeFinalPoints(controlPoints,pts, 0.001, 1, 0.05 );
	
	let ishovered = false;
	
	for(let pt of pts){
		
		if(ptDist(pt, {x: x,y: y})<3){
			ishovered=true;
			break;
		}
		
	}
	
	return ishovered;
}

function zoom_bezier(draw, center, ratio){
	
	let len_x = draw.ptbeg.x - center.x;
	let len_y = draw.ptbeg.y - center.y;
	
	draw.ptbeg.x = center.x + len_x*ratio;
	draw.ptbeg.y = center.y + len_y*ratio;
	
	for(let pt of draw.ctrls){
		
		len_x = pt.x - center.x;
		len_y = pt.y - center.y;
		
		pt.x = center.x + len_x*ratio;
		pt.y = center.y + len_y*ratio;
	}
	
	len_x = draw.ptend.x - center.x;
	len_y = draw.ptend.y - center.y;
	
	draw.ptend.x = center.x + len_x*ratio;
	draw.ptend.y = center.y + len_y*ratio;
	
}

function zoom_line(draw,center, ratio){
	
	let len_x = draw.ptbeg.x - center.x;
	let len_y = draw.ptbeg.y - center.y;
	
	draw.ptbeg.x = center.x + len_x*ratio;
	draw.ptbeg.y = center.y + len_y*ratio;
	
	len_x = draw.ptend.x - center.x;
	len_y = draw.ptend.y - center.y;
	
	draw.ptend.x = center.x + len_x*ratio;
	draw.ptend.y = center.y + len_y*ratio;
	
}

function zoomin(draws, center, ratio){
	
	if( currentDrawCONST && currentDrawCONST.drawType == "SELECT-DRAW"){
		
		let len_x = currentDrawCONST.x - center.x;
		let len_y = currentDrawCONST.y - center.y;
		
		currentDrawCONST.x = center.x + len_x*ratio;
		currentDrawCONST.y = center.y + len_y*ratio;
		
		currentDrawCONST.width *= ratio;
		currentDrawCONST.height *= ratio;
		
	}
	
	for(let draw of draws){
		
		if(draw.drawType == "RECT"){
			
			let len_x = draw.x - center.x;
			let len_y = draw.y - center.y;
			
			draw.x = center.x + len_x*ratio;
			draw.y = center.y + len_y*ratio;
			
			draw.width *= ratio;
			draw.height *= ratio;
			
		}
		if(draw.drawType == "BEZIER"){
			
			zoom_bezier(draw,center, ratio);
			
		}
		if(draw.drawType=="LINE"){
			zoom_line(draw,center,ratio);
		}
		
		if(draw.drawType=="PATH"){
			
			for(let segment of draw.segments){
				
				if(segment.drawType=="LINE"){
					zoom_line(segment,center,ratio);
				}
				if(segment.drawType=="BEZIER"){
					zoom_bezier(segment,center,ratio);
				}
				
			}
			
		}
		

		
		
	}
	
}

function ptDist(pt1, pt2){
	
	return Math.sqrt( (pt1.x - pt2.x) * (pt1.x - pt2.x) + (pt1.y - pt2.y) * (pt1.y - pt2.y) );
}


function makeSelectDraw(draw){
	
	let select_draw = new drawRaw();
	select_draw.drawType = "SELECT-DRAW";
	
	let minx, maxx, miny, maxy;
	
	if(draw.drawType=="PATH"){
		
		for(let i = 0; i<draw.segments.length; i++){
			
			let segment = draw.segments[i];
			
			if(minx == undefined || minx > Math.min( segment.ptbeg.x, segment.ptend.x )){
				minx = Math.min( segment.ptbeg.x, segment.ptend.x );
			}
			if(maxx == undefined || maxx < Math.max(segment.ptbeg.x, segment.ptend.x)){
				maxx = Math.max(segment.ptbeg.x, segment.ptend.x);
			}
			if(miny == undefined || miny > Math.min( segment.ptbeg.y, segment.ptend.y)){
				miny = Math.min( segment.ptbeg.y, segment.ptend.y);
			}
			if(maxy == undefined || maxy < Math.max( segment.ptbeg.y, segment.ptend.y)){
				maxy = Math.max( segment.ptbeg.y, segment.ptend.y);
			}
			
		}
		
	}
	
	select_draw.x = minx;
	select_draw.y = miny;
	
	select_draw.width = maxx - minx;
	select_draw.height = maxy - miny;
	
	return select_draw;
}


module.exports = function(){
	
	let draws = [];
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");
	
	let inputfile = document.getElementById("svg_read");
	
	inputfile.addEventListener("change", ()=>{
		
		if(inputfile.files.length == 0){
			return;
		}
		
		let file_ = inputfile.files[0];
		
		file_.text().then((v)=>{
			
			console.log(v);
			
			let parser = new DOMParser();
			let svgDoc = parser.parseFromString(v, "text/xml");
			
			const errorNode = svgDoc.querySelector("parsererror");
			if(errorNode){
				console.log("PARSER ERROR");
				return;
			}
			
			let svgEl = svgDoc.getElementsByTagName("svg");
			if(svgEl.length == 0){
				console.log("INVALID SVG");
				return;
			}
			
			draws = [];
			
			svgEl = svgEl[0];
			
			fgetch(svgEl, draws);
			
			render(ctx,draws);
			
			
		});
		
	});
	
	canvas.addEventListener("wheel", (e)=>{
		
		if(e.deltaY<0){
			zoomin(draws, {
				x: e.offsetX,
				y: e.offsetY
			}, 1.2);
			render(ctx,draws);
		}
		if(e.deltaY>0){
			zoomin(draws, {
				x: e.offsetX,
				y: e.offsetY
			}, 0.8);
			render(ctx,draws);
		}
		
		e.preventDefault();
		
	})
	
	let currentDraw;
	
    let btnbezier = document.getElementById("bezier");
	let btnline = document.getElementById("btnline");
    let rectBtn = document.getElementById("rect");
    let zoominbtn = document.getElementById("zoomin");
    let zoomoutbtn = document.getElementById("zoomout");
    let selectbtn = document.getElementById("selectorBtn");
	let verticesbtn = document.getElementById("verticesbtn");

    let objDraw = new drawRaw();
    let ptStart = {};
    let ptCtrl = {};
	
	
	zoominbtn.addEventListener("click", ()=>{
		
		zoomin(draws, {
			x: canvas.width/2,
			y: canvas.height/2
		}, 1.2);
		
		render(ctx, draws);
		
	})
	
	zoomoutbtn.addEventListener("click", ()=>{
		
		zoomin(draws, {
			x: canvas.width/2,
			y: canvas.height/2
		}, 0.8);
		
		render(ctx, draws);
		
	})
	
	const btn_clear = document.getElementById("clear");
	btn_clear.addEventListener("click", ()=>{
		
		draws = [];
		render(ctx, draws);
		
	});
	
	btnline.addEventListener("click", (ev)=>{
		
		
		if(drawType=="VERTICES" && currentDrawCONST != null){
			
			currentDrawCONST.isvertices = false;
			currentDrawCONST.isvertice__twoends = true;
			
			render(ctx, draws);
			
		}
		
		if(drawType=="SELECT" && currentDrawCONST != null){
			
			currentDrawCONST.isselected = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}
		
		drawType = "LINE";
		
	});
	
	selectbtn.addEventListener("click", (ev)=>{
		
		if(drawType=="VERTICES" && currentDrawCONST != null){
			
			currentDrawCONST.isvertices = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}
		
		drawType = "SELECT";
		
	});
	
	verticesbtn.addEventListener("click", (ev)=>{
		
		if(drawType=="SELECT" && currentDrawCONST != null){
			
			currentDrawCONST.isselected = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}
		
		if(currentDrawCONST && currentDrawCONST.isvertice__twoends){
			
			currentDrawCONST.isvertice__twoends = false;
			currentDrawCONST.isvertices = true;
			
			render(ctx, draws);
			
		}
		
		drawType = "VERTICES";
		
	});
	
    rectBtn.addEventListener("click", (ev)=>{
		
		if(drawType=="VERTICES" && currentDrawCONST != null){
			
			currentDrawCONST.isvertices = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}
		
		if(drawType=="SELECT" && currentDrawCONST != null){
			
			currentDrawCONST.isselected = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}
	
        drawType = "RECT";

    });

    btnbezier.addEventListener("click", (ev)=>{
		
		/*
		if(drawType=="VERTICES" && currentDrawCONST != null){
			
			currentDrawCONST.isvertices = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}
		*/
		
		if(drawType=="SELECT" && currentDrawCONST != null){
			
			currentDrawCONST.isselected = false;
			currentDrawCONST = null;
			
			render(ctx, draws);
			
		}

        drawType = "BEZIER";

    });

    canvas.addEventListener("mousedown", (ev)=>{
		
		let x = ev.offsetX;
		let y = ev.offsetY;
		
        if(drawType == null) return;

        if(drawType=="RECT"){
			
			objDraw.drawType = drawType;
			
            drawType="RECT-MOVE";
            
            ptStart.x = ev.offsetX;
            ptStart.y = ev.offsetY;
        }

        if(drawType=="BEZIER"){

			objDraw.drawType = drawType;

            drawType = "BEZIER-CTRL";
			
            objDraw.ptbeg.x = ev.offsetX;
            objDraw.ptbeg.y = ev.offsetY;
			
        }
		
		if(drawType=="LINE"){
			
			objDraw.drawType = drawType;
			
			if(currentDrawCONST){
				
				let n = getSelectedNode(currentDrawCONST, {x,y}, true);
				if(n){
					
					currentDrawCONST.currentNode = n;
					
					showVertices = "twoends";
					
					objDraw.ptbeg = n.pt;
					
					
				}
				else{
					
					currentDrawCONST = null;
					showVertices = null;
					
					objDraw.ptbeg.x = ev.offsetX;
					objDraw.ptbeg.y = ev.offsetY;
				}
				
				render(ctx,draws);
				
			}
			else{
				objDraw.ptbeg.x = ev.offsetX;
				objDraw.ptbeg.y = ev.offsetY;
			}
			
			render(ctx,draws);
			
		}
		
		
		if(drawType=="SELECT"){
			
			let drawSelected = getSelected(draws, {x,y});
			if(drawSelected){
				
				//currentDrawCONST = drawSelected;
				
				let select_draw = makeSelectDraw(drawSelected);
				
				currentDrawCONST = select_draw;
				currentDrawCONST.drawref = drawSelected;
				
				console.log(select_draw);
				
				render(ctx,[...draws,select_draw]);
				
			}
			else{
				currentDrawCONST = null;
				render(ctx,draws);
			}
			
		}
		
		if(drawType=="VERTICES"){
			
			if(currentDrawCONST){
				
				let node = getSelectedNode(currentDrawCONST, {x,y});
	
				if(node){
					
					currentDrawCONST.currentNode = node;
					drawType = "VERTICE-MOVE";
					
					render(ctx,draws);
					
					return;
				}
				
			}
			
			let drawSelected = getSelected(draws, {x,y});
			if(drawSelected){
				
				currentDrawCONST = drawSelected;
				showVertices = "all";
				
				render(ctx,draws);
				
			}
			else{
				currentDrawCONST = null;
				showVertices = null;
				
				render(ctx,draws);
			}
		}
	


    })

    canvas.addEventListener("mouseup", (ev)=>{

        if(drawType == null) return;

		if(drawType=="VERTICE-MOVE"){
			
			drawType="VERTICES";
			
			currentDrawCONST.currentNode = null;
			
			render(ctx,draws);
		}

        if(drawType=="RECT-MOVE"){

            objDraw.width = Math.abs(ev.offsetX - ptStart.x);
            objDraw.height = Math.abs(ev.offsetY - ptStart.y);
            objDraw.x = Math.min(ev.offsetX, ptStart.x);
            objDraw.y = Math.min(ev.offsetY, ptStart.y);

            draws.push(objDraw);
            render(ctx, draws);

            objDraw = new drawRaw();
            drawType="RECT";

        }
		
		if(drawType == "LINE"){
			drawType = "LINE-CTRL";
		}
		
		else if(drawType=="LINE-CTRL"){
			
			objDraw.ptend.x = ev.offsetX;
			objDraw.ptend.y = ev.offsetY;
			
			let ispathextended = false;
			
			if(currentDrawCONST){
				
				/*
					w momencie zaznaczenia wierzchołka, jeśli zaznaczona jest także ścieżka, objDraw.ptbeg jest referencją do punktu w sąsiadującym segmencie 
				*/
				
				
				if(currentDrawCONST.currentNode.pt == objDraw.ptbeg){
					
					if(currentDrawCONST.currentNode.beg){
						
						objDraw.ptend = {...objDraw.ptbeg};
						
						objDraw.ptbeg = {
							x: ev.offsetX,
							y: ev.offsetY
						};
						
						currentDrawCONST.currentNode.segmentref = objDraw;
						currentDrawCONST.currentNode.segment_idx = 0;
						currentDrawCONST.currentNode.pt = objDraw.ptbeg;
						currentDrawCONST.currentNode.beg = true;
						
						currentDrawCONST.segments.unshift(objDraw);
						
						objDraw = new drawRaw();
						objDraw.drawType = "LINE";
						objDraw.ptbeg = currentDrawCONST.currentNode.pt;
						
					}
					
					if(currentDrawCONST.currentNode.end){
						
						objDraw.ptbeg = {...objDraw.ptbeg
						};
						
						currentDrawCONST.currentNode.segmentref = objDraw;
						currentDrawCONST.currentNode.segment_idx = currentDrawCONST.segments.length;
						currentDrawCONST.currentNode.pt = objDraw.ptend;
						currentDrawCONST.currentNode.end = true;
						
						currentDrawCONST.segments.push(objDraw);
						
						objDraw = new drawRaw();
						objDraw.drawType = "LINE";
						objDraw.ptbeg = currentDrawCONST.currentNode.pt;
						
					}
					
					ispathextended = true;
					
				}
				
			}
			
			if(!ispathextended){
				
				draws.push(objDraw);
				
				objDraw = new drawRaw();
				objDraw.drawType = "LINE";
				objDraw.ptbeg = {
					x: ev.offsetX,
					y: ev.offsetY
				}
				
			}
			
			render(ctx, draws);
			
			console.log(objDraw);
			
			//drawType = "LINE";
			
		}

        else if(drawType=="BEZIER-CTRL"){

            objDraw.ctrls = [];
            objDraw.ctrls.push({
                x: ev.offsetX,
                y: ev.offsetY
            });

            drawType = "BEZIER-END";

        }

        else if(drawType=="BEZIER-END"){

            objDraw.ptend.x = ev.offsetX;
            objDraw.ptend.y = ev.offsetY;

            draws.push(objDraw);
            render(ctx, draws);

            drawType = "BEZIER";

            objDraw = new drawRaw(); 

        }       

    })

    canvas.addEventListener("mousemove", (ev)=>{
		
		let x = ev.offsetX;
		let y = ev.offsetY;
		
		if(drawType=="VERTICE-MOVE"){
			
			if(currentDrawCONST.drawType=="PATH"){
				
				if(currentDrawCONST.currentNode.segment_idx == 0 && currentDrawCONST.currentNode.beg==true){
					
					currentDrawCONST.currentNode.pt.x = x;
					currentDrawCONST.currentNode.pt.y = y;
					
				}
				else{
					
					currentDrawCONST.currentNode.pt.x = x;
					currentDrawCONST.currentNode.pt.y = y;
					
					if(currentDrawCONST.currentNode.segment_idx < currentDrawCONST.segments.length-1){
						
						currentDrawCONST.segments[currentDrawCONST.currentNode.segment_idx+1].ptbeg.x = x;
						currentDrawCONST.segments[currentDrawCONST.currentNode.segment_idx+1].ptbeg.y = y;
						
					}
					
				}
				
			}
			else if(currentDrawCONST.drawType=="LINE" || currentDrawCONST.drawType=="BEZIER"){
				
				currentDrawCONST.currentNode.pt.x = x;
				currentDrawCONST.currentNode.pt.y = y;
				
			}
			
			render(ctx,draws);
			
		}
		
        if(drawType=="RECT-MOVE"){
            objDraw.width = Math.abs(ev.offsetX - ptStart.x);
            objDraw.height = Math.abs(ev.offsetY - ptStart.y);
            objDraw.x = Math.min(ev.offsetX, ptStart.x);
            objDraw.y = Math.min(ev.offsetY, ptStart.y);
        
            render(ctx, [...draws, objDraw]);
        }
		
		if(drawType=="LINE-CTRL"){
			
			objDraw.ptend.x = ev.offsetX;
			objDraw.ptend.y = ev.offsetY;
			
			render(ctx, [...draws, objDraw]);
			
		}
		
		if(drawType=="BEZIER-CTRL"){
			
			let preview_line = new drawRaw();
			preview_line.drawType = "BEZIER-PREVIEW";
			
			preview_line.ptbeg = {
				...objDraw.ptbeg
			};
			
			preview_line.ptend = {
				x: ev.offsetX,
				y: ev.offsetY
			};
			
			render(ctx, [...draws, preview_line]);
			
		}
		
		if(drawType=="BEZIER-END"){
			
            objDraw.ptend.x = ev.offsetX;
            objDraw.ptend.y = ev.offsetY;
			
			render(ctx, [...draws, objDraw]);
			
		}
		
		if(drawType=="SELECT" || drawType=="VERTICES"){
			/*
			let keyName;
			if(drawType=="SELECT"){
				keyName = "isselected";
			}
			if(drawType=="VERTICES"){
				keyName = "isvertices";
			}
			
			let drawSelected = getSelected(draws, {x,y});
			if(drawSelected){
				if(currentDraw && currentDraw != drawSelected && currentDraw != currentDrawCONST)
					currentDraw[keyName] = false;
				
				drawSelected[keyName] = true;
				currentDraw = drawSelected;
			}
			else{
				if(currentDraw && currentDraw != currentDrawCONST)
					currentDraw[keyName] = false;
				currentDraw = null;
			}
			
			
			render(ctx,draws);
			*/
		}
		
    })

    canvas.addEventListener("click", (ev)=>{

        return;

        points.push({
            x: ev.offsetX,
            y: ev.offsetY
        })

        ctx.beginPath();
        ctx.arc(ev.offsetX, ev.offsetY, 2, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

    });
	
	canvas.addEventListener("keydown", (ev)=>{
		
		if(ev.key == "Escape"){
			
			currentDrawCONST = null;
			objDraw = new drawRaw();
			drawType = null;
			
			render(ctx,draws);
			
		}
		
		console.log(ev);
		
	});
	
}