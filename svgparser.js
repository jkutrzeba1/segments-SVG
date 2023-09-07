function drawRaw(){
	this.ptbeg = {};
	this.ptend = {};
}
function fgetch(el, drawsOut){
	
	for(let n of el.children){
		
		if(n.tagName=="g"){
			
			fgetch(n, drawsOut)
			
		}
		
		if(n.tagName == "rect"){
			
			let objDraw = new drawRaw();
			objDraw.drawType = "RECT";
			objDraw.x = parseFloat(n.getAttribute("x"))*3.807;
			objDraw.y = parseFloat(n.getAttribute("y"))*3.807;
			objDraw.width = parseFloat(n.getAttribute("width"))*3.807;
			objDraw.height = parseFloat(n.getAttribute("height"))*3.807;
			
			drawsOut.push(objDraw);
			
		}
		
		if(n.tagName == "path"){
			
			let segmensts = [];
			
			let path = n.getAttribute("d");
			
			let cmd = null;
			
			if(!(path[0] == 'm' || path[0] == "M")){
				console.log("INVALID NODE");
				console.log(n);
				continue;
			}
			

			
			let idx = 0;
			
			let o = parseFloat_(idx, path);
			idx = o.idx;

			let X = o.num;
			o = parseFloat_(idx, path);
			idx = o.idx;
			let Y = o.num;
			
			if( path.charCodeAt(idx+1)>=48 && path.charCodeAt(idx+1)<=57){
				
				if(path[0] == 'm'){
					cmd = 'l';
				}
				
				if(path[0] == "M"){
					cmd = "L";
				}
				
			}
			
			while(idx<path.length){
				
				let objDraw = new drawRaw();
			
				if(path[idx+1] == 'C' || cmd == 'C' ){
					
					objDraw.drawType = "BEZIER";
					objDraw.ptbeg.x = X;
					objDraw.ptbeg.y = Y;
					objDraw.ctrls = [];
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ctrls.push({
						x: X,
						y: Y
					})
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ctrls.push({
						x: X,
						y: Y
					})
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ptend.x = X;
					objDraw.ptend.y = Y;
					
					if( (path.charCodeAt(idx+1)>=48 && path.charCodeAt(idx+1)<=57) || path[idx+1] == '-' ){
						
						cmd = "C";
						
					}
					else{
						cmd = null;
					}
					
				}
				
				else if(path[idx+1] == 'c' || cmd == 'c' ){
					
					objDraw.drawType = "BEZIER";
					objDraw.ptbeg.x = X;
					objDraw.ptbeg.y = Y;
					objDraw.ctrls = [];
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ctrls.push({
						x: objDraw.ptbeg.x+X,
						y: objDraw.ptbeg.y+Y
					})
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ctrls.push({
						x: objDraw.ptbeg.x+X,
						y: objDraw.ptbeg.y+Y
					})
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ptend.x = objDraw.ptbeg.x + X;
					objDraw.ptend.y = objDraw.ptbeg.y + Y;
					
					X = objDraw.ptend.x;
					Y = objDraw.ptend.y;
					
					
					if( (path.charCodeAt(idx+1)>=48 && path.charCodeAt(idx+1)<=57) || path[idx+1] == '-' ){
						
						cmd = "c";
						
					}
					else{
						cmd = null;
					}
					
				}
				
				else if(path[idx+1] == 'L' || cmd == 'L'){
					
					objDraw.drawType = "LINE";
					objDraw.ptbeg.x = X;
					objDraw.ptbeg.y = Y;
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ptend.x = X;
					objDraw.ptend.y = Y;
					
					if( (path.charCodeAt(idx+1)>=48 && path.charCodeAt(idx+1)<=57) || path[idx+1] == '-' ){
						
						cmd = "L";
						
					}
					else{
						cmd = null;
					}
					
				}
				
				else if(path[idx+1] == 'l' || cmd == 'l'){
					
					objDraw.drawType = "LINE";
					objDraw.ptbeg.x = X;
					objDraw.ptbeg.y = Y;
					
					o = parseFloat_(idx, path);
					X = o.num;
					idx = o.idx;
					o = parseFloat_(idx, path);
					Y = o.num;
					idx = o.idx;
					
					objDraw.ptend.x = objDraw.ptbeg.x + X;
					objDraw.ptend.y = objDraw.ptbeg.y + Y;
					
					X = objDraw.ptend.x;
					Y = objDraw.ptend.y;
					
					if((path.charCodeAt(idx+1)>=48 && path.charCodeAt(idx+1)<=57) || path[idx+1] == '-'){
						cmd = "l";
					}
					else{
						cmd = null;
					}
					
					
				}
				
				segmensts.push(objDraw);
				
				
			}
			
			drawsOut.push({
				drawType: "PATH",
				segments: segmensts
			});
			
		}
		
	}
	
}

function parseFloat_(idxstart, txt){
	
	let out = "";
	
	let isDot = false;
	
	while(true){
		
		if(idxstart>=txt.length){
			break;
		}
		
		if(out.length == 0 && txt[idxstart] == '-'){
			
			out+='-';
			
		}
		else if(  (txt.charCodeAt(idxstart)>=48 && txt.charCodeAt(idxstart)<=57) || txt.charCodeAt(idxstart)==46 ){
			
			if(txt.charCodeAt(idxstart)==46){
				
				if(isDot==true){
					break;
				}
				isDot = true;
			}
			
			out+=txt[idxstart];
			
		}
		else{
			if(out.length > 0){
				break;
			}
		}
		
		idxstart++;
		
	}
	
	return {
		num: parseFloat(out),
		idx: idxstart
	}
}

module.exports = {
	fgetch
}